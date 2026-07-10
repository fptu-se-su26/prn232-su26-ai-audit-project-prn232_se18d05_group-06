namespace BACKEND.DTOs;

public class PaymentReconciliationItemDto
{
    public int ReconcileId { get; set; }
    public string BankTxnRef { get; set; } = string.Empty;
    public DateOnly BankTxnDate { get; set; }
    public decimal BankAmount { get; set; }
    public string? Description { get; set; }
    public int? MatchedInvoiceId { get; set; }
    public string? InvoiceNo { get; set; }
    public decimal? InvoiceAmount { get; set; }
    public string? InvoiceStatus { get; set; }
    public int? MatchedPaymentId { get; set; }
    public string? PaymentCode { get; set; }
    public decimal? PaymentAmount { get; set; }
    public string? PaymentMethod { get; set; }
    public string Status { get; set; } = string.Empty;
    public string MatchNote { get; set; } = string.Empty;
}

public class PaymentReconciliationListDto
{
    public int Total { get; set; }
    public int Matched { get; set; }
    public int Partial { get; set; }
    public int Unmatched { get; set; }
    public List<PaymentReconciliationItemDto> Items { get; set; } = new();
}

public class AutoMatchReconciliationResponseDto
{
    public int TotalChecked { get; set; }
    public int Matched { get; set; }
    public int Partial { get; set; }
    public int Unmatched { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class ManualMatchReconciliationRequestDto
{
    public int ReconcileId { get; set; }
    public int InvoiceId { get; set; }
    public int PaymentId { get; set; }
}

public class ManualMatchReconciliationResponseDto
{
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}