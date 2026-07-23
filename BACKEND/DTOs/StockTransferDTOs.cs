using System;

namespace BACKEND.DTOs
{
    public class StockTransferCreateRequest
    {
        public int SkuId { get; set; }
        public int FromBinId { get; set; }
        public int ToBinId { get; set; }
        public int Quantity { get; set; }
        public string? Note { get; set; }
    }

    public class StockTransferDto
    {
        public int TransferId { get; set; }
        public string TransferCode { get; set; } = null!;
        public int SkuId { get; set; }
        public string SkuCode { get; set; } = null!;
        public string SkuName { get; set; } = null!;
        public int FromBinId { get; set; }
        public string FromBinCode { get; set; } = null!;
        public string FromZoneName { get; set; } = null!;
        public int ToBinId { get; set; }
        public string ToBinCode { get; set; } = null!;
        public string ToZoneName { get; set; } = null!;
        public int Quantity { get; set; }
        public string? Status { get; set; }
        public string? Note { get; set; }
        public string? CreatedByName { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}
