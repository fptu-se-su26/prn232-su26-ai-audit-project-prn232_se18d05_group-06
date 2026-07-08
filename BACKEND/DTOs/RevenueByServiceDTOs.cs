namespace BACKEND.DTOs;

public class RevenueByServiceItemDto
{
    public string ChargeType { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal CollectedAmount { get; set; }
    public int InvoiceCount { get; set; }
    public decimal Percentage { get; set; }
}

public class RevenueByServiceDto
{
    public decimal TotalRevenue { get; set; }
    public decimal CollectedRevenue { get; set; }
    public string TopServiceType { get; set; } = string.Empty;
    public DateOnly FromDate { get; set; }
    public DateOnly ToDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<RevenueByServiceItemDto> Items { get; set; } = new();
}