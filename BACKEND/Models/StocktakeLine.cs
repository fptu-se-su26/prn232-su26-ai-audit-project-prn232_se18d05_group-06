using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class StocktakeLine
{
    public int LineId { get; set; }

    public int StocktakeId { get; set; }

    public int Skuid { get; set; }

    public int? BinId { get; set; }

    public int SystemQty { get; set; }

    public int? CountedQty { get; set; }

    public int? Variance { get; set; }

    public decimal? VariancePct { get; set; }

    public bool? RequireRecount { get; set; }

    public string? Note { get; set; }

    public virtual WarehouseBin? Bin { get; set; }

    public virtual Sku Sku { get; set; } = null!;

    public virtual StocktakeOrder Stocktake { get; set; } = null!;
}
