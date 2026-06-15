using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class VwVehiclePerformance
{
    public string TruckPlate { get; set; } = null!;

    public string? VehicleType { get; set; }

    public string? DefaultDriver { get; set; }

    public int? TotalTrips { get; set; }

    public int? AvgDockMinutes { get; set; }
}
