using System;

namespace BACKEND.DTOs
{
    public class VehicleEventDto
    {
        public int EventId { get; set; }
        public int VehicleId { get; set; }
        public string EventType { get; set; } = null!;
        public DateTime EventTime { get; set; }
        public string? Remarks { get; set; }
    }

    public class CreateVehicleEventDto
    {
        public int VehicleId { get; set; }
        public string EventType { get; set; } = null!; // 'CheckIn', 'CheckOut', 'Load', 'Unload'
        public string? Remarks { get; set; }
    }

    public class TripCountDto
    {
        public int VehicleId { get; set; }
        public string TruckPlate { get; set; } = string.Empty;
        public int CompletedTripCount { get; set; }
    }
}
