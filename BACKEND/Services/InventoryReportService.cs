using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Services;

public class InventoryReportService : IInventoryReportService
{
    private const string DeadStockType = "DEAD_STOCK";
    private const string ExpirySoonType = "EXPIRY_SOON";
    private const int DefaultDeadStockDays = 90;
    private const int DefaultExpiryWarningDays = 30;

    private readonly SmartLogAiContext _context;
    private readonly ILogger<InventoryReportService> _logger;
    private readonly IEmailService _emailService;

    public InventoryReportService(
        SmartLogAiContext context,
        ILogger<InventoryReportService> logger,
        IEmailService emailService)
    {
        _context = context;
        _logger = logger;
        _emailService = emailService;
    }

    public async Task<DeadStockPagedResultDto> GetDeadStockAsync(FilterDeadStockDto filter)
    {
        var deadStockDays = await GetDeadStockDaysAsync();
        var today = DateOnly.FromDateTime(DateTime.Now);

        // Query from Inventory
        var query = _context.Inventories
            .AsNoTracking()
            .Include(i => i.Sku)
                .ThenInclude(s => s!.Customer)
            .Include(i => i.Bin)
                .ThenInclude(b => b!.Shelf)
                    .ThenInclude(sh => sh!.Zone)
                        .ThenInclude(z => z!.Warehouse)
            .Where(i => i.Quantity > 0 && i.Sku != null && i.Sku.IsActive != false);

        // Get all items and filter in memory to avoid SQL DateDiffDay issues
        var allItems = await query.ToListAsync();

        var filteredItems = allItems
            .Where(i => i.InboundDate.HasValue &&
                        (today.DayNumber - i.InboundDate.Value.DayNumber) >= deadStockDays)
            .ToList();

        // Apply text filters
        if (!string.IsNullOrWhiteSpace(filter.Skucode))
            filteredItems = filteredItems.Where(i => i.Sku!.Skucode!.Contains(filter.Skucode)).ToList();

        if (!string.IsNullOrWhiteSpace(filter.ProductName))
            filteredItems = filteredItems.Where(i => i.Sku!.ProductName!.Contains(filter.ProductName)).ToList();

        if (filter.InboundDateFrom.HasValue)
            filteredItems = filteredItems.Where(i => i.InboundDate >= filter.InboundDateFrom).ToList();

        if (filter.InboundDateTo.HasValue)
            filteredItems = filteredItems.Where(i => i.InboundDate <= filter.InboundDateTo).ToList();

        if (filter.ExpiryDateFrom.HasValue)
            filteredItems = filteredItems.Where(i => i.ExpiryDate >= filter.ExpiryDateFrom).ToList();

        if (filter.ExpiryDateTo.HasValue)
            filteredItems = filteredItems.Where(i => i.ExpiryDate <= filter.ExpiryDateTo).ToList();

        if (filter.MinDaysStored.HasValue)
            filteredItems = filteredItems.Where(i => (today.DayNumber - i.InboundDate!.Value.DayNumber) >= filter.MinDaysStored).ToList();

        if (filter.MaxDaysStored.HasValue)
            filteredItems = filteredItems.Where(i => (today.DayNumber - i.InboundDate!.Value.DayNumber) <= filter.MaxDaysStored).ToList();

        // Apply sorting
        filteredItems = filter.SortBy?.ToLower() switch
        {
            "daysstored" => filter.SortOrder?.ToUpper() == "ASC"
                ? filteredItems.OrderBy(i => today.DayNumber - i.InboundDate!.Value.DayNumber).ToList()
                : filteredItems.OrderByDescending(i => today.DayNumber - i.InboundDate!.Value.DayNumber).ToList(),
            "quantity" => filter.SortOrder?.ToUpper() == "ASC"
                ? filteredItems.OrderBy(i => i.Quantity).ToList()
                : filteredItems.OrderByDescending(i => i.Quantity).ToList(),
            "expirydate" => filter.SortOrder?.ToUpper() == "ASC"
                ? filteredItems.OrderBy(i => i.ExpiryDate).ToList()
                : filteredItems.OrderByDescending(i => i.ExpiryDate).ToList(),
            _ => filteredItems.OrderByDescending(i => today.DayNumber - i.InboundDate!.Value.DayNumber).ToList()
        };

        var totalCount = filteredItems.Count;

        var pagedItems = filteredItems
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        return new DeadStockPagedResultDto
        {
            Items = pagedItems.Select(i => MapToDto(i, DeadStockType, today, deadStockDays, DefaultExpiryWarningDays)).ToList(),
            TotalCount = totalCount,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize
        };
    }

    public async Task<DeadStockPagedResultDto> GetExpiryStockAsync(FilterDeadStockDto filter)
    {
        var expiryWarningDays = await GetExpiryWarningDaysAsync();
        var today = DateOnly.FromDateTime(DateTime.Now);

        var query = _context.Inventories
            .AsNoTracking()
            .Include(i => i.Sku)
                .ThenInclude(s => s!.Customer)
            .Include(i => i.Bin)
                .ThenInclude(b => b!.Shelf)
                    .ThenInclude(sh => sh!.Zone)
                        .ThenInclude(z => z!.Warehouse)
            .Where(i => i.Quantity > 0 && i.Sku != null && i.Sku.IsActive != false);

        var allItems = await query.ToListAsync();

        var filteredItems = allItems
            .Where(i => i.ExpiryDate.HasValue &&
                        (i.ExpiryDate.Value.DayNumber - today.DayNumber) <= expiryWarningDays &&
                        (i.ExpiryDate.Value.DayNumber - today.DayNumber) >= 0)
            .ToList();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(filter.Skucode))
            filteredItems = filteredItems.Where(i => i.Sku!.Skucode!.Contains(filter.Skucode)).ToList();

        if (!string.IsNullOrWhiteSpace(filter.ProductName))
            filteredItems = filteredItems.Where(i => i.Sku!.ProductName!.Contains(filter.ProductName)).ToList();

        if (filter.ExpiryDateFrom.HasValue)
            filteredItems = filteredItems.Where(i => i.ExpiryDate >= filter.ExpiryDateFrom).ToList();

        if (filter.ExpiryDateTo.HasValue)
            filteredItems = filteredItems.Where(i => i.ExpiryDate <= filter.ExpiryDateTo).ToList();

        // Apply sorting
        filteredItems = filter.SortBy?.ToLower() switch
        {
            "daysstored" => filter.SortOrder?.ToUpper() == "ASC"
                ? filteredItems.OrderBy(i => i.ExpiryDate!.Value.DayNumber - today.DayNumber).ToList()
                : filteredItems.OrderByDescending(i => i.ExpiryDate!.Value.DayNumber - today.DayNumber).ToList(),
            "quantity" => filter.SortOrder?.ToUpper() == "ASC"
                ? filteredItems.OrderBy(i => i.Quantity).ToList()
                : filteredItems.OrderByDescending(i => i.Quantity).ToList(),
            "expirydate" => filter.SortOrder?.ToUpper() == "ASC"
                ? filteredItems.OrderBy(i => i.ExpiryDate).ToList()
                : filteredItems.OrderByDescending(i => i.ExpiryDate).ToList(),
            _ => filteredItems.OrderBy(i => i.ExpiryDate!.Value.DayNumber - today.DayNumber).ToList()
        };

        var totalCount = filteredItems.Count;

        var pagedItems = filteredItems
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        return new DeadStockPagedResultDto
        {
            Items = pagedItems.Select(i => MapToDto(i, ExpirySoonType, today, DefaultDeadStockDays, expiryWarningDays)).ToList(),
            TotalCount = totalCount,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize
        };
    }

    public async Task<DeadStockSummaryDto> GetSummaryAsync()
    {
        var deadStockDays = await GetDeadStockDaysAsync();
        var expiryWarningDays = await GetExpiryWarningDaysAsync();
        var today = DateOnly.FromDateTime(DateTime.Now);

        var inventoryQuery = _context.Inventories
            .AsNoTracking()
            .Include(i => i.Sku)
                .ThenInclude(s => s!.Customer)
            .Include(i => i.Bin)
                .ThenInclude(b => b!.Shelf)
                    .ThenInclude(sh => sh!.Zone)
                        .ThenInclude(z => z!.Warehouse)
            .Where(i => i.Quantity > 0 && i.Sku != null && i.Sku.IsActive != false);

        var allInventory = await inventoryQuery.ToListAsync();

        var deadStockItems = allInventory.Where(i =>
        {
            if (!i.InboundDate.HasValue) return false;
            var daysStored = today.DayNumber - i.InboundDate.Value.DayNumber;
            return daysStored >= deadStockDays;
        }).ToList();

        var expirySoonItems = allInventory.Where(i =>
        {
            if (!i.ExpiryDate.HasValue) return false;
            var daysToExpiry = i.ExpiryDate.Value.DayNumber - today.DayNumber;
            return daysToExpiry <= expiryWarningDays && daysToExpiry >= 0;
        }).ToList();

        var summary = new DeadStockSummaryDto
        {
            TotalDeadStock = deadStockItems.Count,
            TotalExpiringSoon = expirySoonItems.Count,
            TotalCritical = deadStockItems.Count(i =>
            {
                var daysStored = today.DayNumber - (i.InboundDate?.DayNumber ?? today.DayNumber);
                return daysStored >= deadStockDays * 1.5;
            }) + expirySoonItems.Count(i =>
            {
                var daysToExpiry = i.ExpiryDate!.Value.DayNumber - today.DayNumber;
                return daysToExpiry <= expiryWarningDays / 2;
            }),
            TotalWarning = deadStockItems.Count(i =>
            {
                var daysStored = today.DayNumber - (i.InboundDate?.DayNumber ?? today.DayNumber);
                return daysStored >= deadStockDays && daysStored < deadStockDays * 1.5;
            }) + expirySoonItems.Count(i =>
            {
                var daysToExpiry = i.ExpiryDate!.Value.DayNumber - today.DayNumber;
                return daysToExpiry > expiryWarningDays / 2 && daysToExpiry <= expiryWarningDays;
            }),
            TotalQuantity = deadStockItems.Sum(i => i.Quantity) + expirySoonItems.Sum(i => i.Quantity),
            TotalValue = 0
        };

        // Group by warehouse
        summary.ByWarehouse = allInventory
            .Where(i => deadStockItems.Any(d => d.InventoryId == i.InventoryId) ||
                        expirySoonItems.Any(e => e.InventoryId == i.InventoryId))
            .GroupBy(i => i.Bin?.Shelf?.Zone?.Warehouse?.WarehouseName ?? "Unknown")
            .Select(g => new DeadStockByWarehouseDto
            {
                WarehouseName = g.Key,
                DeadStockCount = g.Count(i => deadStockItems.Any(d => d.InventoryId == i.InventoryId)),
                ExpiringSoonCount = g.Count(i => expirySoonItems.Any(e => e.InventoryId == i.InventoryId)),
                TotalQuantity = g.Sum(i => i.Quantity)
            })
            .ToList();

        // Group by customer
        summary.ByCustomer = allInventory
            .Where(i => deadStockItems.Any(d => d.InventoryId == i.InventoryId) ||
                        expirySoonItems.Any(e => e.InventoryId == i.InventoryId))
            .GroupBy(i => i.Sku?.Customer?.CompanyName ?? "Unknown")
            .Select(g => new DeadStockByCustomerDto
            {
                CustomerName = g.Key,
                DeadStockCount = g.Count(i => deadStockItems.Any(d => d.InventoryId == i.InventoryId)),
                ExpiringSoonCount = g.Count(i => expirySoonItems.Any(e => e.InventoryId == i.InventoryId)),
                TotalQuantity = g.Sum(i => i.Quantity)
            })
            .ToList();

        return summary;
    }

    public async Task<int> ScanAndCreateAlertsAsync(bool forceResend = false, CancellationToken cancellationToken = default)
    {
        var now = DateTime.Now;
        var deadStockDays = await GetDeadStockDaysAsync();
        var expiryWarningDays = await GetExpiryWarningDaysAsync();
        var today = DateOnly.FromDateTime(now);

        var alertsCreated = 0;

        var inventoryQuery = _context.Inventories
            .AsNoTracking()
            .Include(i => i.Sku)
            .Where(i => i.Quantity > 0 && i.Sku != null);

        var inventoryItems = await inventoryQuery.ToListAsync(cancellationToken);

        foreach (var item in inventoryItems)
        {
            if (item.Sku == null) continue;

            var skuId = item.Sku.Skuid;
            var daysStored = item.InboundDate.HasValue
                ? today.DayNumber - item.InboundDate.Value.DayNumber
                : 0;
            var daysToExpiry = item.ExpiryDate.HasValue
                ? item.ExpiryDate.Value.DayNumber - today.DayNumber
                : int.MaxValue;

            // Check DEAD_STOCK
            if (daysStored >= deadStockDays)
            {
                var existingAlert = await _context.StockAlerts
                    .Where(a => a.Skuid == skuId && a.AlertType == DeadStockType &&
                                (a.IsResolved == false || a.IsResolved == null))
                    .FirstOrDefaultAsync(cancellationToken);

                if (existingAlert == null)
                {
                    _context.StockAlerts.Add(new StockAlert
                    {
                        Skuid = skuId,
                        AlertType = DeadStockType,
                        CurrentQty = item.Quantity,
                        IsResolved = false,
                        CreatedAt = now
                    });
                    alertsCreated++;
                }
            }

            // Check EXPIRY_SOON
            if (daysToExpiry <= expiryWarningDays && daysToExpiry >= 0)
            {
                var existingAlert = await _context.StockAlerts
                    .Where(a => a.Skuid == skuId && a.AlertType == ExpirySoonType &&
                                (a.IsResolved == false || a.IsResolved == null))
                    .FirstOrDefaultAsync(cancellationToken);

                if (existingAlert == null)
                {
                    _context.StockAlerts.Add(new StockAlert
                    {
                        Skuid = skuId,
                        AlertType = ExpirySoonType,
                        CurrentQty = item.Quantity,
                        IsResolved = false,
                        CreatedAt = now
                    });
                    alertsCreated++;
                }
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Dead stock scan completed: {Count} new alerts created",
            alertsCreated);

        return alertsCreated;
    }

    public async Task<List<DeadStockDto>> GetDeadAndExpiryStockAsync(string? alertType = null)
    {
        var filter = new FilterDeadStockDto
        {
            AlertType = alertType ?? "ALL",
            PageSize = 1000
        };

        var deadStockResult = await GetDeadStockAsync(filter);
        var expiryResult = await GetExpiryStockAsync(filter);

        var results = deadStockResult.Items.Concat(expiryResult.Items).ToList();

        if (alertType == DeadStockType)
            return deadStockResult.Items;
        if (alertType == ExpirySoonType)
            return expiryResult.Items;

        return results;
    }

    private DeadStockDto MapToDto(Inventory inventory, string alertType, DateOnly today, int deadStockDays, int expiryWarningDays)
    {
        var daysStored = inventory.InboundDate.HasValue
            ? today.DayNumber - inventory.InboundDate.Value.DayNumber
            : 0;
        var daysToExpiry = inventory.ExpiryDate.HasValue
            ? inventory.ExpiryDate.Value.DayNumber - today.DayNumber
            : (int?)null;

        var daysOverThreshold = alertType == DeadStockType && daysStored >= deadStockDays
            ? daysStored - deadStockDays
            : 0;

        string severity;
        if (alertType == DeadStockType)
        {
            severity = daysStored >= deadStockDays * 1.5 ? "CRITICAL" :
                       daysStored >= deadStockDays ? "WARNING" : "NORMAL";
        }
        else
        {
            severity = daysToExpiry.HasValue && daysToExpiry <= expiryWarningDays / 2 ? "CRITICAL" :
                       daysToExpiry.HasValue && daysToExpiry <= expiryWarningDays ? "WARNING" : "NORMAL";
        }

        return new DeadStockDto
        {
            Skuid = inventory.Skuid,
            Skucode = inventory.Sku?.Skucode ?? "N/A",
            ProductName = inventory.Sku?.ProductName ?? "N/A",
            CustomerName = inventory.Sku?.Customer?.CompanyName ?? "N/A",
            BinCode = inventory.Bin?.BinCode ?? "N/A",
            WarehouseName = inventory.Bin?.Shelf?.Zone?.Warehouse?.WarehouseName,
            ZoneName = inventory.Bin?.Shelf?.Zone?.ZoneName,
            Quantity = inventory.Quantity,
            ExpiryDate = inventory.ExpiryDate,
            InboundDate = inventory.InboundDate,
            DaysStored = daysStored,
            DaysToExpiry = daysToExpiry,
            AlertType = alertType,
            DaysOverThreshold = daysOverThreshold,
            Severity = severity
        };
    }

    private async Task<int> GetDeadStockDaysAsync()
    {
        var param = await _context.Aiparameters
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.ParamKey == "DEAD_STOCK_DAYS");

        if (param != null && int.TryParse(param.ParamValue, out var days) && days > 0)
            return days;

        return DefaultDeadStockDays;
    }

    private async Task<int> GetExpiryWarningDaysAsync()
    {
        var param = await _context.Aiparameters
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.ParamKey == "EXPIRY_WARNING_DAYS");

        if (param != null && int.TryParse(param.ParamValue, out var days) && days > 0)
            return days;

        return DefaultExpiryWarningDays;
    }
}
