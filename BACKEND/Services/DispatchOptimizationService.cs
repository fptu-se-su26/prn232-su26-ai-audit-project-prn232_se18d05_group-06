using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace BACKEND.Services;

public class DispatchOptimizationService : IDispatchOptimizationService
{
    private readonly SmartLogAiContext _context;

    public DispatchOptimizationService(SmartLogAiContext context)
    {
        _context = context;
    }

    public async Task<DispatchOptimizationQueueDto> GetQueueAsync(int? warehouseId)
    {
        var now = DateTime.UtcNow;
        var activeStatuses = new[] { "CHECKED_IN", "WAITING", "HOLD" };

        var bookings = await _context.SlotBookings
            .Include(b => b.Vehicle)
            .Include(b => b.Driver)
            .Include(b => b.Customer)
            .Include(b => b.Order!)
                .ThenInclude(o => o.OrderLines)
                    .ThenInclude(l => l.Sku)
            .Where(b => activeStatuses.Contains((b.Status ?? string.Empty).ToUpper()) && b.CheckOutAt == null)
            .Where(b => !warehouseId.HasValue || b.WarehouseId == warehouseId.Value)
            .AsNoTracking()
            .ToListAsync();

        var warehouseIds = bookings.Select(b => b.WarehouseId).Distinct().ToList();
        if (warehouseId.HasValue && !warehouseIds.Contains(warehouseId.Value)) warehouseIds.Add(warehouseId.Value);

        var docks = await _context.Docks
            .Where(d => warehouseIds.Contains(d.WarehouseId) && d.IsActive == true)
            .AsNoTracking()
            .ToListAsync();

        var activeSessions = await _context.VehicleDockSessions
            .Include(s => s.Vehicle)
            .Include(s => s.Booking)
            .Where(s => s.DockEndTime == null)
            .AsNoTracking()
            .ToListAsync();

        var recommendations = bookings.Select(b => BuildRecommendation(b, docks, activeSessions, now)).ToList();
        recommendations = recommendations
            .OrderByDescending(r => r.PriorityScore)
            .ThenBy(r => r.SlaMinutesLeft ?? int.MaxValue)
            .ThenByDescending(r => r.WaitingMinutes)
            .ThenBy(r => r.CheckInAt ?? DateTime.MaxValue)
            .ToList();

        for (var i = 0; i < recommendations.Count; i++)
        {
            recommendations[i].Rank = i + 1;
        }

        var dockDtos = docks
            .OrderBy(d => d.DockCode)
            .Select(d => BuildDockDto(d, activeSessions.FirstOrDefault(s => s.DockId == d.DockId), now))
            .ToList();

        return new DispatchOptimizationQueueDto
        {
            TotalWaiting = recommendations.Count,
            AverageWaitingMinutes = recommendations.Count == 0 ? 0 : Math.Round(recommendations.Average(r => r.WaitingMinutes), 1),
            AvailableDocks = dockDtos.Count(d => d.Status == "AVAILABLE"),
            OccupiedDocks = dockDtos.Count(d => d.Status == "OCCUPIED"),
            MaintenanceDocks = dockDtos.Count(d => d.Status == "MAINTENANCE"),
            HighPriorityOrders = recommendations.Count(r => r.OrderPriority is "HIGH" or "URGENT"),
            OverSlaRisk = recommendations.Count(r => r.SlaMinutesLeft.HasValue && r.SlaMinutesLeft.Value <= 60),
            Recommendations = recommendations,
            Docks = dockDtos
        };
    }

    public async Task<DispatchActionResponseDto> AssignDockAsync(AssignDockRequestDto request)
    {
        var booking = await _context.SlotBookings
            .Include(b => b.Order!)
                .ThenInclude(o => o.OrderLines)
                    .ThenInclude(l => l.Sku)
            .Include(b => b.Vehicle)
            .FirstOrDefaultAsync(b => b.BookingId == request.BookingId);

        if (booking == null)
            return Fail("NOT_FOUND", "Booking was not found.");

        if (!IsWaitingStatus(booking.Status))
            return Fail("INVALID_STATUS", "Only checked-in or waiting bookings can be assigned to a dock.");

        var dock = await _context.Docks.FirstOrDefaultAsync(d => d.DockId == request.DockId && d.IsActive == true);
        if (dock == null)
            return Fail("DOCK_NOT_FOUND", "Dock was not found or inactive.");

        if (string.Equals(dock.Status, "MAINTENANCE", StringComparison.OrdinalIgnoreCase))
            return Fail("DOCK_MAINTENANCE", "Cannot assign vehicle to a maintenance dock.");

        var dockBusy = await _context.VehicleDockSessions.AnyAsync(s => s.DockId == dock.DockId && s.DockEndTime == null);
        if (dockBusy || string.Equals(dock.Status, "OCCUPIED", StringComparison.OrdinalIgnoreCase))
            return Fail("DOCK_OCCUPIED", "Dock is already occupied.");

        var cargoType = ResolveCargoType(booking);
        if (!IsDockCompatible(dock, booking.BookingType, cargoType))
            return Fail("DOCK_INCOMPATIBLE", "Suggested dock is not compatible with this service or cargo type.");

        var now = DateTime.UtcNow;
        var allDocks = await _context.Docks.Where(d => d.WarehouseId == booking.WarehouseId && d.IsActive == true).ToListAsync();
        var activeSessions = await _context.VehicleDockSessions.Where(s => s.DockEndTime == null).ToListAsync();
        var recommendation = BuildRecommendation(booking, allDocks, activeSessions, now);

        booking.DockId = dock.DockId;
        booking.Status = "ASSIGNED_TO_DOCK";
        booking.PriorityScore = recommendation.PriorityScore;
        if (booking.Order != null)
        {
            booking.Order.PriorityScore = recommendation.PriorityScore;
        }

        dock.Status = "OCCUPIED";

        if (booking.VehicleId.HasValue)
        {
            _context.VehicleDockSessions.Add(new VehicleDockSession
            {
                VehicleId = booking.VehicleId.Value,
                BookingId = booking.BookingId,
                DockId = dock.DockId,
                CheckInTime = booking.CheckInAt ?? now,
                DockStartTime = now,
                CurrentStatus = booking.BookingType.ToUpper() == "OUTBOUND" ? "LOADING" : "UNLOADING",
                ServiceType = NormalizeServiceType(booking.BookingType),
                CargoType = cargoType,
                LastStatusAt = now,
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        await _context.SaveChangesAsync();

        return new DispatchActionResponseDto
        {
            Success = true,
            Status = "ASSIGNED_TO_DOCK",
            Message = $"Vehicle {booking.Vehicle?.TruckPlate ?? booking.AlprPlate ?? "UNKNOWN"} assigned to dock {dock.DockCode}.",
            DockId = dock.DockId,
            DockCode = dock.DockCode
        };
    }

    public async Task<DispatchActionResponseDto> HoldVehicleAsync(HoldVehicleRequestDto request)
    {
        var booking = await _context.SlotBookings.FirstOrDefaultAsync(b => b.BookingId == request.BookingId);
        if (booking == null) return Fail("NOT_FOUND", "Booking was not found.");
        if (!IsWaitingStatus(booking.Status)) return Fail("INVALID_STATUS", "Only waiting bookings can be held.");

        booking.Status = "HOLD";
        await _context.SaveChangesAsync();

        return new DispatchActionResponseDto
        {
            Success = true,
            Status = "HOLD",
            Message = string.IsNullOrWhiteSpace(request.Reason)
                ? "Vehicle was put on hold."
                : $"Vehicle was put on hold: {request.Reason}"
        };
    }

    public async Task<DispatchActionResponseDto> OverridePriorityAsync(OverridePriorityRequestDto request)
    {
        var booking = await _context.SlotBookings
            .Include(b => b.Order!)
            .FirstOrDefaultAsync(b => b.BookingId == request.BookingId);

        if (booking == null) return Fail("NOT_FOUND", "Booking was not found.");

        var normalizedPriority = NormalizePriority(request.NewPriority);
        var score = normalizedPriority switch
        {
            "URGENT" => 100,
            "HIGH" => 80,
            "NORMAL" => 50,
            "LOW" => 20,
            _ => 50
        };

        booking.PriorityScore = score;
        if (booking.Order != null)
        {
            booking.Order.Priority = normalizedPriority;
            booking.Order.PriorityScore = score;
        }

        await _context.SaveChangesAsync();

        return new DispatchActionResponseDto
        {
            Success = true,
            Status = normalizedPriority,
            Message = string.IsNullOrWhiteSpace(request.Reason)
                ? $"Priority overridden to {normalizedPriority}."
                : $"Priority overridden to {normalizedPriority}: {request.Reason}"
        };
    }

    public async Task<DispatchActionResponseDto> SeedDemoDataAsync()
    {
        var candidatePaths = new[]
        {
            Path.Combine(Directory.GetCurrentDirectory(), "..", "setup-dispatch-optimization.sql"),
            Path.Combine(Directory.GetCurrentDirectory(), "setup-dispatch-optimization.sql"),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "setup-dispatch-optimization.sql")
        };

        var sqlPath = candidatePaths.Select(Path.GetFullPath).FirstOrDefault(File.Exists);
        if (sqlPath == null)
        {
            return Fail("SEED_FILE_NOT_FOUND", "setup-dispatch-optimization.sql was not found.");
        }

        var sql = await File.ReadAllTextAsync(sqlPath);
        var batches = Regex.Split(sql, @"^\s*GO\s*;?\s*$", RegexOptions.Multiline | RegexOptions.IgnoreCase)
            .Select(batch => batch.Trim())
            .Where(batch => !string.IsNullOrWhiteSpace(batch))
            .ToList();

        foreach (var batch in batches)
        {
            await _context.Database.ExecuteSqlRawAsync(batch);
        }

        return new DispatchActionResponseDto
        {
            Success = true,
            Status = "SEEDED",
            Message = "Dispatch queue data has been refreshed. Reload the screen to view vehicles and docks."
        };
    }
    private DispatchOptimizationRecommendationDto BuildRecommendation(SlotBooking booking, List<Dock> docks, List<VehicleDockSession> activeSessions, DateTime now)
    {
        var cargoType = ResolveCargoType(booking);
        var orderPriority = NormalizePriority(booking.Order?.Priority);
        var customerTier = NormalizeTier(booking.Customer?.Tier);
        var serviceType = NormalizeServiceType(booking.BookingType);
        var checkInAt = booking.CheckInAt ?? BuildScheduledDateTime(booking);
        var waitingMinutes = Math.Max(0, (int)Math.Round((now - checkInAt).TotalMinutes));
        var slaDeadline = ResolveSlaDeadline(booking, checkInAt);
        int? slaMinutesLeft = slaDeadline.HasValue ? (int)Math.Round((slaDeadline.Value - now).TotalMinutes) : null;
        var availableDock = FindBestDock(booking.WarehouseId, serviceType, cargoType, docks, activeSessions, true);
        var compatibleDock = availableDock ?? FindBestDock(booking.WarehouseId, serviceType, cargoType, docks, activeSessions, false);

        var breakdown = new DispatchOptimizationScoreBreakdownDto
        {
            WaitingTimeScore = ScoreWaitingTime(waitingMinutes),
            CargoTypeScore = ScoreCargo(cargoType),
            OrderPriorityScore = ScoreOrderPriority(orderPriority, booking.PriorityScore ?? booking.Order?.PriorityScore),
            CustomerTierScore = ScoreTier(customerTier),
            SlaUrgencyScore = ScoreSla(slaMinutesLeft),
            DockCompatibilityScore = ScoreDock(availableDock, compatibleDock)
        };

        var total = breakdown.WaitingTimeScore + breakdown.CargoTypeScore + breakdown.OrderPriorityScore + breakdown.CustomerTierScore + breakdown.SlaUrgencyScore + breakdown.DockCompatibilityScore;

        return new DispatchOptimizationRecommendationDto
        {
            BookingId = booking.BookingId,
            BookingCode = booking.BookingCode,
            OrderCode = booking.Order?.OrderCode,
            LicensePlate = booking.Vehicle?.TruckPlate ?? booking.AlprPlate ?? "UNKNOWN",
            DriverName = booking.Driver?.FullName ?? "Unassigned driver",
            CustomerName = booking.Customer?.CompanyName ?? "Unknown customer",
            CustomerTier = customerTier,
            ServiceType = serviceType,
            CargoType = cargoType,
            OrderPriority = orderPriority,
            Status = booking.Status ?? "WAITING",
            CheckInAt = booking.CheckInAt,
            WaitingMinutes = waitingMinutes,
            SlaDeadline = slaDeadline,
            SlaMinutesLeft = slaMinutesLeft,
            PriorityScore = total,
            SuggestedDockId = availableDock?.DockId,
            SuggestedDockCode = availableDock?.DockCode,
            SuggestedDockName = availableDock?.DockName,
            RecommendationReason = BuildReason(cargoType, orderPriority, customerTier, waitingMinutes, availableDock),
            ScoreBreakdown = breakdown
        };
    }

    private DispatchOptimizationDockDto BuildDockDto(Dock dock, VehicleDockSession? session, DateTime now)
    {
        var status = (dock.Status ?? "AVAILABLE").ToUpper();
        if (session != null) status = "OCCUPIED";

        return new DispatchOptimizationDockDto
        {
            DockId = dock.DockId,
            DockCode = dock.DockCode,
            DockName = dock.DockName,
            Status = status,
            SuggestedFor = InferDockCapability(dock),
            CurrentVehiclePlate = session?.Vehicle?.TruckPlate,
            CurrentBookingCode = session?.Booking?.BookingCode,
            OccupiedMinutes = session == null ? null : Math.Max(0, (int)Math.Round((now - session.DockStartTime).TotalMinutes))
        };
    }

    private Dock? FindBestDock(int warehouseId, string serviceType, string cargoType, List<Dock> docks, List<VehicleDockSession> activeSessions, bool requireAvailable)
    {
        return docks
            .Where(d => d.WarehouseId == warehouseId && d.IsActive == true)
            .Where(d => !string.Equals(d.Status, "MAINTENANCE", StringComparison.OrdinalIgnoreCase))
            .Where(d => IsDockCompatible(d, serviceType, cargoType))
            .Where(d => !requireAvailable || (!string.Equals(d.Status, "OCCUPIED", StringComparison.OrdinalIgnoreCase) && !activeSessions.Any(s => s.DockId == d.DockId)))
            .OrderByDescending(d => DockSpecificity(d, serviceType, cargoType))
            .ThenBy(d => d.DockCode)
            .FirstOrDefault();
    }

    private static bool IsWaitingStatus(string? status)
    {
        var s = (status ?? string.Empty).ToUpper();
        return s is "CHECKED_IN" or "WAITING" or "HOLD";
    }

    private static DateTime BuildScheduledDateTime(SlotBooking booking)
    {
        return booking.ScheduledDate.ToDateTime(booking.ScheduledStart);
    }

    private static DateTime? ResolveSlaDeadline(SlotBooking booking, DateTime baseline)
    {
        if (booking.ScheduledEnd != default)
        {
            return booking.ScheduledDate.ToDateTime(booking.ScheduledEnd).AddMinutes(60);
        }

        return baseline.AddHours(2);
    }

    private static string ResolveCargoType(SlotBooking booking)
    {
        var orderLines = booking.Order?.OrderLines ?? new List<OrderLine>();
        if (orderLines.Any(l => l.Sku?.IsHazmat == true)) return "HAZMAT";
        if (orderLines.Any(l => string.Equals(l.Sku?.StorageTemp, "COLD", StringComparison.OrdinalIgnoreCase) || string.Equals(l.Sku?.StorageTemp, "CHILLED", StringComparison.OrdinalIgnoreCase))) return "COLD";
        if (orderLines.Any(l => l.Sku?.IsFragile == true)) return "FRAGILE";
        if (orderLines.Any(l => l.Sku?.IsHeavy == true)) return "HEAVY";
        return "NORMAL";
    }

    private static string NormalizeServiceType(string? serviceType)
    {
        var s = (serviceType ?? "INBOUND").ToUpper();
        if (s.Contains("OUT")) return "OUTBOUND";
        return "INBOUND";
    }

    private static string NormalizePriority(string? priority)
    {
        var p = (priority ?? "NORMAL").ToUpper();
        return p is "LOW" or "NORMAL" or "HIGH" or "URGENT" ? p : "NORMAL";
    }

    private static string NormalizeTier(string? tier)
    {
        var t = (tier ?? "STANDARD").ToUpper();
        return t is "VIP" or "GOLD" or "SILVER" or "STANDARD" ? t : "STANDARD";
    }

    private static int ScoreWaitingTime(int minutes) => minutes switch
    {
        >= 120 => 50,
        >= 60 => 35,
        >= 30 => 20,
        >= 15 => 10,
        _ => 5
    };

    private static int ScoreCargo(string cargoType) => cargoType switch
    {
        "HAZMAT" => 30,
        "PERISHABLE" => 25,
        "COLD" => 20,
        "FRAGILE" => 10,
        "HEAVY" => 8,
        _ => 5
    };

    private static int ScoreOrderPriority(string priority, int? existingScore)
    {
        if (existingScore.HasValue && existingScore.Value >= 90) return 40;
        return priority switch
        {
            "URGENT" => 40,
            "HIGH" => 25,
            "NORMAL" => 10,
            _ => 0
        };
    }

    private static int ScoreTier(string tier) => tier switch
    {
        "VIP" => 25,
        "GOLD" => 15,
        "SILVER" => 5,
        _ => 0
    };

    private static int ScoreSla(int? minutesLeft)
    {
        if (!minutesLeft.HasValue) return 0;
        if (minutesLeft.Value < 0) return 40;
        if (minutesLeft.Value <= 60) return 20;
        if (minutesLeft.Value <= 120) return 10;
        return 0;
    }

    private static int ScoreDock(Dock? availableDock, Dock? compatibleDock)
    {
        if (availableDock != null) return 20;
        if (compatibleDock != null) return 5;
        return -30;
    }

    private static bool IsDockCompatible(Dock dock, string? serviceType, string? cargoType)
    {
        var code = (dock.DockCode + " " + dock.DockName).ToUpper();
        var service = NormalizeServiceType(serviceType);
        var cargo = (cargoType ?? "NORMAL").ToUpper();

        if (cargo == "COLD" && !(code.Contains("COLD") || code.Contains("LANH") || code.Contains("Láº NH") || code.Contains("REF")))
        {
            return false;
        }

        if (cargo == "HAZMAT" && !(code.Contains("HAZ") || code.Contains("DG") || code.Contains("NGUY")))
        {
            return false;
        }

        if (service == "OUTBOUND" && (code.Contains("IN-") || code.Contains("NHAP") || code.Contains("NHáº¬P")))
        {
            return false;
        }

        if (service == "INBOUND" && (code.Contains("OUT-") || code.Contains("XUAT") || code.Contains("XUáº¤T")))
        {
            return false;
        }

        return true;
    }

    private static int DockSpecificity(Dock dock, string serviceType, string cargoType)
    {
        var code = (dock.DockCode + " " + dock.DockName).ToUpper();
        var score = 0;
        if (cargoType == "COLD" && (code.Contains("COLD") || code.Contains("LANH") || code.Contains("Láº NH") || code.Contains("REF"))) score += 20;
        if (cargoType == "HAZMAT" && (code.Contains("HAZ") || code.Contains("DG") || code.Contains("NGUY"))) score += 20;
        if (serviceType == "OUTBOUND" && (code.Contains("OUT") || code.Contains("XUAT") || code.Contains("XUáº¤T"))) score += 10;
        if (serviceType == "INBOUND" && (code.Contains("IN") || code.Contains("NHAP") || code.Contains("NHáº¬P"))) score += 10;
        return score;
    }

    private static string InferDockCapability(Dock dock)
    {
        var code = (dock.DockCode + " " + dock.DockName).ToUpper();
        if (code.Contains("COLD") || code.Contains("LANH") || code.Contains("Láº NH") || code.Contains("REF")) return "COLD";
        if (code.Contains("HAZ") || code.Contains("DG") || code.Contains("NGUY")) return "HAZMAT";
        if (code.Contains("OUT") || code.Contains("XUAT") || code.Contains("XUáº¤T")) return "OUTBOUND";
        if (code.Contains("IN") || code.Contains("NHAP") || code.Contains("NHáº¬P")) return "INBOUND";
        return "BOTH";
    }

    private static string BuildReason(string cargoType, string orderPriority, string customerTier, int waitingMinutes, Dock? dock)
    {
        var reasons = new List<string>();
        if (waitingMinutes >= 60) reasons.Add($"waiting {waitingMinutes} minutes");
        if (cargoType is "COLD" or "HAZMAT" or "FRAGILE") reasons.Add($"cargo {cargoType}");
        if (orderPriority is "HIGH" or "URGENT") reasons.Add($"order {orderPriority}");
        if (customerTier is "GOLD" or "VIP") reasons.Add($"customer {customerTier}");
        reasons.Add(dock != null ? $"dock {dock.DockCode} available" : "no compatible dock available");
        return string.Join("; ", reasons);
    }

    private static DispatchActionResponseDto Fail(string status, string message)
    {
        return new DispatchActionResponseDto
        {
            Success = false,
            Status = status,
            Message = message
        };
    }
}

