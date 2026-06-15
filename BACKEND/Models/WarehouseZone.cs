using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class WarehouseZone
{
    public int ZoneId { get; set; }

    public int WarehouseId { get; set; }

    public string ZoneCode { get; set; } = null!;

    public string ZoneName { get; set; } = null!;

    public string? ZoneType { get; set; }

    public decimal? Capacity { get; set; }

    public bool? IsActive { get; set; }

    public virtual Warehouse Warehouse { get; set; } = null!;

    public virtual ICollection<WarehouseShelf> WarehouseShelves { get; set; } = new List<WarehouseShelf>();
}
