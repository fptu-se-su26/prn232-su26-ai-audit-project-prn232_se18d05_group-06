using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;
using ClosedXML.Excel;

namespace BACKEND.Services;

public class KpiService : IKpiService
{
    private readonly SmartLogAiContext _context;
    private readonly ILogger<KpiService> _logger;

    public KpiService(SmartLogAiContext context, ILogger<KpiService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<KpiDashboardDto> GetDashboardKpisAsync()
    {
        // NOTE: Cannot run these in parallel — DbContext is not thread-safe.
        var overview = await GetOverviewKpisAsync();
        var warehouse = await GetWarehouseKpisAsync();
        var dispatcher = await GetDispatcherKpisAsync();
        var finance = await GetFinanceKpisAsync();

        return new KpiDashboardDto
        {
            Overview = overview,
            Warehouse = warehouse,
            Dispatcher = dispatcher,
            Finance = finance,
            GeneratedAt = DateTime.UtcNow
        };
    }

    public async Task<KpiOverviewDto> GetOverviewKpisAsync()
    {
        var today = DateTime.UtcNow.Date;

        var totalOrders = await _context.ServiceOrders.CountAsync();
        var completedOrders = await _context.ServiceOrders
            .CountAsync(o => o.Status == "Completed" || o.Status == "HoanThanh" || o.Status == "Delivered");
        var pendingOrders = await _context.ServiceOrders
            .CountAsync(o => o.Status == "Pending" || o.Status == "ChoXuLy" || o.Status == "Confirmed");

        var totalVehicles = await _context.Vehicles.CountAsync();
        var activeVehicles = await _context.Vehicles
            .CountAsync(v => v.Status == "Active" || v.Status == "DangHoatDong");
        var totalSkus = await _context.Skus.CountAsync();
        var totalWarehouses = await _context.Warehouses.CountAsync();
        var totalCustomers = await _context.Customers.CountAsync();

        var completionRate = totalOrders > 0 ? (decimal)completedOrders / totalOrders * 100 : 0;

        var orderTrend = new List<KpiTrendItem>();
        for (int i = 6; i >= 0; i--)
        {
            var date = today.AddDays(-i);
            var count = await _context.ServiceOrders
                .CountAsync(o => o.CreatedAt.HasValue && o.CreatedAt.Value.Date == date);
            orderTrend.Add(new KpiTrendItem
            {
                Label = date.ToString("ddd"),
                Value = count
            });
        }

        return new KpiOverviewDto
        {
            TotalOrders = totalOrders,
            PendingOrders = pendingOrders,
            CompletedOrders = completedOrders,
            TotalVehicles = totalVehicles,
            ActiveVehicles = activeVehicles,
            TotalSkus = totalSkus,
            TotalWarehouses = totalWarehouses,
            TotalCustomers = totalCustomers,
            OrderCompletionRate = Math.Round(completionRate, 2),
            OrderTrend = orderTrend
        };
    }

    public async Task<KpiWarehouseDto> GetWarehouseKpisAsync()
    {
        var today = DateTime.UtcNow.Date;
        var todayDateOnly = DateOnly.FromDateTime(today);
        var weekStartDateOnly = DateOnly.FromDateTime(today.AddDays(-(int)today.DayOfWeek));
        var monthStartDateOnly = DateOnly.FromDateTime(new DateTime(today.Year, today.Month, 1));

        var totalInventoryItems = await _context.Inventories.SumAsync(i => i.Quantity);
        var totalBins = await _context.WarehouseBins.CountAsync();
        var occupiedBins = await _context.Inventories.Select(i => i.BinId).Distinct().CountAsync();
        var utilizationRate = totalBins > 0 ? (decimal)occupiedBins / totalBins * 100 : 0;

        var inboundToday = await _context.InboundOrders
            .CountAsync(i => i.ActualDate.HasValue && i.ActualDate.Value == todayDateOnly);
        var inboundThisWeek = await _context.InboundOrders
            .CountAsync(i => i.ActualDate.HasValue && i.ActualDate.Value >= weekStartDateOnly);
        var inboundThisMonth = await _context.InboundOrders
            .CountAsync(i => i.ActualDate.HasValue && i.ActualDate.Value >= monthStartDateOnly);

        var outboundToday = await _context.OutboundOrders
            .CountAsync(o => o.CompletedAt.HasValue && o.CompletedAt.Value.Date == today);
        var outboundThisWeek = await _context.OutboundOrders
            .CountAsync(o => o.CompletedAt.HasValue && o.CompletedAt.Value.Date >= today.AddDays(-(int)today.DayOfWeek));
        var outboundThisMonth = await _context.OutboundOrders
            .CountAsync(o => o.CompletedAt.HasValue && o.CompletedAt.Value.Date >= new DateTime(today.Year, today.Month, 1));

        var deadStockDays = 90;
        var expirySoonDays = 30;
        var criticalDays = 7;

        var deadStockCutoff = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-deadStockDays));
        var expirySoonCutoff = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(expirySoonDays));
        var criticalCutoff = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(criticalDays));

        var deadStockCount = await _context.Inventories
            .CountAsync(i => i.InboundDate.HasValue && i.InboundDate.Value < deadStockCutoff);

        var expirySoonCount = await _context.Inventories
            .CountAsync(i => i.ExpiryDate.HasValue &&
                i.ExpiryDate.Value > DateOnly.FromDateTime(DateTime.UtcNow) &&
                i.ExpiryDate.Value <= expirySoonCutoff);

        var criticalExpiryCount = await _context.Inventories
            .CountAsync(i => i.ExpiryDate.HasValue &&
                i.ExpiryDate.Value >= DateOnly.FromDateTime(DateTime.UtcNow) &&
                i.ExpiryDate.Value <= criticalCutoff);

        var zones = await _context.WarehouseZones.ToListAsync();
        var zoneUtilization = zones.Select(z =>
        {
            var totalBinsInZone = _context.WarehouseShelves
                .Where(s => s.ZoneId == z.ZoneId)
                .SelectMany(s => s.WarehouseBins)
                .Count();
            var usedBinsInZone = _context.WarehouseShelves
                .Where(s => s.ZoneId == z.ZoneId)
                .SelectMany(s => s.WarehouseBins)
                .Count(b => b.Inventories.Any());
            return new KpiZoneUtilization
            {
                ZoneCode = z.ZoneCode ?? "",
                ZoneName = z.ZoneName ?? "",
                TotalBins = totalBinsInZone,
                UsedBins = usedBinsInZone,
                UtilizationRate = totalBinsInZone > 0 ? (decimal)usedBinsInZone / totalBinsInZone * 100 : 0
            };
        }).ToList();

        var inventoryTrend = new List<KpiTrendItem>();
        for (int i = 6; i >= 0; i--)
        {
            var date = DateOnly.FromDateTime(today.AddDays(-i));
            var count = await _context.InboundOrders
                .CountAsync(o => o.ActualDate.HasValue && o.ActualDate.Value == date);
            inventoryTrend.Add(new KpiTrendItem
            {
                Label = today.AddDays(-i).ToString("ddd"),
                Value = count
            });
        }

        return new KpiWarehouseDto
        {
            TotalInventoryItems = totalInventoryItems,
            TotalBins = totalBins,
            OccupiedBins = occupiedBins,
            UtilizationRate = Math.Round(utilizationRate, 2),
            InboundToday = inboundToday,
            InboundThisWeek = inboundThisWeek,
            InboundThisMonth = inboundThisMonth,
            OutboundToday = outboundToday,
            OutboundThisWeek = outboundThisWeek,
            OutboundThisMonth = outboundThisMonth,
            DeadStockCount = deadStockCount,
            ExpirySoonCount = expirySoonCount,
            CriticalExpiryCount = criticalExpiryCount,
            ZoneUtilization = zoneUtilization,
            InventoryTrend = inventoryTrend
        };
    }

    public async Task<KpiDispatcherDto> GetDispatcherKpisAsync()
    {
        var today = DateTime.UtcNow.Date;
        var todayDateOnly = DateOnly.FromDateTime(today);

        var totalInWarehouse = await _context.GateLogs
            .CountAsync(g => g.EventType == "CheckIn" &&
                g.EventAt.HasValue &&
                g.EventAt.Value.Date == today &&
                !_context.GateLogs.Any(l => l.VehicleId == g.VehicleId && l.EventType == "CheckOut" && l.EventAt > g.EventAt));

        var scheduledToday = await _context.SlotBookings
            .CountAsync(s => s.ScheduledDate == todayDateOnly);

        var waitingVehicles = await _context.SlotBookings
            .CountAsync(s => s.CheckInAt.HasValue && s.CheckInAt.Value.Date == today && !s.CheckOutAt.HasValue);

        var processingVehicles = await _context.SlotBookings
            .CountAsync(s => s.CheckInAt.HasValue && s.CheckInAt.Value.Date == today);

        var completedToday = await _context.SlotBookings
            .CountAsync(s => s.CheckOutAt.HasValue && s.CheckOutAt.Value.Date == today);

        var availableDocks = await _context.Docks
            .CountAsync(d => d.Status == "Trong" || d.Status == "Available");
        var occupiedDocks = await _context.Docks
            .CountAsync(d => d.Status == "Ban" || d.Status == "Occupied");

        var checkInToday = await _context.GateLogs
            .CountAsync(g => g.EventType == "CheckIn" &&
                g.EventAt.HasValue &&
                g.EventAt.Value.Date == today);

        var checkOutToday = await _context.GateLogs
            .CountAsync(g => g.EventType == "CheckOut" &&
                g.EventAt.HasValue &&
                g.EventAt.Value.Date == today);

        var vehicleTrend = new List<KpiTrendItem>();
        for (int i = 6; i >= 0; i--)
        {
            var date = today.AddDays(-i);
            var count = await _context.GateLogs
                .CountAsync(g => g.EventType == "CheckIn" &&
                    g.EventAt.HasValue &&
                    g.EventAt.Value.Date == date);
            vehicleTrend.Add(new KpiTrendItem
            {
                Label = date.ToString("ddd"),
                Value = count
            });
        }

        return new KpiDispatcherDto
        {
            TotalVehiclesInWarehouse = totalInWarehouse,
            ScheduledToday = scheduledToday,
            WaitingVehicles = waitingVehicles,
            ProcessingVehicles = processingVehicles,
            CompletedToday = completedToday,
            AvgWaitingMinutes = 0,
            AvailableDocks = availableDocks,
            OccupiedDocks = occupiedDocks,
            CheckInToday = checkInToday,
            CheckOutToday = checkOutToday,
            VehicleTrend = vehicleTrend,
            DockStatus = new List<KpiDockStatus>()
        };
    }

    public async Task<KpiFinanceDto> GetFinanceKpisAsync()
    {
        var today = DateTime.UtcNow.Date;
        var todayDateOnly = DateOnly.FromDateTime(today);
        var weekStartDateOnly = DateOnly.FromDateTime(today.AddDays(-(int)today.DayOfWeek));
        var monthStartDateOnly = DateOnly.FromDateTime(new DateTime(today.Year, today.Month, 1));
        var yearStartDateOnly = DateOnly.FromDateTime(new DateTime(today.Year, 1, 1));

        var todayRevenue = await _context.Invoices
            .Where(i => i.IssueDate == todayDateOnly)
            .SumAsync(i => i.TotalAmount ?? 0);

        var thisWeekRevenue = await _context.Invoices
            .Where(i => i.IssueDate >= weekStartDateOnly)
            .SumAsync(i => i.TotalAmount ?? 0);

        var thisMonthRevenue = await _context.Invoices
            .Where(i => i.IssueDate >= monthStartDateOnly)
            .SumAsync(i => i.TotalAmount ?? 0);

        var thisYearRevenue = await _context.Invoices
            .Where(i => i.IssueDate >= yearStartDateOnly)
            .SumAsync(i => i.TotalAmount ?? 0);

        var todayExpense = await _context.OperatingExpenses
            .Where(e => e.ExpenseDate == todayDateOnly)
            .SumAsync(e => e.Amount);

        var thisWeekExpense = await _context.OperatingExpenses
            .Where(e => e.ExpenseDate >= weekStartDateOnly)
            .SumAsync(e => e.Amount);

        var thisMonthExpense = await _context.OperatingExpenses
            .Where(e => e.ExpenseDate >= monthStartDateOnly)
            .SumAsync(e => e.Amount);

        var thisYearExpense = await _context.OperatingExpenses
            .Where(e => e.ExpenseDate >= yearStartDateOnly)
            .SumAsync(e => e.Amount);

        var totalReceivable = await _context.Invoices
            .Where(i => i.Status == "ChuaThanhToan" || i.Status == "Unpaid")
            .SumAsync(i => i.TotalAmount ?? 0);

        var unpaidInvoices = await _context.Invoices
            .Where(i => i.Status == "ChuaThanhToan" || i.Status == "Unpaid")
            .SumAsync(i => i.TotalAmount ?? 0);

        var pendingPayments = await _context.Invoices
            .CountAsync(i => i.Status == "ChuaThanhToan" || i.Status == "Unpaid");

        var totalInvoices = await _context.Invoices.CountAsync();
        var paidInvoices = await _context.Invoices
            .CountAsync(i => i.Status == "DaThanhToan" || i.Status == "Paid");
        var paymentRate = totalInvoices > 0 ? (decimal)paidInvoices / totalInvoices * 100 : 0;

        var revenueTrend = new List<KpiTrendItem>();
        for (int i = 6; i >= 0; i--)
        {
            var date = DateOnly.FromDateTime(today.AddDays(-i));
            var revenue = await _context.Invoices
                .Where(i => i.IssueDate == date)
                .SumAsync(i => i.TotalAmount ?? 0);
            revenueTrend.Add(new KpiTrendItem
            {
                Label = today.AddDays(-i).ToString("ddd"),
                Value = revenue
            });
        }

        var expenseTrend = new List<KpiTrendItem>();
        for (int i = 6; i >= 0; i--)
        {
            var date = DateOnly.FromDateTime(today.AddDays(-i));
            var expense = await _context.OperatingExpenses
                .Where(e => e.ExpenseDate == date)
                .SumAsync(e => e.Amount);
            expenseTrend.Add(new KpiTrendItem
            {
                Label = today.AddDays(-i).ToString("ddd"),
                Value = expense
            });
        }

        return new KpiFinanceDto
        {
            TodayRevenue = todayRevenue,
            ThisWeekRevenue = thisWeekRevenue,
            ThisMonthRevenue = thisMonthRevenue,
            ThisYearRevenue = thisYearRevenue,
            TodayExpense = todayExpense,
            ThisWeekExpense = thisWeekExpense,
            ThisMonthExpense = thisMonthExpense,
            ThisYearExpense = thisYearExpense,
            TodayProfit = todayRevenue - todayExpense,
            ThisMonthProfit = thisMonthRevenue - thisMonthExpense,
            ThisYearProfit = thisYearRevenue - thisYearExpense,
            TotalReceivable = totalReceivable,
            TotalPayable = 0,
            UnpaidInvoices = unpaidInvoices,
            PendingPayments = pendingPayments,
            PaymentRate = Math.Round(paymentRate, 2),
            RevenueTrend = revenueTrend,
            ExpenseTrend = expenseTrend
        };
    }

    public async Task<byte[]> ExportKpisAsync(string format, DateTime? fromDate, DateTime? toDate, string reportType)
    {
        var dashboard = await GetDashboardKpisAsync();

        if (format.ToLower() == "excel")
        {
            return GenerateExcelReport(dashboard);
        }
        else
        {
            return GeneratePdfReport(dashboard);
        }
    }

    private byte[] GenerateExcelReport(KpiDashboardDto dashboard)
    {
        using var workbook = new XLWorkbook();

        var overviewSheet = workbook.Worksheets.Add("Overview");
        overviewSheet.Cell(1, 1).Value = "BI Dashboard - Tong quan";
        overviewSheet.Cell(2, 1).Value = "Total Orders";
        overviewSheet.Cell(2, 2).Value = dashboard.Overview.TotalOrders;
        overviewSheet.Cell(3, 1).Value = "Completed Orders";
        overviewSheet.Cell(3, 2).Value = dashboard.Overview.CompletedOrders;
        overviewSheet.Cell(4, 1).Value = "Pending Orders";
        overviewSheet.Cell(4, 2).Value = dashboard.Overview.PendingOrders;
        overviewSheet.Cell(5, 1).Value = "Total Vehicles";
        overviewSheet.Cell(5, 2).Value = dashboard.Overview.TotalVehicles;
        overviewSheet.Cell(6, 1).Value = "Active Vehicles";
        overviewSheet.Cell(6, 2).Value = dashboard.Overview.ActiveVehicles;
        overviewSheet.Cell(7, 1).Value = "Total SKUs";
        overviewSheet.Cell(7, 2).Value = dashboard.Overview.TotalSkus;
        overviewSheet.Cell(8, 1).Value = "Total Warehouses";
        overviewSheet.Cell(8, 2).Value = dashboard.Overview.TotalWarehouses;
        overviewSheet.Cell(9, 1).Value = "Total Customers";
        overviewSheet.Cell(9, 2).Value = dashboard.Overview.TotalCustomers;
        overviewSheet.Cell(10, 1).Value = "Completion Rate (%)";
        overviewSheet.Cell(10, 2).Value = dashboard.Overview.OrderCompletionRate;

        var warehouseSheet = workbook.Worksheets.Add("Warehouse");
        warehouseSheet.Cell(1, 1).Value = "Warehouse KPIs";
        warehouseSheet.Cell(2, 1).Value = "Total Inventory Items";
        warehouseSheet.Cell(2, 2).Value = dashboard.Warehouse.TotalInventoryItems;
        warehouseSheet.Cell(3, 1).Value = "Total Bins";
        warehouseSheet.Cell(3, 2).Value = dashboard.Warehouse.TotalBins;
        warehouseSheet.Cell(4, 1).Value = "Occupied Bins";
        warehouseSheet.Cell(4, 2).Value = dashboard.Warehouse.OccupiedBins;
        warehouseSheet.Cell(5, 1).Value = "Utilization Rate (%)";
        warehouseSheet.Cell(5, 2).Value = dashboard.Warehouse.UtilizationRate;
        warehouseSheet.Cell(6, 1).Value = "Inbound Today";
        warehouseSheet.Cell(6, 2).Value = dashboard.Warehouse.InboundToday;
        warehouseSheet.Cell(7, 1).Value = "Outbound Today";
        warehouseSheet.Cell(7, 2).Value = dashboard.Warehouse.OutboundToday;
        warehouseSheet.Cell(8, 1).Value = "Dead Stock Count";
        warehouseSheet.Cell(8, 2).Value = dashboard.Warehouse.DeadStockCount;
        warehouseSheet.Cell(9, 1).Value = "Expiry Soon Count";
        warehouseSheet.Cell(9, 2).Value = dashboard.Warehouse.ExpirySoonCount;
        warehouseSheet.Cell(10, 1).Value = "Critical Expiry Count";
        warehouseSheet.Cell(10, 2).Value = dashboard.Warehouse.CriticalExpiryCount;

        var financeSheet = workbook.Worksheets.Add("Finance");
        financeSheet.Cell(1, 1).Value = "Finance KPIs";
        financeSheet.Cell(2, 1).Value = "Today Revenue";
        financeSheet.Cell(2, 2).Value = dashboard.Finance.TodayRevenue;
        financeSheet.Cell(3, 1).Value = "This Week Revenue";
        financeSheet.Cell(3, 2).Value = dashboard.Finance.ThisWeekRevenue;
        financeSheet.Cell(4, 1).Value = "This Month Revenue";
        financeSheet.Cell(4, 2).Value = dashboard.Finance.ThisMonthRevenue;
        financeSheet.Cell(5, 1).Value = "This Year Revenue";
        financeSheet.Cell(5, 2).Value = dashboard.Finance.ThisYearRevenue;
        financeSheet.Cell(6, 1).Value = "Today Expense";
        financeSheet.Cell(6, 2).Value = dashboard.Finance.TodayExpense;
        financeSheet.Cell(7, 1).Value = "This Month Expense";
        financeSheet.Cell(7, 2).Value = dashboard.Finance.ThisMonthExpense;
        financeSheet.Cell(8, 1).Value = "Today Profit";
        financeSheet.Cell(8, 2).Value = dashboard.Finance.TodayProfit;
        financeSheet.Cell(9, 1).Value = "This Month Profit";
        financeSheet.Cell(9, 2).Value = dashboard.Finance.ThisMonthProfit;
        financeSheet.Cell(10, 1).Value = "Unpaid Invoices";
        financeSheet.Cell(10, 2).Value = dashboard.Finance.UnpaidInvoices;
        financeSheet.Cell(11, 1).Value = "Payment Rate (%)";
        financeSheet.Cell(11, 2).Value = dashboard.Finance.PaymentRate;

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private byte[] GeneratePdfReport(KpiDashboardDto dashboard)
    {
        var content = $@"
BI DASHBOARD REPORT
Generated: {dashboard.GeneratedAt:yyyy-MM-dd HH:mm:ss}
================================================================

OVERVIEW KPIs
-------------
Total Orders: {dashboard.Overview.TotalOrders}
Completed Orders: {dashboard.Overview.CompletedOrders}
Pending Orders: {dashboard.Overview.PendingOrders}
Total Vehicles: {dashboard.Overview.TotalVehicles}
Active Vehicles: {dashboard.Overview.ActiveVehicles}
Total SKUs: {dashboard.Overview.TotalSkus}
Total Warehouses: {dashboard.Overview.TotalWarehouses}
Total Customers: {dashboard.Overview.TotalCustomers}
Completion Rate: {dashboard.Overview.OrderCompletionRate}%

WAREHOUSE KPIs
--------------
Total Inventory: {dashboard.Warehouse.TotalInventoryItems}
Total Bins: {dashboard.Warehouse.TotalBins}
Occupied Bins: {dashboard.Warehouse.OccupiedBins}
Utilization Rate: {dashboard.Warehouse.UtilizationRate}%
Inbound Today: {dashboard.Warehouse.InboundToday}
Outbound Today: {dashboard.Warehouse.OutboundToday}
Dead Stock: {dashboard.Warehouse.DeadStockCount}
Expiry Soon: {dashboard.Warehouse.ExpirySoonCount}
Critical Expiry: {dashboard.Warehouse.CriticalExpiryCount}

FINANCE KPIs
------------
Today Revenue: {dashboard.Finance.TodayRevenue:N0} VND
This Week Revenue: {dashboard.Finance.ThisWeekRevenue:N0} VND
This Month Revenue: {dashboard.Finance.ThisMonthRevenue:N0} VND
This Year Revenue: {dashboard.Finance.ThisYearRevenue:N0} VND
Today Expense: {dashboard.Finance.TodayExpense:N0} VND
This Month Expense: {dashboard.Finance.ThisMonthExpense:N0} VND
Today Profit: {dashboard.Finance.TodayProfit:N0} VND
This Month Profit: {dashboard.Finance.ThisMonthProfit:N0} VND
Unpaid Invoices: {dashboard.Finance.UnpaidInvoices:N0} VND
Payment Rate: {dashboard.Finance.PaymentRate}%
";

        return System.Text.Encoding.UTF8.GetBytes(content);
    }
}
