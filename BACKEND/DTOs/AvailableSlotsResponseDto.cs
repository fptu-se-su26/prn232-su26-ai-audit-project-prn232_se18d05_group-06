using System.Collections.Generic;

namespace BACKEND.DTOs
{
    public class AvailableSlotsResponseDto
    {
        public string DockName { get; set; } = string.Empty;
        public List<SlotInfo> Slots { get; set; } = new List<SlotInfo>();
    }

    public class SlotInfo
    {
        public string TimeRange { get; set; } = string.Empty; // e.g., "08:00-10:00"
        public string StartTime { get; set; } = string.Empty;  // e.g., "08:00"
        public string EndTime { get; set; } = string.Empty;    // e.g., "10:00"
        public bool IsAvailable { get; set; } = true;
        public string? BookedLicensePlate { get; set; }
    }
}
