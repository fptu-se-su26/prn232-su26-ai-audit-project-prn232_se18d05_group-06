using System;

namespace BACKEND.DTOs
{
    public class BookingResponseDto
    {
        public int ReceiptId { get; set; }
        public string BookingId { get; set; } = string.Empty; // Maps to InvoiceNo
        public int WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string DockName { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string LicensePlate { get; set; } = string.Empty;
        public string DriverEmail { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string QrCodeBase64 { get; set; } = string.Empty;
    }
}
