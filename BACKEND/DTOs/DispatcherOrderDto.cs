using System;

namespace BACKEND.DTOs
{
    public class DispatcherOrderDto
    {
        public string Id { get; set; } = string.Empty;
        public string Customer { get; set; } = string.Empty;
        public string Destination { get; set; } = string.Empty;
        public string DriverName { get; set; } = string.Empty;
        public string Vehicle { get; set; } = string.Empty;
        public string DriverAvatar { get; set; } = string.Empty;
        public string Eta { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public CoordinatesDto? Coordinates { get; set; }
        public TimelineDto[]? Timeline { get; set; }
        public DateTime? BookingDate { get; set; }
        public string? TimeRange { get; set; }
        public string? RecipientEmail { get; set; }
        public string? DelayReason { get; set; }
    }

    public class CoordinatesDto
    {
        public int X { get; set; }
        public int Y { get; set; }
    }

    public class TimelineDto
    {
        public string Title { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
        public bool Active { get; set; }
    }
}
