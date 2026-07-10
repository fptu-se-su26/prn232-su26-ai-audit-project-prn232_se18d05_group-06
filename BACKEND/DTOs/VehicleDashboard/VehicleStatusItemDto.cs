using System;

namespace BACKEND.DTOs.VehicleDashboard;

public class VehicleStatusItemDto
{
    public int BookingId { get; set; }
    public string BookingCode { get; set; } = null!;
    public string? TruckPlate { get; set; }
    public string? TrailerPlate { get; set; }
    public string? DriverName { get; set; }
    public string? CustomerName { get; set; }
    public string? Status { get; set; }
    public DateTime? CheckInAt { get; set; }
    public DateTime? CheckOutAt { get; set; }
    public string? DockCode { get; set; }
    public string? DockName { get; set; }
    public string BookingType { get; set; } = null!;
    public DateOnly ScheduledDate { get; set; }
    public TimeOnly ScheduledStart { get; set; }
    public TimeOnly ScheduledEnd { get; set; }
    public int WarehouseId { get; set; }
}
