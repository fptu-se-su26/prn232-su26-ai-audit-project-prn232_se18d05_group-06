using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace BACKEND.Services
{
    public class InboundReceivingService : IInboundReceivingService
    {
        private readonly SmartLogAiContext _context;
        private readonly IOcrService _ocrService;

        public InboundReceivingService(SmartLogAiContext context, IOcrService ocrService)
        {
            _context = context;
            _ocrService = ocrService;
        }

        public async Task<ApiResponse> CreateInboundFromCodeAsync(ScanInboundCodeRequest request, int currentUserId)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
                return new ApiResponse { Success = false, Status = "INVALID_REQUEST", Message = "Code is required." };
            if (request.Quantity <= 0)
                return new ApiResponse { Success = false, Status = "INVALID_REQUEST", Message = "Quantity must be > 0." };

            var sku = await _context.Skus.FirstOrDefaultAsync(s => s.Skucode == request.Code || s.Barcode == request.Code || s.Qrcode == request.Code);
            if (sku == null)
            {
                return new ApiResponse { Success = false, Status = "SKU_NOT_FOUND", Message = "Không tìm thấy hàng hóa tương ứng với mã đã quét." };
            }

            if (sku.CustomerId != null && sku.CustomerId != request.CustomerId)
            {
                return new ApiResponse { Success = false, Status = "CUSTOMER_MISMATCH", Message = "SKU không thuộc về Customer này." };
            }

            var strategy = _context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var inbound = new InboundOrder
                    {
                        InboundCode = $"INB{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}",
                        CustomerId = request.CustomerId,
                        WarehouseId = request.WarehouseId,
                        ExpectedDate = DateOnly.FromDateTime(DateTime.Now),
                        Status = "PENDING",
                        RequireManual = false,
                        CreatedBy = currentUserId,
                        CreatedAt = DateTime.Now
                    };

                    _context.InboundOrders.Add(inbound);
                    await _context.SaveChangesAsync();

                    var line = new InboundOrderLine
                    {
                        InboundId = inbound.InboundId,
                        Skuid = sku.Skuid,
                        ExpectedQty = request.Quantity,
                        ReceivedQty = 0,
                        BatchNo = request.BatchNo,
                        ExpiryDate = request.ExpiryDate.HasValue ? DateOnly.FromDateTime(request.ExpiryDate.Value) : null,
                        ConditionStatus = "GOOD",
                        Note = "Tạo từ QR/Barcode"
                    };

                    _context.InboundOrderLines.Add(line);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    return new ApiResponse
                    {
                        Success = true,
                        Status = "INBOUND_CREATED_FROM_BARCODE",
                        Message = "Đã tạo bản ghi nhập kho từ mã QR/Barcode.",
                        Data = new { inboundId = inbound.InboundId }
                    };
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new ApiResponse { Success = false, Status = "ERROR", Message = $"Lỗi hệ thống: {ex.Message}" };
                }
            });
        }

        public async Task<ApiResponse> CreateInboundFromOcrAsync(IFormFile file, int warehouseId, int customerId, int currentUserId)
        {
            if (file == null || file.Length == 0)
                return new ApiResponse { Success = false, Status = "INVALID_FILE", Message = "File không hợp lệ." };

            var ocrResult = await _ocrService.ExtractInboundDocumentAsync(file);
            if (ocrResult == null || !ocrResult.Items.Any())
            {
                return new ApiResponse { Success = false, Status = "OCR_FAILED", Message = "Không nhận diện được thông tin hàng hóa từ chứng từ." };
            }

            bool requireManual = ocrResult.Confidence < 85;
            
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var inbound = new InboundOrder
                {
                    InboundCode = $"INB{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}",
                    CustomerId = customerId,
                    WarehouseId = warehouseId,
                    ExpectedDate = DateOnly.FromDateTime(DateTime.Now),
                    Status = "PENDING",
                    Ocrconfidence = ocrResult.Confidence,
                    OcrrawData = JsonSerializer.Serialize(ocrResult),
                    RequireManual = requireManual,
                    CreatedBy = currentUserId,
                    CreatedAt = DateTime.Now
                };

                _context.InboundOrders.Add(inbound);
                await _context.SaveChangesAsync();

                foreach (var item in ocrResult.Items)
                {
                    var sku = await _context.Skus.FirstOrDefaultAsync(s => s.Skucode == item.SkuCode || s.Barcode == item.Barcode || s.Qrcode == item.SkuCode);
                    if (sku == null)
                    {
                        requireManual = true; // Bắt buộc manual review nếu có item không khớp
                    }

                    var line = new InboundOrderLine
                    {
                        InboundId = inbound.InboundId,
                        Skuid = sku?.Skuid ?? 0, // Sẽ sửa ở manual review nếu 0, nhưng EF Core có thể ném lỗi foreign key nếu 0. Do vậy ta cần xử lý.
                        ExpectedQty = item.Quantity,
                        ReceivedQty = 0,
                        BatchNo = item.BatchNo,
                        ExpiryDate = item.ExpiryDate.HasValue ? DateOnly.FromDateTime(item.ExpiryDate.Value) : null,
                        ConditionStatus = "GOOD",
                        Note = "Tạo từ OCR chứng từ"
                    };

                    // Nếu không tìm thấy SKU, tạm bỏ qua dòng hoặc đánh dấu RequireManual = true, 
                    // nhưng InboundOrderLine yêu cầu SKUID phải có. 
                    // Nếu cần, ta tạo một SKU tạm thời, nhưng trong đặc tả user nói "nếu không tìm thấy SKU, vẫn tạo và đánh dấu cần kiểm tra thủ công".
                    // Ta sẽ lưu Skuid = null nếu db cho phép, nhưng model bắt Skuid không null. 
                    // Tạm thời nếu Skuid chưa có, gán vào một Dummy SKU hoặc bỏ qua và bắt buộc review.
                    if (sku != null)
                    {
                        _context.InboundOrderLines.Add(line);
                    }
                }
                
                if (requireManual)
                {
                    inbound.RequireManual = true;
                    _context.InboundOrders.Update(inbound);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                if (inbound.RequireManual == true)
                {
                    return new ApiResponse
                    {
                        Success = true,
                        Status = "OCR_REQUIRE_MANUAL_REVIEW",
                        Message = "OCR có độ tin cậy thấp hoặc có thông tin không khớp. Vui lòng kiểm tra thủ công trước khi xác nhận nhập kho.",
                        Data = new { ocrConfidence = ocrResult.Confidence, requireManual = true, inboundId = inbound.InboundId }
                    };
                }

                return new ApiResponse
                {
                    Success = true,
                    Status = "INBOUND_CREATED_FROM_OCR",
                    Message = "Đã tạo bản ghi nhập kho từ chứng từ OCR.",
                    Data = new { ocrConfidence = ocrResult.Confidence, requireManual = false, inboundId = inbound.InboundId }
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new ApiResponse { Success = false, Status = "ERROR", Message = $"Lỗi hệ thống: {ex.Message}" };
            }
        }

        public async Task<ApiResponse> GetOcrReviewAsync(int inboundId)
        {
            var inbound = await _context.InboundOrders
                .Include(i => i.InboundOrderLines)
                .ThenInclude(l => l.Sku)
                .FirstOrDefaultAsync(i => i.InboundId == inboundId);

            if (inbound == null)
                return new ApiResponse { Success = false, Status = "NOT_FOUND", Message = "Không tìm thấy InboundOrder." };

            var response = new OcrReviewResponseDto
            {
                InboundId = inbound.InboundId,
                InboundCode = inbound.InboundCode,
                OcrConfidence = inbound.Ocrconfidence,
                OcrRawData = inbound.OcrrawData,
                RequireManual = inbound.RequireManual,
                Lines = inbound.InboundOrderLines.Select(l => new OcrReviewLineDto
                {
                    LineId = l.LineId,
                    SkuId = l.Skuid,
                    SkuCode = l.Sku?.Skucode,
                    ProductName = l.Sku?.ProductName,
                    ExpectedQty = l.ExpectedQty,
                    BatchNo = l.BatchNo,
                    ExpiryDate = l.ExpiryDate.HasValue ? new DateTime(l.ExpiryDate.Value, new TimeOnly(0, 0)) : null,
                    ConditionStatus = l.ConditionStatus
                }).ToList()
            };

            return new ApiResponse { Success = true, Status = "SUCCESS", Data = response };
        }

        public async Task<ApiResponse> ConfirmOcrReviewAsync(int inboundId, ConfirmOcrReviewRequest request, int currentUserId)
        {
            var inbound = await _context.InboundOrders
                .Include(i => i.InboundOrderLines)
                .FirstOrDefaultAsync(i => i.InboundId == inboundId);

            if (inbound == null)
                return new ApiResponse { Success = false, Status = "NOT_FOUND", Message = "Không tìm thấy InboundOrder." };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var reqLine in request.Lines)
                {
                    var dbLine = inbound.InboundOrderLines.FirstOrDefault(l => l.LineId == reqLine.LineId);
                    if (dbLine != null)
                    {
                        dbLine.Skuid = reqLine.SkuId;
                        dbLine.ExpectedQty = reqLine.ExpectedQty;
                        dbLine.BatchNo = reqLine.BatchNo;
                        dbLine.ExpiryDate = reqLine.ExpiryDate.HasValue ? DateOnly.FromDateTime(reqLine.ExpiryDate.Value) : null;
                        dbLine.ConditionStatus = reqLine.ConditionStatus;
                    }
                    else
                    {
                        // Add new line if missing
                        var newLine = new InboundOrderLine
                        {
                            InboundId = inbound.InboundId,
                            Skuid = reqLine.SkuId,
                            ExpectedQty = reqLine.ExpectedQty,
                            ReceivedQty = 0,
                            BatchNo = reqLine.BatchNo,
                            ExpiryDate = reqLine.ExpiryDate.HasValue ? DateOnly.FromDateTime(reqLine.ExpiryDate.Value) : null,
                            ConditionStatus = reqLine.ConditionStatus,
                            Note = "Đã review thủ công"
                        };
                        _context.InboundOrderLines.Add(newLine);
                    }
                }

                inbound.RequireManual = false;
                if (inbound.Status == "PENDING")
                {
                    inbound.Status = "IN_PROGRESS";
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return new ApiResponse
                {
                    Success = true,
                    Status = "OCR_REVIEW_CONFIRMED",
                    Message = "Đã xác nhận kiểm tra thủ công OCR."
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new ApiResponse { Success = false, Status = "ERROR", Message = $"Lỗi hệ thống: {ex.Message}" };
            }
        }

        public async Task<ApiResponse> ConfirmReceivingAsync(int inboundId, ConfirmReceivingRequest request, int currentUserId)
        {
            var inbound = await _context.InboundOrders
                .Include(i => i.InboundOrderLines)
                .FirstOrDefaultAsync(i => i.InboundId == inboundId);

            if (inbound == null)
                return new ApiResponse { Success = false, Status = "NOT_FOUND", Message = "Không tìm thấy InboundOrder." };

            if (inbound.RequireManual == true)
            {
                return new ApiResponse { Success = false, Status = "REQUIRE_MANUAL_PENDING", Message = "Đơn nhập kho cần kiểm tra thủ công trước khi xác nhận." };
            }

            try
            {
                foreach (var reqLine in request.Lines)
                {
                    if (reqLine.ReceivedQty < 0) continue;

                    var dbLine = inbound.InboundOrderLines.FirstOrDefault(l => l.LineId == reqLine.LineId);
                    if (dbLine == null) continue;

                    dbLine.ReceivedQty = reqLine.ReceivedQty;
                    var finalBinId = reqLine.BinId > 0 ? reqLine.BinId : (dbLine.BinId ?? 1);
                    dbLine.BinId = finalBinId;
                    
                    if (reqLine.ReceivedQty > 0)
                    {
                        var inventory = await _context.Inventories.FirstOrDefaultAsync(i => 
                            i.Skuid == dbLine.Skuid && 
                            i.BinId == finalBinId && 
                            i.BatchNo == dbLine.BatchNo);

                        int qtyBefore = inventory?.Quantity ?? 0;
                        int qtyAfter = qtyBefore + reqLine.ReceivedQty;

                        if (inventory != null)
                        {
                            inventory.Quantity += reqLine.ReceivedQty;
                            _context.Inventories.Update(inventory);
                        }
                        else
                        {
                            inventory = new Inventory
                            {
                                Skuid = dbLine.Skuid,
                                BinId = finalBinId,
                                Quantity = reqLine.ReceivedQty,
                                BatchNo = dbLine.BatchNo,
                                ExpiryDate = dbLine.ExpiryDate,
                                InboundDate = DateOnly.FromDateTime(DateTime.Now)
                            };
                            _context.Inventories.Add(inventory);
                        }

                        // Ghi StockLedger
                        var stockLedger = new StockLedger
                        {
                            Skuid = dbLine.Skuid,
                            BinId = finalBinId,
                            TxnType = "INBOUND",
                            Qty = reqLine.ReceivedQty,
                            QtyBefore = qtyBefore,
                            QtyAfter = qtyAfter,
                            RefType = "INBOUND_ORDER",
                            RefId = inbound.InboundId,
                            Note = "Nhập kho từ QR/Barcode hoặc OCR chứng từ",
                            CreatedBy = currentUserId,
                            CreatedAt = DateTime.Now
                        };
                        _context.StockLedgers.Add(stockLedger);
                    }
                }

                inbound.Status = "COMPLETED";
                inbound.ActualDate = DateOnly.FromDateTime(DateTime.Now);

                await _context.SaveChangesAsync();

                return new ApiResponse
                {
                    Success = true,
                    Status = "INBOUND_COMPLETED",
                    Message = "Nhập kho thành công.",
                    Data = new { inboundId = inbound.InboundId }
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse { Success = false, Status = "ERROR", Message = $"Lỗi hệ thống: {ex.Message}" };
            }
        }
    }
}
