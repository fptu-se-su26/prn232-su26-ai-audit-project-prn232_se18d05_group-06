namespace BACKEND.DTOs
{
    public class StockAlertDto
    {
        public int AlertId { get; set; }
        public int Skuid { get; set; }
        public string? Skucode { get; set; }
        public string? ProductName { get; set; }
        public string? CustomerName { get; set; }
        public string AlertType { get; set; } = null!;
        public int? CurrentQty { get; set; }
        public int? ThresholdQty { get; set; }
        public DateTime? EmailSentAt { get; set; }
        public DateTime? NextAllowedAt { get; set; }
        public bool IsResolved { get; set; }
        public DateTime? CreatedAt { get; set; }

        // 'CRITICAL' khi tồn = 0 hoặc <= 50% ngưỡng, ngược lại 'WARNING'.
        public string Severity { get; set; } = "WARNING";
    }

    public class StockAlertSummaryDto
    {
        public int LowStock { get; set; }
        public int ExpiringSoon { get; set; }
        public int DeadStock { get; set; }
        public int Total { get; set; }
    }
}
