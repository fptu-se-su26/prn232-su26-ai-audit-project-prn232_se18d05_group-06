using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BACKEND.DTOs
{
    public class ProfitDashboardQuery
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string PeriodType { get; set; } = "month";
    }

    public class ProfitDashboardResponse
    {
        public bool Success { get; set; }
        public string PeriodType { get; set; } = string.Empty;
        public string FromDate { get; set; } = string.Empty;
        public string ToDate { get; set; } = string.Empty;

        public ProfitSummaryDto Summary { get; set; } = new();
        public List<ProfitChartPointDto> ChartData { get; set; } = new();
        public List<ExpenseBreakdownDto> ExpenseBreakdown { get; set; } = new();
        public List<ServiceRevenueBreakdownDto> ServiceRevenueBreakdown { get; set; } = new();
    }

    public class ProfitSummaryDto
    {
        public decimal RevenueInvoiced { get; set; }
        public decimal RevenueCollected { get; set; }

        public decimal OperatingCost { get; set; }
        public decimal ExceptionCost { get; set; }
        public decimal MaintenanceCost { get; set; }
        public decimal TotalExpense { get; set; }

        public decimal ProfitByInvoice { get; set; }
        public decimal ProfitByCollected { get; set; }

        public decimal ProfitMarginByInvoice { get; set; }
        public decimal ProfitMarginByCollected { get; set; }

        public int TotalOrders { get; set; }
        public int TotalInvoices { get; set; }
        public int PaidInvoices { get; set; }
        public int PartialInvoices { get; set; }
        public int OverdueInvoices { get; set; }
    }

    public class ProfitChartPointDto
    {
        public string Period { get; set; } = string.Empty;

        public decimal RevenueInvoiced { get; set; }
        public decimal RevenueCollected { get; set; }
        public decimal TotalExpense { get; set; }

        public decimal ProfitByInvoice { get; set; }
        public decimal ProfitByCollected { get; set; }
    }

    public class ExpenseBreakdownDto
    {
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public class ServiceRevenueBreakdownDto
    {
        public string ServiceType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }
}
