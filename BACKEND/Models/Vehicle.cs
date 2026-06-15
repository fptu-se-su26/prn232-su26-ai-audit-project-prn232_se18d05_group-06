using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Vehicle
{
    public int VehicleId { get; set; }

    public string TruckPlate { get; set; } = null!;

    public string? TrailerPlate { get; set; }

    public string? VehicleType { get; set; }

    public decimal? MaxWeightTon { get; set; }

    public string? OwnerName { get; set; }

    public string? OwnerPhone { get; set; }

    public bool? IsInternal { get; set; }

    public int? DefaultDriverId { get; set; }

    public DateOnly? InspectionExpiry { get; set; }

    public DateOnly? NextServiceDate { get; set; }

    public string? GpsdeviceId { get; set; }

    public bool? IsBlacklisted { get; set; }

    public string? BlacklistReason { get; set; }

    public string? Status { get; set; }

    public bool? IsTempProfile { get; set; }

    public DateTime? TempExpiryAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual Driver? DefaultDriver { get; set; }

    public virtual ICollection<GateLog> GateLogs { get; set; } = new List<GateLog>();

    public virtual ICollection<SlotBooking> SlotBookings { get; set; } = new List<SlotBooking>();

    public virtual ICollection<VehicleMaintenanceLog> VehicleMaintenanceLogs { get; set; } = new List<VehicleMaintenanceLog>();
}
