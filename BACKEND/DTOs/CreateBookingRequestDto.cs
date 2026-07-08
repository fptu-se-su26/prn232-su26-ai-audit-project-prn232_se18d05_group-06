using System;
using System.ComponentModel.DataAnnotations;

namespace BACKEND.DTOs
{
    public class CreateBookingRequestDto
    {
        [Required]
        public int WarehouseId { get; set; }

        [Required]
        public DateTime BookingDate { get; set; }

        [Required]
        [RegularExpression(@"^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "StartTime must be in HH:mm format.")]
        public string StartTime { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "EndTime must be in HH:mm format.")]
        public string EndTime { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string LicensePlate { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string DriverEmail { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string DockName { get; set; } = string.Empty;
    }
}
