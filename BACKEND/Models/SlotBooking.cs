using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class SlotBooking
{
    public int BookingId { get; set; }

    public string BookingCode { get; set; } = null!;

    public string? Qrcode { get; set; }

    public int? VehicleId { get; set; }

    public int? DriverId { get; set; }

    public int? CustomerId { get; set; }

    public int WarehouseId { get; set; }

    public int? DockId { get; set; }

    public int? OrderId { get; set; }

    public string BookingType { get; set; } = null!;

    public DateOnly ScheduledDate { get; set; }

    public TimeOnly ScheduledStart { get; set; }

    public TimeOnly ScheduledEnd { get; set; }

    public string? Status { get; set; }

    public DateTime? CheckInAt { get; set; }

    public DateTime? CheckOutAt { get; set; }

    public bool? OverstayAlert { get; set; }

    public string? AlprPlate { get; set; }

    public decimal? Alprconfidence { get; set; }

    public int? PriorityScore { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual Customer? Customer { get; set; }

    public virtual Dock? Dock { get; set; }

    public virtual Driver? Driver { get; set; }

    public virtual ICollection<GateLog> GateLogs { get; set; } = new List<GateLog>();

    public virtual ServiceOrder? Order { get; set; }

    public virtual Vehicle? Vehicle { get; set; }

    public virtual Warehouse Warehouse { get; set; } = null!;
}
