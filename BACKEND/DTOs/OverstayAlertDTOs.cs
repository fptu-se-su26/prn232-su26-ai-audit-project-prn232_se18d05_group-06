namespace BACKEND.DTOs;

public class OverstayAlertDto
{
    public int AlertId { get; set; }
    public int VehicleDockSessionId { get; set; }
    public int VehicleId { get; set; }
    public string LicensePlate { get; set; } = string.Empty;
    public string? VehicleType { get; set; }
    public string? DriverName { get; set; }
    public string? BookingCode { get; set; }
    public int DockId { get; set; }
    public string DockCode { get; set; } = string.Empty;
    public string? DockName { get; set; }
    public string? CustomerName { get; set; }
    public string CurrentStatus { get; set; } = string.Empty;
    public string ServiceType { get; set; } = string.Empty;
    public string? CargoType { get; set; }
    public DateTime? CheckInTime { get; set; }
    public DateTime DockStartTime { get; set; }
    public int SlaMinutes { get; set; }
    public int ActualMinutes { get; set; }
    public int OverstayMinutes { get; set; }
    public string AlertLevel { get; set; } = string.Empty;
    public string AlertStatus { get; set; } = string.Empty;
    public string AlertMessage { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string? ActionTaken { get; set; }
    public DateTime? LastCheckedAt { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
}

public class OverstayAlertSummaryDto
{
    public int TotalInYard { get; set; }
    public int InDock { get; set; }
    public int Warning { get; set; }
    public int Overstay { get; set; }
    public int Critical { get; set; }
}

public class OverstayAlertDashboardDto
{
    public OverstayAlertSummaryDto Summary { get; set; } = new();
    public List<OverstayAlertDto> Alerts { get; set; } = new();
}

public class ResolveOverstayAlertRequestDto
{
    public string? Reason { get; set; }
    public string? ActionTaken { get; set; }
    public string AlertStatus { get; set; } = "RESOLVED";
    public int? ResolvedBy { get; set; }
}

public class UpdateDockSessionStatusRequestDto
{
    public string CurrentStatus { get; set; } = string.Empty;
    public DateTime? DockEndTime { get; set; }
}
