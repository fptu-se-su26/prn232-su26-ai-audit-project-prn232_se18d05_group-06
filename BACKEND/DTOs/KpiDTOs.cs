namespace BACKEND.DTOs;

public class KpiDashboardDto
{
    public KpiOverviewDto Overview { get; set; } = new();
    public KpiWarehouseDto Warehouse { get; set; } = new();
    public KpiDispatcherDto Dispatcher { get; set; } = new();
    public KpiFinanceDto Finance { get; set; } = new();
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}

public class KpiOverviewDto
{
    public int TotalOrders { get; set; }
    public int PendingOrders { get; set; }
    public int CompletedOrders { get; set; }
    public int TotalVehicles { get; set; }
    public int ActiveVehicles { get; set; }
    public int TotalSkus { get; set; }
    public int TotalWarehouses { get; set; }
    public int TotalCustomers { get; set; }
    public decimal OrderCompletionRate { get; set; }
    public List<KpiTrendItem> OrderTrend { get; set; } = new();
}

public class KpiWarehouseDto
{
    public int TotalInventoryItems { get; set; }
    public int TotalBins { get; set; }
    public int OccupiedBins { get; set; }
    public decimal UtilizationRate { get; set; }
    public int InboundToday { get; set; }
    public int InboundThisWeek { get; set; }
    public int InboundThisMonth { get; set; }
    public int OutboundToday { get; set; }
    public int OutboundThisWeek { get; set; }
    public int OutboundThisMonth { get; set; }
    public int DeadStockCount { get; set; }
    public int ExpirySoonCount { get; set; }
    public int CriticalExpiryCount { get; set; }
    public List<KpiTrendItem> InventoryTrend { get; set; } = new();
    public List<KpiZoneUtilization> ZoneUtilization { get; set; } = new();
}

public class KpiDispatcherDto
{
    public int TotalVehiclesInWarehouse { get; set; }
    public int ScheduledToday { get; set; }
    public int WaitingVehicles { get; set; }
    public int ProcessingVehicles { get; set; }
    public int CompletedToday { get; set; }
    public double AvgWaitingMinutes { get; set; }
    public int AvailableDocks { get; set; }
    public int OccupiedDocks { get; set; }
    public int CheckInToday { get; set; }
    public int CheckOutToday { get; set; }
    public List<KpiTrendItem> VehicleTrend { get; set; } = new();
    public List<KpiDockStatus> DockStatus { get; set; } = new();
}

public class KpiFinanceDto
{
    public decimal TodayRevenue { get; set; }
    public decimal ThisWeekRevenue { get; set; }
    public decimal ThisMonthRevenue { get; set; }
    public decimal ThisYearRevenue { get; set; }
    public decimal TodayExpense { get; set; }
    public decimal ThisWeekExpense { get; set; }
    public decimal ThisMonthExpense { get; set; }
    public decimal ThisYearExpense { get; set; }
    public decimal TodayProfit { get; set; }
    public decimal ThisMonthProfit { get; set; }
    public decimal ThisYearProfit { get; set; }
    public decimal TotalReceivable { get; set; }
    public decimal TotalPayable { get; set; }
    public decimal UnpaidInvoices { get; set; }
    public int PendingPayments { get; set; }
    public decimal PaymentRate { get; set; }
    public List<KpiTrendItem> RevenueTrend { get; set; } = new();
    public List<KpiTrendItem> ExpenseTrend { get; set; } = new();
}

public class KpiTrendItem
{
    public string Label { get; set; } = string.Empty;
    public decimal Value { get; set; }
}

public class KpiZoneUtilization
{
    public string ZoneCode { get; set; } = string.Empty;
    public string ZoneName { get; set; } = string.Empty;
    public int TotalBins { get; set; }
    public int UsedBins { get; set; }
    public decimal UtilizationRate { get; set; }
}

public class KpiDockStatus
{
    public string DockCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int? VehicleId { get; set; }
    public string? PlateNumber { get; set; }
    public DateTime? CheckInAt { get; set; }
}

public class KpiExportDto
{
    public string Format { get; set; } = "excel";
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public string ReportType { get; set; } = "full";
}
