using System;

namespace BACKEND.Models;

public partial class OverstayAlert
{
    public int AlertId { get; set; }

    public int VehicleDockSessionId { get; set; }

    public int VehicleId { get; set; }

    public int DockId { get; set; }

    public int SlaMinutes { get; set; }

    public int ActualMinutes { get; set; }

    public int OverstayMinutes { get; set; }

    public string AlertLevel { get; set; } = null!;

    public string AlertStatus { get; set; } = null!;

    public string AlertMessage { get; set; } = null!;

    public string? Reason { get; set; }

    public string? ActionTaken { get; set; }

    public int? ResolvedBy { get; set; }

    public DateTime? ResolvedAt { get; set; }

    public DateTime? LastCheckedAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Dock Dock { get; set; } = null!;

    public virtual User? ResolvedByNavigation { get; set; }

    public virtual Vehicle Vehicle { get; set; } = null!;

    public virtual VehicleDockSession VehicleDockSession { get; set; } = null!;
}
