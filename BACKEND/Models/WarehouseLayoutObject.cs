using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class WarehouseLayoutObject
{
    public int ObjectId { get; set; }

    public int MapId { get; set; }

    public string ObjectType { get; set; } = null!;

    public string? RefType { get; set; }

    public int? RefId { get; set; }

    public string? Label { get; set; }

    public decimal X { get; set; }

    public decimal Y { get; set; }

    public decimal Width { get; set; }

    public decimal Height { get; set; }

    public decimal? RotationDeg { get; set; }

    public string? FillColor { get; set; }

    public string? StrokeColor { get; set; }

    public int? ZIndex { get; set; }

    public bool? IsLocked { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual WarehouseLayoutMap Map { get; set; } = null!;
}
