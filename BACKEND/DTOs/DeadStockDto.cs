namespace BACKEND.DTOs;

public class DeadStockDto
{
    public int Skuid { get; set; }
    public string Skucode { get; set; } = null!;
    public string ProductName { get; set; } = null!;
    public string CustomerName { get; set; } = null!;
    public string BinCode { get; set; } = null!;
    public string? WarehouseName { get; set; }
    public string? ZoneName { get; set; }
    public int Quantity { get; set; }
    public DateOnly? ExpiryDate { get; set; }
    public DateOnly? InboundDate { get; set; }
    public int DaysStored { get; set; }
    public int? DaysToExpiry { get; set; }
    public string AlertType { get; set; } = null!; // DEAD_STOCK or EXPIRY_SOON
    public int? DaysOverThreshold { get; set; }
    public string? Severity { get; set; } // CRITICAL, WARNING, NORMAL
}

public class DeadStockSummaryDto
{
    public int TotalDeadStock { get; set; }
    public int TotalExpiringSoon { get; set; }
    public int TotalCritical { get; set; }
    public int TotalWarning { get; set; }
    public int TotalQuantity { get; set; }
    public decimal TotalValue { get; set; }
    public List<DeadStockByWarehouseDto> ByWarehouse { get; set; } = new();
    public List<DeadStockByCustomerDto> ByCustomer { get; set; } = new();
}

public class DeadStockByWarehouseDto
{
    public string WarehouseName { get; set; } = null!;
    public int DeadStockCount { get; set; }
    public int ExpiringSoonCount { get; set; }
    public int TotalQuantity { get; set; }
}

public class DeadStockByCustomerDto
{
    public string CustomerName { get; set; } = null!;
    public int DeadStockCount { get; set; }
    public int ExpiringSoonCount { get; set; }
    public int TotalQuantity { get; set; }
}

public class FilterDeadStockDto
{
    public string? Skucode { get; set; }
    public string? ProductName { get; set; }
    public int? WarehouseId { get; set; }
    public int? ZoneId { get; set; }
    public int? BinId { get; set; }
    public int? CustomerId { get; set; }
    public DateOnly? InboundDateFrom { get; set; }
    public DateOnly? InboundDateTo { get; set; }
    public DateOnly? ExpiryDateFrom { get; set; }
    public DateOnly? ExpiryDateTo { get; set; }
    public int? MinDaysStored { get; set; }
    public int? MaxDaysStored { get; set; }
    public string? AlertType { get; set; } // DEAD_STOCK, EXPIRY_SOON, ALL
    public string? SortBy { get; set; } // DaysStored, ExpiryDate, Quantity, Skucode
    public string? SortOrder { get; set; } // ASC, DESC
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

public class DeadStockPagedResultDto
{
    public List<DeadStockDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}
