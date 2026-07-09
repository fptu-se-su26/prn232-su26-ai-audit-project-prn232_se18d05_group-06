using System;

namespace BACKEND.Models;

public partial class OperatingExpense
{
    public int ExpenseId { get; set; }
    public string ExpenseCode { get; set; } = null!;
    public string ExpenseCategory { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
    public DateOnly ExpenseDate { get; set; }
    public string? Status { get; set; }
    public int? CreatedBy { get; set; }
    public DateTime? CreatedAt { get; set; }
    public virtual User? CreatedByNavigation { get; set; }
}