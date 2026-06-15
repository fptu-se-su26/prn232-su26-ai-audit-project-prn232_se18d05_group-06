using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Driver
{
    public int DriverId { get; set; }

    public string DriverCode { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public string? Phone { get; set; }

    public string LicenseNo { get; set; } = null!;

    public DateOnly? LicenseExpiry { get; set; }

    public bool? IsBlacklisted { get; set; }

    public string? BlacklistReason { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<GateLog> GateLogs { get; set; } = new List<GateLog>();

    public virtual ICollection<SlotBooking> SlotBookings { get; set; } = new List<SlotBooking>();

    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
