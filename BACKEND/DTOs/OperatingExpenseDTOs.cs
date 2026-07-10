namespace BACKEND.DTOs;

public class OperatingExpenseItemDto
{
    public string Category { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int EntryCount { get; set; }
    public decimal Percentage { get; set; }
}

public class OperatingExpenseReportDto
{
    public decimal TotalExpense { get; set; }
    public string TopExpenseCategory { get; set; } = string.Empty;
    public DateOnly FromDate { get; set; }
    public DateOnly ToDate { get; set; }
    public string Category { get; set; } = string.Empty;
    public List<OperatingExpenseItemDto> Items { get; set; } = new();
}