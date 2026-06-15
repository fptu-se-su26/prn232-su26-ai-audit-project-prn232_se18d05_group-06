using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class InboundOrder
{
    public int InboundId { get; set; }

    public string InboundCode { get; set; } = null!;

    public int CustomerId { get; set; }

    public int WarehouseId { get; set; }

    public DateOnly? ExpectedDate { get; set; }

    public DateOnly? ActualDate { get; set; }

    public string? Status { get; set; }

    public decimal? Ocrconfidence { get; set; }

    public string? OcrrawData { get; set; }

    public bool? RequireManual { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual ICollection<InboundOrderLine> InboundOrderLines { get; set; } = new List<InboundOrderLine>();

    public virtual Warehouse Warehouse { get; set; } = null!;
}
