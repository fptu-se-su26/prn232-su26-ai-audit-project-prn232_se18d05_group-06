using System;

namespace BACKEND.Models;

public partial class Waybill
{
    public int WaybillId { get; set; }

    public int? OrderId { get; set; }

    public int? OutboundId { get; set; }

    public string WaybillCode { get; set; } = null!;

    public string? QrCodeBase64 { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual ServiceOrder? Order { get; set; }

    public virtual OutboundOrder? Outbound { get; set; }
}
