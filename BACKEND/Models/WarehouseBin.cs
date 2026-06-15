using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class WarehouseBin
{
    public int BinId { get; set; }

    public int ShelfId { get; set; }

    public string BinCode { get; set; } = null!;

    public string? BinType { get; set; }

    public decimal? CapacityCbm { get; set; }

    public decimal? MaxWeightKg { get; set; }

    public bool? IsOccupied { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<InboundOrderLine> InboundOrderLineAislottedBins { get; set; } = new List<InboundOrderLine>();

    public virtual ICollection<InboundOrderLine> InboundOrderLineBins { get; set; } = new List<InboundOrderLine>();

    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    public virtual ICollection<OutboundLine> OutboundLines { get; set; } = new List<OutboundLine>();

    public virtual WarehouseShelf Shelf { get; set; } = null!;

    public virtual ICollection<StockLedger> StockLedgers { get; set; } = new List<StockLedger>();

    public virtual ICollection<StockTransfer> StockTransferFromBins { get; set; } = new List<StockTransfer>();

    public virtual ICollection<StockTransfer> StockTransferToBins { get; set; } = new List<StockTransfer>();

    public virtual ICollection<StockWriteOff> StockWriteOffs { get; set; } = new List<StockWriteOff>();

    public virtual ICollection<StocktakeLine> StocktakeLines { get; set; } = new List<StocktakeLine>();
}
