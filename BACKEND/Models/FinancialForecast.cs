using System;

namespace BACKEND.Models;

public partial class FinancialForecast
{
    public int ForecastId { get; set; }

    public DateTime ForecastMonth { get; set; }

    public decimal ForecastRevenue { get; set; }

    public decimal ForecastExpense { get; set; }

    public decimal ForecastProfit { get; set; }

    public decimal CashInForecast { get; set; }

    public decimal CashOutForecast { get; set; }

    public decimal ConfidenceScore { get; set; }

    public string RiskLevel { get; set; } = null!;

    public string TrendDirection { get; set; } = null!;

    public string ModelVersion { get; set; } = null!;

    public string? Insight { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }
}
