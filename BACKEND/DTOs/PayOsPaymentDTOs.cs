using System.Text.Json.Serialization;

namespace BACKEND.DTOs
{
    public class CreatePayOsPaymentRequestDto
    {
        public int OrderId { get; set; }
        public string? VoucherCode { get; set; }
    }

    public class PayOsPaymentLinkResponseDto
    {
        public int OrderId { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public long PayOsOrderCode { get; set; }
        public decimal Amount { get; set; }
        public decimal OriginalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public string? VoucherCode { get; set; }
        public string Status { get; set; } = string.Empty;
        public string CheckoutUrl { get; set; } = string.Empty;
        public string? QrCode { get; set; }
        public string? PaymentLinkId { get; set; }
    }

    public class PayOsPaymentStatusDto
    {
        public int OrderId { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal OriginalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public string? VoucherCode { get; set; }
        public string OrderStatus { get; set; } = string.Empty;
        public string InvoiceStatus { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string? CheckoutUrl { get; set; }
        public string? PaymentLinkId { get; set; }
        public DateTime? PaidAt { get; set; }
    }

    public class PayOsReturnSyncRequestDto
    {
        public int OrderId { get; set; }
        public long? PayOsOrderCode { get; set; }
        public string? Code { get; set; }
        public string? Status { get; set; }
        public bool Cancel { get; set; }
    }

    public class PaymentVoucherDto
    {
        public int VoucherId { get; set; }
        public string VoucherCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
        public decimal DiscountPct { get; set; }
        public decimal MinOrderValue { get; set; }
        public DateOnly ValidTo { get; set; }
        public bool IsEligible { get; set; }
        public string IneligibleReason { get; set; } = string.Empty;
    }
}
