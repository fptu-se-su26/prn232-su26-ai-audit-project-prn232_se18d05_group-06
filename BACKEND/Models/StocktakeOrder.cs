using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class StocktakeOrder
{
    public int StocktakeId { get; set; }

    public string StocktakeCode { get; set; } = null!;

    public int WarehouseId { get; set; }

    public DateOnly StocktakeDate { get; set; }

    public string? Status { get; set; }

    public bool? VarianceAlert { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CompletedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual ICollection<StocktakeLine> StocktakeLines { get; set; } = new List<StocktakeLine>();

    public virtual Warehouse Warehouse { get; set; } = null!;
}
