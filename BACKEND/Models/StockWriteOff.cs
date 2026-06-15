using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class StockWriteOff
{
    public int WriteOffId { get; set; }

    public string WriteOffCode { get; set; } = null!;

    public int Skuid { get; set; }

    public int? BinId { get; set; }

    public int Quantity { get; set; }

    public string? Reason { get; set; }

    public string? Status { get; set; }

    public int? ApprovedBy { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? ApprovedByNavigation { get; set; }

    public virtual WarehouseBin? Bin { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual Sku Sku { get; set; } = null!;
}
