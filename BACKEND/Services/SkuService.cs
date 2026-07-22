using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;
using ZXing;
using ZXing.Common;
using SkiaSharp;

namespace BACKEND.Services;

public class SkuService : ISkuService
{
    private readonly SmartLogAiContext _context;

    public SkuService(SmartLogAiContext context)
    {
        _context = context;
    }

    // Resolves userId=0 (built-in admin without DB record) to a valid DB userId or null
    private async Task<int?> ResolveUserIdAsync(int userId)
    {
        // If userId is valid and exists in DB, return it directly
        if (userId > 0 && await _context.Users.AnyAsync(u => u.UserId == userId))
            return userId;

        // Otherwise (userId=0 for built-in admin), find a real ADMIN user in DB
        var adminUser = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Role.RoleCode == "ADMIN" || u.Username == "admin");

        return adminUser?.UserId;
    }

    #region CRUD Operations

    public async Task<SkuPagedResult> GetAllAsync(SkuSearchRequest request)
    {
        var query = _context.Skus
            .Include(s => s.Category)
            .Include(s => s.Customer)
            .AsQueryable();

        // Default: only show active SKUs unless caller explicitly filters by isActive
        if (!request.IsActive.HasValue)
            query = query.Where(s => s.IsActive == true);

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            var searchTerm = request.Query.ToLower();
            query = query.Where(s =>
                s.Skucode.ToLower().Contains(searchTerm) ||
                (s.ProductName != null && s.ProductName.ToLower().Contains(searchTerm)) ||
                (s.Barcode != null && s.Barcode.ToLower().Contains(searchTerm)));
        }

        if (request.CategoryId.HasValue)
            query = query.Where(s => s.CategoryId == request.CategoryId);

        if (request.CustomerId.HasValue)
            query = query.Where(s => s.CustomerId == request.CustomerId);

        if (request.IsActive.HasValue)
            query = query.Where(s => s.IsActive == request.IsActive);

        if (request.IsFragile.HasValue)
            query = query.Where(s => s.IsFragile == request.IsFragile);

        if (request.IsHazmat.HasValue)
            query = query.Where(s => s.IsHazmat == request.IsHazmat);

        if (request.IsHeavy.HasValue)
            query = query.Where(s => s.IsHeavy == request.IsHeavy);

        // Get total count before pagination
        var totalCount = await query.CountAsync();

        // Apply sorting
        query = request.SortBy?.ToLower() switch
        {
            "skucode" => request.SortOrder?.ToLower() == "asc"
                ? query.OrderBy(s => s.Skucode)
                : query.OrderByDescending(s => s.Skucode),
            "productname" => request.SortOrder?.ToLower() == "asc"
                ? query.OrderBy(s => s.ProductName)
                : query.OrderByDescending(s => s.ProductName),
            "createdat" => request.SortOrder?.ToLower() == "asc"
                ? query.OrderBy(s => s.CreatedAt)
                : query.OrderByDescending(s => s.CreatedAt),
            _ => query.OrderByDescending(s => s.CreatedAt)
        };

        // Apply pagination
        var skip = (request.Page - 1) * request.PageSize;
        var items = await query
            .Skip(skip)
            .Take(request.PageSize)
            .Select(s => new SkuListDto
            {
                SkuId = s.Skuid,
                SkuCode = s.Skucode,
                Barcode = s.Barcode,
                QrCode = s.Qrcode,
                ProductName = s.ProductName,
                CategoryName = s.Category != null ? s.Category.CategoryName : null,
                CustomerName = s.Customer != null ? s.Customer.CompanyName : null,
                WeightKg = s.WeightKg,
                LengthCm = s.LengthCm,
                WidthCm = s.WidthCm,
                HeightCm = s.HeightCm,
                VolumeCbm = s.VolumeCbm,
                StorageTemp = s.StorageTemp,
                IsFragile = s.IsFragile ?? false,
                IsHazmat = s.IsHazmat ?? false,
                IsHeavy = s.IsHeavy ?? false,
                SafetyMinQty = s.SafetyMinQty ?? 0,
                ExpiryDays = s.ExpiryDays,
                IsActive = s.IsActive ?? true,
                CreatedAt = s.CreatedAt ?? DateTime.Now,
                TotalStock = null
            })
            .ToListAsync();

        return new SkuPagedResult
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }

    public async Task<SkuDetailDto?> GetByIdAsync(int id)
    {
        return await _context.Skus
            .Include(s => s.Category)
            .Include(s => s.Customer)
            .Where(s => s.Skuid == id)
            .Select(s => new SkuDetailDto
            {
                SkuId = s.Skuid,
                SkuCode = s.Skucode,
                Barcode = s.Barcode,
                QrCode = s.Qrcode,
                ProductName = s.ProductName,
                CategoryId = s.CategoryId,
                CategoryName = s.Category != null ? s.Category.CategoryName : null,
                CustomerId = s.CustomerId,
                CustomerName = s.Customer != null ? s.Customer.CompanyName : null,
                WeightKg = s.WeightKg,
                LengthCm = s.LengthCm,
                WidthCm = s.WidthCm,
                HeightCm = s.HeightCm,
                VolumeCbm = s.VolumeCbm,
                StorageTemp = s.StorageTemp,
                IsFragile = s.IsFragile ?? false,
                IsHazmat = s.IsHazmat ?? false,
                IsHeavy = s.IsHeavy ?? false,
                SafetyMinQty = s.SafetyMinQty ?? 0,
                SafetyDebounceH = s.SafetyDebounceH ?? 12,
                ExpiryDays = s.ExpiryDays,
                IsActive = s.IsActive ?? true,
                CreatedAt = s.CreatedAt ?? DateTime.Now,
                CreatedByName = s.Customer != null ? s.Customer.CompanyName : null
            })
            .FirstOrDefaultAsync();
    }

    public async Task<SkuDetailDto> CreateAsync(CreateSkuRequest request, int createdBy)
    {
        // Check for duplicate SKU code
        var existingSku = await _context.Skus
            .FirstOrDefaultAsync(s => s.Skucode == request.SkuCode);

        if (existingSku != null)
        {
            throw new InvalidOperationException($"SKU Code '{request.SkuCode}' already exists.");
        }

        // Check for duplicate barcode if provided
        if (!string.IsNullOrWhiteSpace(request.Barcode))
        {
            var existingBarcode = await _context.Skus
                .FirstOrDefaultAsync(s => s.Barcode == request.Barcode);

            if (existingBarcode != null)
            {
                throw new InvalidOperationException($"Barcode '{request.Barcode}' already exists for SKU '{existingBarcode.Skucode}'.");
            }
        }

        // Check for duplicate QR code if provided
        if (!string.IsNullOrWhiteSpace(request.QrCode))
        {
            var existingQr = await _context.Skus
                .FirstOrDefaultAsync(s => s.Qrcode == request.QrCode);

            if (existingQr != null)
            {
                throw new InvalidOperationException($"QR Code '{request.QrCode}' already exists for SKU '{existingQr.Skucode}'.");
            }
        }

        var sku = new Sku
        {
            Skucode = request.SkuCode,
            Barcode = request.Barcode,
            Qrcode = request.QrCode,
            ProductName = request.ProductName,
            CategoryId = request.CategoryId,
            CustomerId = request.CustomerId,
            WeightKg = request.WeightKg,
            LengthCm = request.LengthCm,
            WidthCm = request.WidthCm,
            HeightCm = request.HeightCm,
            StorageTemp = request.StorageTemp,
            IsFragile = request.IsFragile,
            IsHazmat = request.IsHazmat,
            IsHeavy = request.IsHeavy,
            SafetyMinQty = request.SafetyMinQty,
            SafetyDebounceH = request.SafetyDebounceH,
            ExpiryDays = request.ExpiryDays,
            IsActive = request.IsActive,
            CreatedAt = DateTime.Now
        };

        _context.Skus.Add(sku);
        await _context.SaveChangesAsync();

        // Add audit log (resolve userId=0 for built-in admin to avoid FK violation)
        var resolvedUserId = await ResolveUserIdAsync(createdBy);
        var auditLog = new AuditLog
        {
            UserId = resolvedUserId,
            Action = "CREATE",
            TableName = "SKUs",
            RecordId = sku.Skuid.ToString(),
            NewValue = $"Created SKU: {sku.Skucode}",
            LoggedAt = DateTime.Now
        };
        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(sku.Skuid))!;
    }

    public async Task<SkuDetailDto?> UpdateAsync(int id, UpdateSkuRequest request, int updatedBy)
    {
        var sku = await _context.Skus.FindAsync(id);
        if (sku == null)
            return null;

        // Check for duplicate barcode if being updated
        if (!string.IsNullOrWhiteSpace(request.Barcode) && request.Barcode != sku.Barcode)
        {
            var existingBarcode = await _context.Skus
                .FirstOrDefaultAsync(s => s.Barcode == request.Barcode && s.Skuid != id);

            if (existingBarcode != null)
            {
                throw new InvalidOperationException($"Barcode '{request.Barcode}' already exists for SKU '{existingBarcode.Skucode}'.");
            }
        }

        // Check for duplicate QR code if being updated
        if (!string.IsNullOrWhiteSpace(request.QrCode) && request.QrCode != sku.Qrcode)
        {
            var existingQr = await _context.Skus
                .FirstOrDefaultAsync(s => s.Qrcode == request.QrCode && s.Skuid != id);

            if (existingQr != null)
            {
                throw new InvalidOperationException($"QR Code '{request.QrCode}' already exists for SKU '{existingQr.Skucode}'.");
            }
        }

        // Update fields
        if (request.Barcode != null) sku.Barcode = request.Barcode;
        if (request.QrCode != null) sku.Qrcode = request.QrCode;
        if (request.ProductName != null) sku.ProductName = request.ProductName;
        if (request.CategoryId.HasValue) sku.CategoryId = request.CategoryId;
        if (request.CustomerId.HasValue) sku.CustomerId = request.CustomerId;
        if (request.WeightKg.HasValue) sku.WeightKg = request.WeightKg;
        if (request.LengthCm.HasValue) sku.LengthCm = request.LengthCm;
        if (request.WidthCm.HasValue) sku.WidthCm = request.WidthCm;
        if (request.HeightCm.HasValue) sku.HeightCm = request.HeightCm;
        if (request.StorageTemp != null) sku.StorageTemp = request.StorageTemp;
        if (request.IsFragile.HasValue) sku.IsFragile = request.IsFragile;
        if (request.IsHazmat.HasValue) sku.IsHazmat = request.IsHazmat;
        if (request.IsHeavy.HasValue) sku.IsHeavy = request.IsHeavy;
        if (request.SafetyMinQty.HasValue) sku.SafetyMinQty = request.SafetyMinQty;
        if (request.SafetyDebounceH.HasValue) sku.SafetyDebounceH = request.SafetyDebounceH;
        if (request.ExpiryDays.HasValue) sku.ExpiryDays = request.ExpiryDays;
        if (request.IsActive.HasValue) sku.IsActive = request.IsActive;

        await _context.SaveChangesAsync();

        // Add audit log (resolve userId=0 for built-in admin to avoid FK violation)
        var resolvedUpdatedBy = await ResolveUserIdAsync(updatedBy);
        var auditLog = new AuditLog
        {
            UserId = resolvedUpdatedBy,
            Action = "UPDATE",
            TableName = "SKUs",
            RecordId = sku.Skuid.ToString(),
            NewValue = $"Updated SKU: {sku.Skucode}",
            LoggedAt = DateTime.Now
        };
        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var sku = await _context.Skus.FindAsync(id);
        if (sku == null)
            return false;

        // Soft delete - just mark as inactive
        sku.IsActive = false;
        await _context.SaveChangesAsync();

        return true;
    }

    #endregion

    #region Search Operations

    public async Task<List<SkuListDto>> SearchAsync(string query)
    {
        var searchTerm = query.ToLower();
        return await _context.Skus
            .Include(s => s.Category)
            .Include(s => s.Customer)
            .Where(s =>
                (s.Skucode.ToLower().Contains(searchTerm) ||
                s.ProductName.ToLower().Contains(searchTerm) ||
                (s.Barcode != null && s.Barcode.ToLower().Contains(searchTerm))) &&
                s.IsActive == true)
            .Take(50)
            .Select(s => new SkuListDto
            {
                SkuId = s.Skuid,
                SkuCode = s.Skucode,
                Barcode = s.Barcode,
                QrCode = s.Qrcode,
                ProductName = s.ProductName,
                CategoryName = s.Category != null ? s.Category.CategoryName : null,
                CustomerName = s.Customer != null ? s.Customer.CompanyName : null,
                WeightKg = s.WeightKg,
                IsActive = s.IsActive ?? true,
                CreatedAt = s.CreatedAt ?? DateTime.Now
            })
            .ToListAsync();
    }

    public async Task<List<SkuListDto>> GetByBarcodeAsync(string barcode)
    {
        return await _context.Skus
            .Include(s => s.Category)
            .Include(s => s.Customer)
            .Where(s => s.Barcode == barcode || s.Qrcode == barcode)
            .Select(s => new SkuListDto
            {
                SkuId = s.Skuid,
                SkuCode = s.Skucode,
                Barcode = s.Barcode,
                QrCode = s.Qrcode,
                ProductName = s.ProductName,
                CategoryName = s.Category != null ? s.Category.CategoryName : null,
                CustomerName = s.Customer != null ? s.Customer.CompanyName : null,
                WeightKg = s.WeightKg,
                IsActive = s.IsActive ?? true,
                CreatedAt = s.CreatedAt ?? DateTime.Now
            })
            .ToListAsync();
    }

    public async Task<List<SkuListDto>> GetByCategoryAsync(int categoryId)
    {
        return await _context.Skus
            .Include(s => s.Category)
            .Include(s => s.Customer)
            .Where(s => s.CategoryId == categoryId && s.IsActive == true)
            .OrderBy(s => s.ProductName)
            .Select(s => new SkuListDto
            {
                SkuId = s.Skuid,
                SkuCode = s.Skucode,
                Barcode = s.Barcode,
                QrCode = s.Qrcode,
                ProductName = s.ProductName,
                CategoryName = s.Category != null ? s.Category.CategoryName : null,
                CustomerName = s.Customer != null ? s.Customer.CompanyName : null,
                WeightKg = s.WeightKg,
                IsActive = s.IsActive ?? true,
                CreatedAt = s.CreatedAt ?? DateTime.Now
            })
            .ToListAsync();
    }

    public async Task<List<SkuListDto>> GetByCustomerAsync(int customerId)
    {
        return await _context.Skus
            .Include(s => s.Category)
            .Include(s => s.Customer)
            .Where(s => s.CustomerId == customerId && s.IsActive == true)
            .OrderBy(s => s.ProductName)
            .Select(s => new SkuListDto
            {
                SkuId = s.Skuid,
                SkuCode = s.Skucode,
                Barcode = s.Barcode,
                QrCode = s.Qrcode,
                ProductName = s.ProductName,
                CategoryName = s.Category != null ? s.Category.CategoryName : null,
                CustomerName = s.Customer != null ? s.Customer.CompanyName : null,
                WeightKg = s.WeightKg,
                IsActive = s.IsActive ?? true,
                CreatedAt = s.CreatedAt ?? DateTime.Now
            })
            .ToListAsync();
    }

    #endregion

    #region Duplicate Check

    public async Task<CheckDuplicateResult> CheckDuplicateAsync(CheckDuplicateRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.SkuCode))
        {
            var existingSku = await _context.Skus
                .FirstOrDefaultAsync(s => s.Skucode == request.SkuCode);

            if (existingSku != null)
            {
                return new CheckDuplicateResult
                {
                    IsDuplicate = true,
                    DuplicateField = "SkuCode",
                    ExistingSkuId = existingSku.Skuid,
                    ExistingSkuCode = existingSku.Skucode
                };
            }
        }

        if (!string.IsNullOrWhiteSpace(request.Barcode))
        {
            var existingBarcode = await _context.Skus
                .FirstOrDefaultAsync(s => s.Barcode == request.Barcode);

            if (existingBarcode != null)
            {
                return new CheckDuplicateResult
                {
                    IsDuplicate = true,
                    DuplicateField = "Barcode",
                    ExistingSkuId = existingBarcode.Skuid,
                    ExistingSkuCode = existingBarcode.Skucode
                };
            }
        }

        if (!string.IsNullOrWhiteSpace(request.QrCode))
        {
            var existingQr = await _context.Skus
                .FirstOrDefaultAsync(s => s.Qrcode == request.QrCode);

            if (existingQr != null)
            {
                return new CheckDuplicateResult
                {
                    IsDuplicate = true,
                    DuplicateField = "QrCode",
                    ExistingSkuId = existingQr.Skuid,
                    ExistingSkuCode = existingQr.Skucode
                };
            }
        }

        return new CheckDuplicateResult { IsDuplicate = false };
    }

    #endregion

    #region Barcode/QR Generation

    public async Task<byte[]> GenerateBarcodeAsync(int skuId, int? width = null, int? height = null)
    {
        var sku = await _context.Skus.FindAsync(skuId);
        if (sku == null)
            throw new KeyNotFoundException($"SKU with ID {skuId} not found");

        var barcodeValue = sku.Barcode ?? sku.Skucode;
        if (string.IsNullOrWhiteSpace(barcodeValue))
            throw new InvalidOperationException("SKU must have a Barcode or SKU Code to generate barcode");

        var writer = new BarcodeWriter<SKBitmap>
        {
            Format = BarcodeFormat.CODE_128,
            Options = new EncodingOptions
            {
                Width = width ?? 300,
                Height = height ?? 100,
                Margin = 10,
                PureBarcode = false
            }
        };

        using var bitmap = writer.Write(barcodeValue);
        using var image = SKImage.FromBitmap(bitmap);
        using var data = image.Encode(SKEncodedImageFormat.Png, 100);
        return data.ToArray();
    }

    public async Task<byte[]> GenerateQrCodeAsync(int skuId, int? size = null)
    {
        var sku = await _context.Skus.FindAsync(skuId);
        if (sku == null)
            throw new KeyNotFoundException($"SKU with ID {skuId} not found");

        var qrValue = $"SKU:{sku.Skucode}|Name:{sku.ProductName}|Barcode:{sku.Barcode ?? "N/A"}";

        var writer = new BarcodeWriter<SKBitmap>
        {
            Format = BarcodeFormat.QR_CODE,
            Options = new EncodingOptions
            {
                Width = size ?? 200,
                Height = size ?? 200,
                Margin = 2
            }
        };

        using var bitmap = writer.Write(qrValue);
        using var image = SKImage.FromBitmap(bitmap);
        using var data = image.Encode(SKEncodedImageFormat.Png, 100);
        return data.ToArray();
    }

    #endregion

    #region Import/Export

    public async Task<SkuImportResult> ImportFromExcelAsync(IFormFile file, int createdBy)
    {
        var result = new SkuImportResult();
        var categories = await _context.ProductCategories.ToDictionaryAsync(c => c.CategoryName.ToLower(), c => c.CategoryId);
        var customers = await _context.Customers.ToDictionaryAsync(c => c.CompanyName.ToLower(), c => c.CustomerId);

        using var stream = file.OpenReadStream();
        using var workbook = new ClosedXML.Excel.XLWorkbook(stream);
        var worksheet = workbook.Worksheets.First();
        var rows = worksheet.RangeUsed()?.RowsUsed().Skip(1);

        if (rows == null) return result;

        foreach (var row in rows)
        {
            result.TotalRows++;
            var rowNumber = row.RowNumber();

            try
            {
                var skuCode = row.Cell(1).GetString();
                var productName = row.Cell(2).GetString();

                if (string.IsNullOrWhiteSpace(skuCode) || string.IsNullOrWhiteSpace(productName))
                {
                    result.Errors.Add(new SkuImportError
                    {
                        RowNumber = rowNumber,
                        SkuCode = skuCode,
                        ErrorMessage = "SKU Code and Product Name are required"
                    });
                    result.ErrorCount++;
                    continue;
                }

                // Check duplicate
                var existingSku = await _context.Skus.FirstOrDefaultAsync(s => s.Skucode == skuCode);
                if (existingSku != null)
                {
                    result.Errors.Add(new SkuImportError
                    {
                        RowNumber = rowNumber,
                        SkuCode = skuCode,
                        ErrorMessage = $"SKU Code '{skuCode}' already exists"
                    });
                    result.ErrorCount++;
                    continue;
                }

                // Get category ID
                int? categoryId = null;
                var categoryName = row.Cell(5).GetString();
                if (!string.IsNullOrWhiteSpace(categoryName) && categories.TryGetValue(categoryName.ToLower(), out var catId))
                {
                    categoryId = catId;
                }

                // Get customer ID
                int? customerId = null;
                var customerName = row.Cell(6).GetString();
                if (!string.IsNullOrWhiteSpace(customerName) && customers.TryGetValue(customerName.ToLower(), out var custId))
                {
                    customerId = custId;
                }

                var sku = new Sku
                {
                    Skucode = skuCode,
                    ProductName = productName,
                    Barcode = row.Cell(3).GetString(),
                    Qrcode = row.Cell(4).GetString(),
                    CategoryId = categoryId,
                    CustomerId = customerId,
                    WeightKg = row.Cell(7).GetValue<decimal?>(),
                    LengthCm = row.Cell(8).GetValue<decimal?>(),
                    WidthCm = row.Cell(9).GetValue<decimal?>(),
                    HeightCm = row.Cell(10).GetValue<decimal?>(),
                    StorageTemp = row.Cell(11).GetString(),
                    IsFragile = row.Cell(12).GetString()?.ToUpper() == "YES",
                    IsHazmat = row.Cell(13).GetString()?.ToUpper() == "YES",
                    IsHeavy = row.Cell(14).GetString()?.ToUpper() == "YES",
                    SafetyMinQty = row.Cell(15).GetValue<int?>(),
                    ExpiryDays = row.Cell(16).GetValue<int?>(),
                    IsActive = true,
                    CreatedAt = DateTime.Now
                };

                _context.Skus.Add(sku);
                result.SuccessCount++;
            }
            catch (Exception ex)
            {
                result.Errors.Add(new SkuImportError
                {
                    RowNumber = rowNumber,
                    ErrorMessage = ex.Message
                });
                result.ErrorCount++;
            }
        }

        if (result.SuccessCount > 0)
        {
            await _context.SaveChangesAsync();
        }

        return result;
    }

    public async Task<byte[]> ExportToExcelAsync(SkuSearchRequest? filter = null)
    {
        var request = filter ?? new SkuSearchRequest { Page = 1, PageSize = 10000 };
        request.Page = 1;
        request.PageSize = 10000;

        var skus = await GetAllAsync(request);

        using var workbook = new ClosedXML.Excel.XLWorkbook();
        var worksheet = workbook.Worksheets.Add("SKUs");

        // Header
        var headers = new[] { "SKU Code", "Product Name", "Barcode", "QR Code", "Category", "Customer",
            "Weight (kg)", "Length (cm)", "Width (cm)", "Height (cm)", "Storage Temp",
            "Fragile", "Hazmat", "Heavy", "Safety Min Qty", "Expiry Days", "Active", "Created Date" };

        for (int i = 0; i < headers.Length; i++)
        {
            worksheet.Cell(1, i + 1).Value = headers[i];
            worksheet.Cell(1, i + 1).Style.Font.Bold = true;
        }

        // Data
        for (int i = 0; i < skus.Items.Count; i++)
        {
            var sku = skus.Items[i];
            var row = i + 2;
            worksheet.Cell(row, 1).Value = sku.SkuCode;
            worksheet.Cell(row, 2).Value = sku.ProductName;
            worksheet.Cell(row, 3).Value = sku.Barcode;
            worksheet.Cell(row, 4).Value = sku.QrCode;
            worksheet.Cell(row, 5).Value = sku.CategoryName;
            worksheet.Cell(row, 6).Value = sku.CustomerName;
            worksheet.Cell(row, 7).Value = sku.WeightKg;
            worksheet.Cell(row, 8).Value = sku.LengthCm;
            worksheet.Cell(row, 9).Value = sku.WidthCm;
            worksheet.Cell(row, 10).Value = sku.HeightCm;
            worksheet.Cell(row, 11).Value = sku.StorageTemp;
            worksheet.Cell(row, 12).Value = sku.IsFragile ? "Yes" : "No";
            worksheet.Cell(row, 13).Value = sku.IsHazmat ? "Yes" : "No";
            worksheet.Cell(row, 14).Value = sku.IsHeavy ? "Yes" : "No";
            worksheet.Cell(row, 15).Value = sku.SafetyMinQty;
            worksheet.Cell(row, 16).Value = sku.ExpiryDays;
            worksheet.Cell(row, 17).Value = sku.IsActive ? "Yes" : "No";
            worksheet.Cell(row, 18).Value = sku.CreatedAt.ToString("yyyy-MM-dd HH:mm");
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    #endregion

    #region SKU Code Generation

    public async Task<string> GenerateSkuCodeAsync(string? categoryPrefix = null)
    {
        var prefix = string.IsNullOrWhiteSpace(categoryPrefix) ? "SKU" : categoryPrefix.ToUpper();
        var dateStr = DateTime.Now.ToString("yyyyMMdd");

        // Get the last SKU code with this prefix and date
        var lastSku = await _context.Skus
            .Where(s => s.Skucode.StartsWith($"{prefix}-{dateStr}"))
            .OrderByDescending(s => s.Skucode)
            .FirstOrDefaultAsync();

        int nextSeq = 1;
        if (lastSku != null)
        {
            var lastSeqStr = lastSku.Skucode.Split('-').LastOrDefault();
            if (int.TryParse(lastSeqStr, out var lastSeq))
            {
                nextSeq = lastSeq + 1;
            }
        }

        return $"{prefix}-{dateStr}-{nextSeq:D4}";
    }

    #endregion

    #region Validation

    public async Task<SkuValidationResult> ValidateAsync(CreateSkuRequest request)
    {
        var result = new SkuValidationResult { IsValid = true };

        if (string.IsNullOrWhiteSpace(request.SkuCode))
        {
            result.Errors.Add("SKU Code is required");
            result.IsValid = false;
        }

        if (string.IsNullOrWhiteSpace(request.ProductName))
        {
            result.Errors.Add("Product Name is required");
            result.IsValid = false;
        }

        if (request.ProductName?.Length > 300)
        {
            result.Errors.Add("Product Name cannot exceed 300 characters");
            result.IsValid = false;
        }

        // Check duplicate
        var duplicateCheck = await CheckDuplicateAsync(new CheckDuplicateRequest
        {
            SkuCode = request.SkuCode,
            Barcode = request.Barcode,
            QrCode = request.QrCode
        });

        if (duplicateCheck.IsDuplicate)
        {
            result.Errors.Add($"Duplicate {duplicateCheck.DuplicateField}: Already exists for SKU '{duplicateCheck.ExistingSkuCode}'");
            result.IsValid = false;
        }

        // Warnings
        if (request.WeightKg > 1000)
        {
            result.WarningMessage = "Weight exceeds 1000kg - please verify this is correct";
        }

        return result;
    }

    #endregion
}
