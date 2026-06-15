using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Inventory
{
    public int InventoryId { get; set; }

    public int Skuid { get; set; }

    public int BinId { get; set; }

    public int Quantity { get; set; }

    public string? BatchNo { get; set; }

    public DateOnly? ExpiryDate { get; set; }

    public DateOnly? InboundDate { get; set; }

    public DateOnly? LastCountDate { get; set; }

    public virtual WarehouseBin Bin { get; set; } = null!;

    public virtual Sku Sku { get; set; } = null!;
}
