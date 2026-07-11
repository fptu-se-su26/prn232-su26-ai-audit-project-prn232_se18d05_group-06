namespace BACKEND.DTOs;

public class ConfirmPaymentRequestDto
{
    public int InvoiceId { get; set; }
    public int? PaymentId { get; set; }
    public decimal? Amount { get; set; }
    public string? PaymentMethod { get; set; }
    public string? BankTxnRef { get; set; }
    public DateTime? PaidAt { get; set; }
    public bool SendEmail { get; set; } = true;
}

public class PaymentConfirmationDto
{
    public int PaymentId { get; set; }
    public string PaymentCode { get; set; } = string.Empty;
    public int InvoiceId { get; set; }
    public string InvoiceNo { get; set; } = string.Empty;
    public decimal PaymentAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public string InvoiceStatus { get; set; } = string.Empty;
    public bool EmailSent { get; set; }
    public string Message { get; set; } = string.Empty;
}
