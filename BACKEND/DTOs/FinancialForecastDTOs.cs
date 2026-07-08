namespace BACKEND.DTOs;

public class FinancialHistoryPointDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public decimal Expense { get; set; }
    public decimal Profit { get; set; }
    public decimal CashIn { get; set; }
    public decimal CashOut { get; set; }
    public int OrderVolume { get; set; }
}

public class FinancialForecastPointDto
{
    public int? ForecastId { get; set; }
    public string Month { get; set; } = string.Empty;
    public decimal ForecastRevenue { get; set; }
    public decimal ForecastExpense { get; set; }
    public decimal ForecastProfit { get; set; }
    public decimal CashInForecast { get; set; }
    public decimal CashOutForecast { get; set; }
    public decimal ConfidenceScore { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public string TrendDirection { get; set; } = string.Empty;
    public string ModelVersion { get; set; } = string.Empty;
    public string Insight { get; set; } = string.Empty;
}

public class FinancialForecastSummaryDto
{
    public decimal NextRevenue { get; set; }
    public decimal NextExpense { get; set; }
    public decimal NextProfit { get; set; }
    public decimal NetCashFlow { get; set; }
    public decimal AverageConfidence { get; set; }
    public string OverallRisk { get; set; } = string.Empty;
    public bool HasMinimumHistory { get; set; }
    public int HistoryMonths { get; set; }
    public string ModelVersion { get; set; } = string.Empty;
    public DateTime? LastGeneratedAt { get; set; }
}

public class FinancialForecastDashboardDto
{
    public FinancialForecastSummaryDto Summary { get; set; } = new();
    public List<FinancialHistoryPointDto> History { get; set; } = new();
    public List<FinancialForecastPointDto> Forecasts { get; set; } = new();
    public List<string> Alerts { get; set; } = new();
    public List<AiModelTrainingLogDto> TrainingLogs { get; set; } = new();
}

public class GenerateFinancialForecastRequestDto
{
    public int Months { get; set; } = 3;
    public int? CreatedBy { get; set; }
}

public class RetrainFinancialForecastRequestDto
{
    public int? TriggeredBy { get; set; }
}

public class AiModelTrainingLogDto
{
    public int TrainingLogId { get; set; }
    public string ModelName { get; set; } = string.Empty;
    public string ModelVersion { get; set; } = string.Empty;
    public DateTime TrainingDate { get; set; }
    public DateTime? DataFrom { get; set; }
    public DateTime? DataTo { get; set; }
    public decimal? AccuracyScore { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
    public string TriggerType { get; set; } = string.Empty;
}
