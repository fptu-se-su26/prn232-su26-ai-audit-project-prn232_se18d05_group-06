using System;
using System.Collections.Generic;

namespace BACKEND.DTOs
{
    public class OutboundResponseDto
    {
        public string WaybillCode { get; set; } = string.Empty;
        public string QrCodeBase64 { get; set; } = string.Empty;
        public List<PickingListItemDto> PickingList { get; set; } = new List<PickingListItemDto>();
        public DateTime CreatedAt { get; set; }
    }
}
