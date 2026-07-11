using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class OutboundLine
{
    public int LineId { get; set; }

    public int OutboundId { get; set; }

    public int Skuid { get; set; }

    public int? BinId { get; set; }

    public int RequiredQty { get; set; }

    public int? PickedQty { get; set; }

    public string? Qrlabel { get; set; }

    public byte[] RowVersion { get; set; } = null!;

    public virtual WarehouseBin? Bin { get; set; }

    public virtual OutboundOrder Outbound { get; set; } = null!;

    public virtual Sku Sku { get; set; } = null!;
}
