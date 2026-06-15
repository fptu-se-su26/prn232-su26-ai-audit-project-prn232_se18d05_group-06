using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Invoice
{
    public int InvoiceId { get; set; }

    public string InvoiceNo { get; set; } = null!;

    public int OrderId { get; set; }

    public int CustomerId { get; set; }

    public DateOnly IssueDate { get; set; }

    public DateOnly DueDate { get; set; }

    public decimal SubTotal { get; set; }

    public decimal? DiscountAmt { get; set; }

    public decimal? Vatrate { get; set; }

    public decimal? Vatamount { get; set; }

    public decimal? TotalAmount { get; set; }

    public decimal? PaidAmount { get; set; }

    public string? Status { get; set; }

    public string? Pdfpath { get; set; }

    public bool? DigitalSigned { get; set; }

    public string? VatinvoiceNo { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<AdjustmentNote> AdjustmentNotes { get; set; } = new List<AdjustmentNote>();

    public virtual ICollection<BankReconciliation> BankReconciliations { get; set; } = new List<BankReconciliation>();

    public virtual User? CreatedByNavigation { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual ServiceOrder Order { get; set; } = null!;

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual ICollection<ServiceCharge> ServiceCharges { get; set; } = new List<ServiceCharge>();
}
