using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class StockLedger
{
    public long LedgerId { get; set; }

    public int Skuid { get; set; }

    public int? BinId { get; set; }

    public string TxnType { get; set; } = null!;

    public int Qty { get; set; }

    public int QtyBefore { get; set; }

    public int QtyAfter { get; set; }

    public string? RefType { get; set; }

    public int? RefId { get; set; }

    public string? Note { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual WarehouseBin? Bin { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual Sku Sku { get; set; } = null!;
}
