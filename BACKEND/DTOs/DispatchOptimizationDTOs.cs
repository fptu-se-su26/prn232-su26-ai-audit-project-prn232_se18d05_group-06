using System;
using System.Collections.Generic;

namespace BACKEND.DTOs;

public class DispatchOptimizationQueueDto
{
    public int TotalWaiting { get; set; }
    public double AverageWaitingMinutes { get; set; }
    public int AvailableDocks { get; set; }
    public int OccupiedDocks { get; set; }
    public int MaintenanceDocks { get; set; }
    public int HighPriorityOrders { get; set; }
    public int OverSlaRisk { get; set; }
    public List<DispatchOptimizationRecommendationDto> Recommendations { get; set; } = new();
    public List<DispatchOptimizationDockDto> Docks { get; set; } = new();
}

public class DispatchOptimizationRecommendationDto
{
    public int Rank { get; set; }
    public int BookingId { get; set; }
    public string BookingCode { get; set; } = string.Empty;
    public string? OrderCode { get; set; }
    public string LicensePlate { get; set; } = string.Empty;
    public string DriverName { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerTier { get; set; } = "STANDARD";
    public string ServiceType { get; set; } = "INBOUND";
    public string CargoType { get; set; } = "NORMAL";
    public string OrderPriority { get; set; } = "NORMAL";
    public string Status { get; set; } = "WAITING";
    public DateTime? CheckInAt { get; set; }
    public int WaitingMinutes { get; set; }
    public DateTime? SlaDeadline { get; set; }
    public int? SlaMinutesLeft { get; set; }
    public int PriorityScore { get; set; }
    public int? SuggestedDockId { get; set; }
    public string? SuggestedDockCode { get; set; }
    public string? SuggestedDockName { get; set; }
    public string RecommendationReason { get; set; } = string.Empty;
    public DispatchOptimizationScoreBreakdownDto ScoreBreakdown { get; set; } = new();
}

public class DispatchOptimizationScoreBreakdownDto
{
    public int WaitingTimeScore { get; set; }
    public int CargoTypeScore { get; set; }
    public int OrderPriorityScore { get; set; }
    public int CustomerTierScore { get; set; }
    public int SlaUrgencyScore { get; set; }
    public int DockCompatibilityScore { get; set; }
}

public class DispatchOptimizationDockDto
{
    public int DockId { get; set; }
    public string DockCode { get; set; } = string.Empty;
    public string? DockName { get; set; }
    public string Status { get; set; } = "AVAILABLE";
    public string SuggestedFor { get; set; } = "BOTH";
    public string? CurrentVehiclePlate { get; set; }
    public string? CurrentBookingCode { get; set; }
    public int? OccupiedMinutes { get; set; }
}

public class AssignDockRequestDto
{
    public int BookingId { get; set; }
    public int DockId { get; set; }
    public int? DispatcherId { get; set; }
}

public class HoldVehicleRequestDto
{
    public int BookingId { get; set; }
    public string? Reason { get; set; }
}

public class OverridePriorityRequestDto
{
    public int BookingId { get; set; }
    public string NewPriority { get; set; } = "URGENT";
    public string? Reason { get; set; }
}

public class DispatchActionResponseDto
{
    public bool Success { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int? DockId { get; set; }
    public string? DockCode { get; set; }
}