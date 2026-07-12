using System;
using System.Collections.Generic;

namespace BACKEND.DTOs
{
    public class ScanInboundCodeRequest
    {
        public string Code { get; set; } = string.Empty;
        public int WarehouseId { get; set; }
        public int CustomerId { get; set; }
        public int Quantity { get; set; }
        public string? BatchNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }

    public class OcrExtractedItemDto
    {
        public string? SkuCode { get; set; }
        public string? Barcode { get; set; }
        public string? ProductName { get; set; }
        public int Quantity { get; set; }
        public string? BatchNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public decimal Confidence { get; set; }
    }

    public class OcrResultDto
    {
        public decimal Confidence { get; set; }
        public string RawText { get; set; } = string.Empty;
        public List<OcrExtractedItemDto> Items { get; set; } = new List<OcrExtractedItemDto>();
    }

    public class ConfirmOcrReviewRequest
    {
        public List<ConfirmOcrReviewLineDto> Lines { get; set; } = new List<ConfirmOcrReviewLineDto>();
    }

    public class ConfirmOcrReviewLineDto
    {
        public int LineId { get; set; }
        public int SkuId { get; set; }
        public int ExpectedQty { get; set; }
        public string? BatchNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string ConditionStatus { get; set; } = "GOOD";
    }

    public class ConfirmReceivingRequest
    {
        public List<ConfirmReceivingLineDto> Lines { get; set; } = new List<ConfirmReceivingLineDto>();
    }

    public class ConfirmReceivingLineDto
    {
        public int LineId { get; set; }
        public int ReceivedQty { get; set; }
        public int BinId { get; set; }
        public string ConditionStatus { get; set; } = "GOOD";
    }

    public class OcrReviewResponseDto
    {
        public int InboundId { get; set; }
        public string? InboundCode { get; set; }
        public decimal? OcrConfidence { get; set; }
        public string? OcrRawData { get; set; }
        public bool? RequireManual { get; set; }
        public List<OcrReviewLineDto> Lines { get; set; } = new List<OcrReviewLineDto>();
    }

    public class OcrReviewLineDto
    {
        public int LineId { get; set; }
        public int? SkuId { get; set; }
        public string? SkuCode { get; set; }
        public string? ProductName { get; set; }
        public int ExpectedQty { get; set; }
        public string? BatchNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? ConditionStatus { get; set; }
    }

    public class ApiResponse
    {
        public bool Success { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public object? Data { get; set; }
    }
}
