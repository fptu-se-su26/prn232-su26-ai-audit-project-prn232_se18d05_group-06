using System;
using System.Collections.Generic;

namespace BACKEND.DTOs
{
    public class InvoiceDto
    {
        public int InvoiceId { get; set; }
        public string InvoiceNo { get; set; } = null!;
        public int OrderId { get; set; }
        public string OrderCode { get; set; } = null!;
        public string? OrderStatus { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = null!;
        public string? CustomerEmail { get; set; }
        public DateOnly IssueDate { get; set; }
        public DateOnly DueDate { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountAmt { get; set; }
        public decimal Vatrate { get; set; }
        public decimal Vatamount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public string Status { get; set; } = null!;
        public string? Pdfpath { get; set; }
    }

    public class InvoiceDetailDto : InvoiceDto
    {
        public List<InvoiceServiceChargeDto> ServiceCharges { get; set; } = new();
    }

    public class InvoiceServiceChargeDto
    {
        public int ChargeId { get; set; }
        public string ChargeCode { get; set; } = null!;
        public string ChargeType { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Amount { get; set; }
        public bool IsApproved { get; set; }
    }


    public class CompletedOrderForInvoiceDto
    {
        public int OrderId { get; set; }
        public string OrderCode { get; set; } = null!;
        public string? OrderStatus { get; set; }
        public string CustomerName { get; set; } = null!;
        public string? CustomerEmail { get; set; }
        public string ServiceType { get; set; } = null!;
        public string Status { get; set; } = null!;
        public decimal EstimatedAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
    public class InvoiceStatusPatchDto
    {
        public string Status { get; set; } = null!;
    }
}
