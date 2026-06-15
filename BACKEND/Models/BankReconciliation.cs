using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class BankReconciliation
{
    public int ReconcileId { get; set; }

    public string BankTxnRef { get; set; } = null!;

    public DateOnly BankTxnDate { get; set; }

    public decimal Amount { get; set; }

    public string? Description { get; set; }

    public int? MatchedInvoiceId { get; set; }

    public int? MatchedPaymentId { get; set; }

    public string? Status { get; set; }

    public DateTime? ImportedAt { get; set; }

    public virtual Invoice? MatchedInvoice { get; set; }

    public virtual Payment? MatchedPayment { get; set; }
}
