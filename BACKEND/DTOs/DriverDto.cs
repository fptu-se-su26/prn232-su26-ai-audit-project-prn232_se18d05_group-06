using System;

namespace BACKEND.DTOs
{
    public class DriverDto
    {
        public int DriverId { get; set; }
        public string DriverCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string LicenseNo { get; set; } = string.Empty;
        public DateTime? LicenseExpiry { get; set; }
        public bool IsBlacklisted { get; set; }
        public string? BlacklistReason { get; set; }
        public bool IsActive { get; set; }
    }
}
