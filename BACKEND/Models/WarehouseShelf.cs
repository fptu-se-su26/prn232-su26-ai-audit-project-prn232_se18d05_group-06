using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class WarehouseShelf
{
    public int ShelfId { get; set; }

    public int ZoneId { get; set; }

    public string ShelfCode { get; set; } = null!;

    public byte? FloorLevel { get; set; }

    public decimal? MaxWeightKg { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<WarehouseBin> WarehouseBins { get; set; } = new List<WarehouseBin>();

    public virtual WarehouseZone Zone { get; set; } = null!;
}
