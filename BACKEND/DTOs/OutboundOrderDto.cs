using System;
using System.Collections.Generic;

namespace BACKEND.DTOs
{
    public class OutboundOrderDto
    {
        public int OutboundId { get; set; }
        public string OutboundCode { get; set; } = string.Empty;
        public int OrderId { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public int WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public bool LabelPrinted { get; set; }
        public int? CreatedBy { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
        public DateTime? CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string QrCodeBase64 { get; set; } = string.Empty;
        public List<OutboundLineDto> OutboundLines { get; set; } = new List<OutboundLineDto>();
    }
}
