using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Payment
{
    public int PaymentId { get; set; }

    public string PaymentCode { get; set; } = null!;

    public int InvoiceId { get; set; }

    public int CustomerId { get; set; }

    public decimal Amount { get; set; }

    public string? PaymentMethod { get; set; }

    public string? BankTxnRef { get; set; }

    public string? HashCode { get; set; }

    public string? Status { get; set; }

    public string? ReceiptPath { get; set; }

    public DateTime? PaidAt { get; set; }

    public int? ConfirmedBy { get; set; }

    public virtual ICollection<BankReconciliation> BankReconciliations { get; set; } = new List<BankReconciliation>();

    public virtual User? ConfirmedByNavigation { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual Invoice Invoice { get; set; } = null!;
}
