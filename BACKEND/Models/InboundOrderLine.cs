using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class InboundOrderLine
{
    public int LineId { get; set; }

    public int InboundId { get; set; }

    public int Skuid { get; set; }

    public int ExpectedQty { get; set; }

    public int? ReceivedQty { get; set; }

    public int? BinId { get; set; }

    public int? AislottedBinId { get; set; }

    public string? BatchNo { get; set; }

    public DateOnly? ExpiryDate { get; set; }

    public string? ConditionStatus { get; set; }

    public string? Note { get; set; }

    public virtual WarehouseBin? AislottedBin { get; set; }

    public virtual WarehouseBin? Bin { get; set; }

    public virtual ICollection<CargoPhoto> CargoPhotos { get; set; } = new List<CargoPhoto>();

    public virtual InboundOrder Inbound { get; set; } = null!;

    public virtual Sku Sku { get; set; } = null!;
}
