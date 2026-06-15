using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class StockTransfer
{
    public int TransferId { get; set; }

    public string TransferCode { get; set; } = null!;

    public int Skuid { get; set; }

    public int FromBinId { get; set; }

    public int ToBinId { get; set; }

    public int Quantity { get; set; }

    public string? Status { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CompletedAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual WarehouseBin FromBin { get; set; } = null!;

    public virtual Sku Sku { get; set; } = null!;

    public virtual WarehouseBin ToBin { get; set; } = null!;
}
