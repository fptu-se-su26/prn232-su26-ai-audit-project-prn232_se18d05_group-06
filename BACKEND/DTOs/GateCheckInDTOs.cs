using System;

namespace BACKEND.DTOs
{
    public class GateCheckInRequestDto
    {
        public string? BookingCode { get; set; }
        public string? AlprPlate { get; set; }
    }

    public class GateCheckInResponseDto
    {
        public string BarrierCommand { get; set; } = "OPEN_ENTRY";
        public string Message { get; set; } = string.Empty;
        public int BookingId { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CheckInAt { get; set; }
        public int? DockId { get; set; }
        public string? DockCode { get; set; }
    }

    public class GateAccessDeniedResponseDto
    {
        public bool AccessDenied { get; set; } = true;
        public string AlertType { get; set; } = "BLACKLIST_DETECTED";
        public string AlarmLevel { get; set; } = "CRITICAL";
        public string BlockedEntity { get; set; } = string.Empty; // "Vehicle", "Driver", or "Both"
        public string Reason { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public string DriverName { get; set; } = string.Empty;
    }
}
