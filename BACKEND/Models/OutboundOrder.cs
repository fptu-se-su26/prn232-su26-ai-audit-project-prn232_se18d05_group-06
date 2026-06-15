using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class OutboundOrder
{
    public int OutboundId { get; set; }

    public string OutboundCode { get; set; } = null!;

    public int OrderId { get; set; }

    public int WarehouseId { get; set; }

    public string? Status { get; set; }

    public bool? LabelPrinted { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual ServiceOrder Order { get; set; } = null!;

    public virtual ICollection<OutboundLine> OutboundLines { get; set; } = new List<OutboundLine>();

    public virtual Warehouse Warehouse { get; set; } = null!;
}
