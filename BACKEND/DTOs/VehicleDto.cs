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

    public class DispatcherVehicleDto
    {
        public int VehicleId { get; set; }
        public string TruckPlate { get; set; } = string.Empty;
        public string? TrailerPlate { get; set; }
        public string VehicleType { get; set; } = string.Empty;
        public decimal MaxWeightTon { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public string? OwnerPhone { get; set; }
        public bool IsInternal { get; set; }
        public int? DefaultDriverId { get; set; }
        public string? DefaultDriverName { get; set; }
        public string? DefaultDriverCode { get; set; }
        public DateTime? InspectionExpiry { get; set; }
        public DateTime? NextServiceDate { get; set; }
        public string? GpsDeviceId { get; set; }
        public bool IsBlacklisted { get; set; }
        public string? BlacklistReason { get; set; }
        public string Status { get; set; } = "ACTIVE";
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class UpsertDispatcherVehicleRequestDto
    {
        public string TruckPlate { get; set; } = string.Empty;
        public string? TrailerPlate { get; set; }
        public string VehicleType { get; set; } = string.Empty;
        public decimal MaxWeightTon { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public string? OwnerPhone { get; set; }
        public bool IsInternal { get; set; }
        public int? DefaultDriverId { get; set; }
        public DateTime? InspectionExpiry { get; set; }
        public DateTime? NextServiceDate { get; set; }
        public string? GpsDeviceId { get; set; }
        public string Status { get; set; } = "ACTIVE";
    }

    public class AssignVehicleDriverRequestDto
    {
        public int DriverId { get; set; }
    }

    public class BlacklistVehicleRequestDto
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class VehicleActionResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int? VehicleId { get; set; }
    }
}
