using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class VehicleDockSession
{
    public int SessionId { get; set; }

    public int VehicleId { get; set; }

    public int? BookingId { get; set; }

    public int DockId { get; set; }

    public DateTime? CheckInTime { get; set; }

    public DateTime DockStartTime { get; set; }

    public DateTime? DockEndTime { get; set; }

    public string CurrentStatus { get; set; } = null!;

    public string ServiceType { get; set; } = null!;

    public string? CargoType { get; set; }

    public DateTime? LastStatusAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual SlotBooking? Booking { get; set; }

    public virtual Dock Dock { get; set; } = null!;

    public virtual ICollection<OverstayAlert> OverstayAlerts { get; set; } = new List<OverstayAlert>();

    public virtual Vehicle Vehicle { get; set; } = null!;
}
