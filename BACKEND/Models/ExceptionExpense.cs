using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class ExceptionExpense
{
    public int ExpenseId { get; set; }

    public string ExpenseCode { get; set; } = null!;

    public string Description { get; set; } = null!;

    public decimal Amount { get; set; }

    public DateOnly? ExpenseDate { get; set; }

    public string? Status { get; set; }

    public int? ApprovedBy { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public int? RequestedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? ApprovedByNavigation { get; set; }

    public virtual User? RequestedByNavigation { get; set; }
}
