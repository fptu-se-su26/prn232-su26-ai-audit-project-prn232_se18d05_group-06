using System;

namespace BACKEND.DTOs
{
    public class ShippingLabelDto
    {
        public int WaybillId { get; set; }
        public string WaybillCode { get; set; } = string.Empty;
        public int OutboundId { get; set; }
        public string OutboundCode { get; set; } = string.Empty;
        public string OrderCode { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public string WarehouseAddress { get; set; } = string.Empty;
        public string DestinationAddress { get; set; } = string.Empty;
        public string RecipientName { get; set; } = string.Empty;
        public string RecipientPhone { get; set; } = string.Empty;
        public decimal TotalWeightKg { get; set; }
        public decimal TotalPallets { get; set; }
        public DateTime CreatedAt { get; set; }
        public string QrPayload { get; set; } = string.Empty;
        public string QrCodeBase64 { get; set; } = string.Empty;
        public string OutboundStatus { get; set; } = string.Empty;
    }
}
