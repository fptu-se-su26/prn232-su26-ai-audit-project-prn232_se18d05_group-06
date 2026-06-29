using System;

namespace BACKEND.DTOs
{
    public class VehicleDto
    {
        public int VehicleId { get; set; }
        public string LicensePlate { get; set; } = string.Empty;
        public string VehicleModel { get; set; } = string.Empty;
        public decimal PayloadKg { get; set; }
        public decimal VolumeCbm { get; set; }
        public DateTime InsuranceExpiry { get; set; }
        public DateTime RegistrationExpiry { get; set; }
        public decimal FuelConsumptionRate { get; set; }
        public string Status { get; set; } = "AVAILABLE";
        public bool IsBlacklisted { get; set; }
        public string? BlacklistReason { get; set; }
    }

    public class DetectVehicleRequestDto
    {
        public string LicensePlate { get; set; } = string.Empty;
    }

    public class ApproveVehicleRequestDto
    {
        public string VehicleModel { get; set; } = string.Empty;
        public decimal PayloadKg { get; set; }
        public decimal VolumeCbm { get; set; }
        public DateTime InsuranceExpiry { get; set; }
        public DateTime RegistrationExpiry { get; set; }
        public decimal FuelConsumptionRate { get; set; }
    }
}
