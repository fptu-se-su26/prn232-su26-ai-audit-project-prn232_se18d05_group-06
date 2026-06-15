using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class StockAlert
{
    public int AlertId { get; set; }

    public int Skuid { get; set; }

    public string AlertType { get; set; } = null!;

    public int? CurrentQty { get; set; }

    public int? ThresholdQty { get; set; }

    public DateTime? EmailSentAt { get; set; }

    public DateTime? NextAllowedAt { get; set; }

    public bool? IsResolved { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Sku Sku { get; set; } = null!;
}
