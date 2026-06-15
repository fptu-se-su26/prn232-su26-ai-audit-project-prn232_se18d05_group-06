using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class VehicleMaintenanceLog
{
    public int MaintenanceId { get; set; }

    public int VehicleId { get; set; }

    public string? MaintenanceType { get; set; }

    public DateOnly ServiceDate { get; set; }

    public DateOnly? NextServiceDate { get; set; }

    public string? ServiceCenter { get; set; }

    public decimal? CostAmount { get; set; }

    public string? Note { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Vehicle Vehicle { get; set; } = null!;
}
