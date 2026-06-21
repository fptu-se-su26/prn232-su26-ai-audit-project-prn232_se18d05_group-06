using System;

namespace BACKEND.DTOs
{
    public class CheckoutResponseDto
    {
        public string BarrierCommand { get; set; } = "OPEN_EXIT";
        public string Message { get; set; } = string.Empty;
        public int BookingId { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CheckOutAt { get; set; }
        public int? DockId { get; set; }
        public string? DockCode { get; set; }
    }
}
