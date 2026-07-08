namespace BACKEND.DTOs
{
    public class ActiveBookingSummaryDto
    {
        public int BookingId { get; set; }
        public string BookingCode { get; set; } = null!;
        public string? AlprPlate { get; set; }
        public string TruckPlate { get; set; } = string.Empty;
        public string BookingType { get; set; } = null!;
        public string ScheduledDate { get; set; } = string.Empty;
        public string ScheduledTime { get; set; } = string.Empty;
        public string Status { get; set; } = null!;
        public string? DockCode { get; set; }
        public string? DockName { get; set; }
        public string? DriverName { get; set; }
        public string? CustomerName { get; set; }
    }
}
