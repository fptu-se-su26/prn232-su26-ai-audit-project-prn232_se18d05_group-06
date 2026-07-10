using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class WarehouseLayoutMap
{
    public int MapId { get; set; }

    public int WarehouseId { get; set; }

    public string MapName { get; set; } = null!;

    public int CanvasWidth { get; set; }

    public int CanvasHeight { get; set; }

    public string? BackgroundImageUrl { get; set; }

    public decimal? ScaleMeterPerPixel { get; set; }

    public bool? IsActive { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Warehouse Warehouse { get; set; } = null!;

    public virtual User? CreatedByUser { get; set; }

    public virtual ICollection<WarehouseLayoutObject> WarehouseLayoutObjects { get; set; } = new List<WarehouseLayoutObject>();
}
