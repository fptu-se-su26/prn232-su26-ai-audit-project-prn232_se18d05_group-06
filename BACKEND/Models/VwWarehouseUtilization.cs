using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class VwWarehouseUtilization
{
    public string WarehouseCode { get; set; } = null!;

    public string WarehouseName { get; set; } = null!;

    public string ZoneCode { get; set; } = null!;

    public string ZoneName { get; set; } = null!;

    public string? ZoneType { get; set; }

    public int? TotalBins { get; set; }

    public int? OccupiedBins { get; set; }

    public double? OccupancyPct { get; set; }
}
