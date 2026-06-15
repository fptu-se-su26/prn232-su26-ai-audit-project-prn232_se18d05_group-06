using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class GateLog
{
    public long GateLogId { get; set; }

    public int? BookingId { get; set; }

    public int? VehicleId { get; set; }

    public int? DriverId { get; set; }

    public string EventType { get; set; } = null!;

    public DateTime? EventAt { get; set; }

    public string? GateCameraSnap { get; set; }

    public string? AlprPlate { get; set; }

    public decimal? Alprconfidence { get; set; }

    public int? OperatorId { get; set; }

    public virtual SlotBooking? Booking { get; set; }

    public virtual Driver? Driver { get; set; }

    public virtual User? Operator { get; set; }

    public virtual Vehicle? Vehicle { get; set; }
}
