using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Sku
{
    public int Skuid { get; set; }

    public string Skucode { get; set; } = null!;

    public string? Barcode { get; set; }

    public string? Qrcode { get; set; }

    public string ProductName { get; set; } = null!;

    public int? CategoryId { get; set; }

    public int? CustomerId { get; set; }

    public decimal? WeightKg { get; set; }

    public decimal? LengthCm { get; set; }

    public decimal? WidthCm { get; set; }

    public decimal? HeightCm { get; set; }

    public decimal? VolumeCbm { get; set; }

    public string? StorageTemp { get; set; }

    public bool? IsFragile { get; set; }

    public bool? IsHazmat { get; set; }

    public bool? IsHeavy { get; set; }

    public int? SafetyMinQty { get; set; }

    public int? SafetyDebounceH { get; set; }

    public int? ExpiryDays { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ProductCategory? Category { get; set; }

    public virtual Customer? Customer { get; set; }

    public virtual ICollection<InboundOrderLine> InboundOrderLines { get; set; } = new List<InboundOrderLine>();

    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    public virtual ICollection<OrderLine> OrderLines { get; set; } = new List<OrderLine>();

    public virtual ICollection<OutboundLine> OutboundLines { get; set; } = new List<OutboundLine>();

    public virtual ICollection<StockAlert> StockAlerts { get; set; } = new List<StockAlert>();

    public virtual ICollection<StockLedger> StockLedgers { get; set; } = new List<StockLedger>();

    public virtual ICollection<StockTransfer> StockTransfers { get; set; } = new List<StockTransfer>();

    public virtual ICollection<StockWriteOff> StockWriteOffs { get; set; } = new List<StockWriteOff>();

    public virtual ICollection<StocktakeLine> StocktakeLines { get; set; } = new List<StocktakeLine>();
}
