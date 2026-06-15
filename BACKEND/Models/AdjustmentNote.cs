using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class AdjustmentNote
{
    public int NoteId { get; set; }

    public string NoteCode { get; set; } = null!;

    public string NoteType { get; set; } = null!;

    public int InvoiceId { get; set; }

    public int CustomerId { get; set; }

    public decimal Amount { get; set; }

    public string? Reason { get; set; }

    public string? Status { get; set; }

    public int? ApprovedBy { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? ApprovedByNavigation { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual Invoice Invoice { get; set; } = null!;
}
