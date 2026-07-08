using System;

namespace BACKEND.DTOs
{
    public class GateCheckResultDto
    {
        public bool IsAllowed { get; set; }
        public string Status { get; set; } = null!;
        public string Message { get; set; } = null!;
        
        // Optional payload fields if allowed
        public int? VehicleId { get; set; }
        public int? BookingId { get; set; }
        public string? TruckPlate { get; set; }
    }
}
