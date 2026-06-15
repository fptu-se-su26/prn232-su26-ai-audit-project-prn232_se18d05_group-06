using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class OrderLine
{
    public int LineId { get; set; }

    public int OrderId { get; set; }

    public int? Skuid { get; set; }

    public string? ProductDesc { get; set; }

    public int Quantity { get; set; }

    public decimal? WeightKg { get; set; }

    public decimal? VolumeCbm { get; set; }

    public decimal? UnitPrice { get; set; }

    public decimal? LineTotal { get; set; }

    public virtual ServiceOrder Order { get; set; } = null!;

    public virtual Sku? Sku { get; set; }
}
