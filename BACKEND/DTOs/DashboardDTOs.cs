using System.Collections.Generic;

namespace BACKEND.DTOs
{
    public class DashboardKpiDto
    {
        public int TotalActiveVehicles { get; set; }
        public int MaintenanceAlerts { get; set; }
        public int ExpiringInspections { get; set; }
        public decimal FuelEfficiency { get; set; }
    }

    public class DashboardVehicleDto
    {
        public int VehicleId { get; set; }
        public string TruckPlate { get; set; } = string.Empty;
        public string? VehicleType { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? InspectionExpiry { get; set; }
        public string? NextServiceDate { get; set; }
        public bool IsBlacklisted { get; set; }
        public string? DriverName { get; set; }
    }

    public class DashboardDriverDto
    {
        public int DriverId { get; set; }
        public string DriverCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? LicenseNo { get; set; }
        public string? LicenseExpiry { get; set; }
        public bool IsActive { get; set; }
        public bool IsBlacklisted { get; set; }
    }

    public class DashboardDataDto
    {
        public DashboardKpiDto Kpi { get; set; } = new();
        public List<DashboardVehicleDto> PriorityVehicles { get; set; } = new();
        public List<DashboardDriverDto> Drivers { get; set; } = new();
    }
}
