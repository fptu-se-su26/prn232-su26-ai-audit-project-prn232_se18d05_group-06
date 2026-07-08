using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Services;

public class OverstayAlertService : IOverstayAlertService
{
    private static readonly string[] ActiveDockStatuses =
    {
        "WAITING_AT_DOCK",
        "LOADING",
        "UNLOADING",
        "DOCUMENT_CHECKING"
    };

    private readonly SmartLogAiContext _context;

    public OverstayAlertService(SmartLogAiContext context)
    {
        _context = context;
    }

    public async Task<OverstayAlertDashboardDto> GetDashboardAsync()
    {
        await CheckAsync();
        var alerts = await GetActiveAlertQuery().ToListAsync();
        return new OverstayAlertDashboardDto
        {
            Summary = await BuildSummaryAsync(),
            Alerts = alerts
        };
    }

    public async Task<OverstayAlertDto?> GetByIdAsync(int id)
    {
        return await GetAlertQuery().FirstOrDefaultAsync(a => a.AlertId == id);
    }

    public async Task<OverstayAlertDashboardDto> CheckAsync()
    {
        var now = DateTime.Now;
        await AutoCloseCompletedSessionsAsync(now);

        var sessions = await _context.VehicleDockSessions
            .Include(s => s.Vehicle)
            .Include(s => s.Dock)
            .Where(s => s.DockEndTime == null && ActiveDockStatuses.Contains(s.CurrentStatus))
            .ToListAsync();

        foreach (var session in sessions)
        {
            var actualMinutes = Math.Max(0, (int)Math.Floor((now - session.DockStartTime).TotalMinutes));
            var slaMinutes = await ResolveSlaMinutesAsync(session);
            var level = ResolveLevel(actualMinutes, slaMinutes);

            if (level == "NORMAL")
            {
                continue;
            }

            var overstayMinutes = Math.Max(0, actualMinutes - slaMinutes);
            var alert = await _context.OverstayAlerts
                .FirstOrDefaultAsync(a =>
                    a.VehicleDockSessionId == session.SessionId &&
                    a.AlertStatus != "RESOLVED" &&
                    a.AlertStatus != "AUTO_CLOSED");

            if (alert == null)
            {
                alert = new OverstayAlert
                {
                    VehicleDockSessionId = session.SessionId,
                    VehicleId = session.VehicleId,
                    DockId = session.DockId,
                    AlertStatus = level == "WARNING" ? "WARNING" : "OVERSTAY",
                    CreatedAt = now
                };
                _context.OverstayAlerts.Add(alert);
            }

            alert.SlaMinutes = slaMinutes;
            alert.ActualMinutes = actualMinutes;
            alert.OverstayMinutes = overstayMinutes;
            alert.AlertLevel = level;
            alert.AlertMessage = BuildAlertMessage(session, level, overstayMinutes, slaMinutes, actualMinutes);
            alert.LastCheckedAt = now;
            alert.UpdatedAt = now;
        }

        await _context.SaveChangesAsync();
        var alerts = await GetActiveAlertQuery().ToListAsync();
        return new OverstayAlertDashboardDto
        {
            Summary = await BuildSummaryAsync(),
            Alerts = alerts
        };
    }

    public async Task<OverstayAlertDashboardDto> UpdateDockSessionStatusAsync(int sessionId, UpdateDockSessionStatusRequestDto request)
    {
        var session = await _context.VehicleDockSessions.FirstOrDefaultAsync(s => s.SessionId == sessionId);
        if (session == null)
        {
            throw new KeyNotFoundException($"Vehicle dock session {sessionId} was not found.");
        }

        var status = request.CurrentStatus.Trim().ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(status))
        {
            throw new ArgumentException("CurrentStatus is required.");
        }

        session.CurrentStatus = status;
        session.LastStatusAt = DateTime.Now;
        session.UpdatedAt = DateTime.Now;

        if (status is "COMPLETED" or "CHECKED_OUT")
        {
            session.DockEndTime = request.DockEndTime ?? DateTime.Now;
        }

        await _context.SaveChangesAsync();
        return await CheckAsync();
    }

    public async Task<OverstayAlertDto> ResolveAsync(int id, ResolveOverstayAlertRequestDto request)
    {
        var alert = await _context.OverstayAlerts.FirstOrDefaultAsync(a => a.AlertId == id);
        if (alert == null)
        {
            throw new KeyNotFoundException($"Overstay alert {id} was not found.");
        }

        alert.AlertStatus = string.IsNullOrWhiteSpace(request.AlertStatus) ? "RESOLVED" : request.AlertStatus.Trim().ToUpperInvariant();
        alert.Reason = request.Reason;
        alert.ActionTaken = request.ActionTaken;
        alert.ResolvedBy = request.ResolvedBy;
        alert.ResolvedAt = alert.AlertStatus is "RESOLVED" or "AUTO_CLOSED" ? DateTime.Now : null;
        alert.UpdatedAt = DateTime.Now;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id) ?? throw new KeyNotFoundException($"Overstay alert {id} was not found.");
    }

    private async Task<int> ResolveSlaMinutesAsync(VehicleDockSession session)
    {
        var booking = session.BookingId.HasValue
            ? await _context.SlotBookings
                .Include(b => b.Customer)
                .ThenInclude(c => c!.Sla)
                .FirstOrDefaultAsync(b => b.BookingId == session.BookingId.Value)
            : null;

        if (booking?.Customer?.Sla?.MaxDockhours > 0)
        {
            return booking.Customer.Sla.MaxDockhours * 60;
        }

        return session.ServiceType.ToUpperInvariant() switch
        {
            "OUTBOUND" => 45,
            "COLD" => 30,
            "PERISHABLE" => 25,
            "FULL_CONTAINER" => 90,
            _ when string.Equals(session.CargoType, "COLD", StringComparison.OrdinalIgnoreCase) => 30,
            _ when string.Equals(session.CargoType, "PERISHABLE", StringComparison.OrdinalIgnoreCase) => 25,
            _ => 60
        };
    }

    private static string ResolveLevel(int actualMinutes, int slaMinutes)
    {
        if (actualMinutes > slaMinutes + 30)
        {
            return "CRITICAL";
        }

        if (actualMinutes > slaMinutes)
        {
            return actualMinutes - slaMinutes > 15 ? "OVERSTAY_MEDIUM" : "OVERSTAY";
        }

        return actualMinutes >= Math.Ceiling(slaMinutes * 0.8m) ? "WARNING" : "NORMAL";
    }

    private static string BuildAlertMessage(VehicleDockSession session, string level, int overstayMinutes, int slaMinutes, int actualMinutes)
    {
        return level switch
        {
            "WARNING" => $"Vehicle {session.Vehicle.TruckPlate} at dock {session.Dock.DockCode} has used {actualMinutes}/{slaMinutes} SLA minutes.",
            "CRITICAL" => $"Vehicle {session.Vehicle.TruckPlate} overstayed dock {session.Dock.DockCode} by {overstayMinutes} minutes. Immediate action required.",
            _ => $"Vehicle {session.Vehicle.TruckPlate} overstayed dock {session.Dock.DockCode} by {overstayMinutes} minutes."
        };
    }

    private async Task AutoCloseCompletedSessionsAsync(DateTime now)
    {
        var alerts = await _context.OverstayAlerts
            .Include(a => a.VehicleDockSession)
            .Where(a =>
                a.AlertStatus != "RESOLVED" &&
                a.AlertStatus != "AUTO_CLOSED" &&
                (a.VehicleDockSession.DockEndTime != null ||
                 a.VehicleDockSession.CurrentStatus == "COMPLETED" ||
                 a.VehicleDockSession.CurrentStatus == "CHECKED_OUT"))
            .ToListAsync();

        foreach (var alert in alerts)
        {
            alert.AlertStatus = "AUTO_CLOSED";
            alert.ActionTaken = "Auto-closed when vehicle dock session ended.";
            alert.ResolvedAt = now;
            alert.UpdatedAt = now;
        }
    }

    private async Task<OverstayAlertSummaryDto> BuildSummaryAsync()
    {
        var activeSessions = _context.VehicleDockSessions.Where(s => s.DockEndTime == null);
        var activeAlerts = _context.OverstayAlerts.Where(a => a.AlertStatus != "RESOLVED" && a.AlertStatus != "AUTO_CLOSED");

        return new OverstayAlertSummaryDto
        {
            TotalInYard = await activeSessions.CountAsync(),
            InDock = await activeSessions.CountAsync(s => ActiveDockStatuses.Contains(s.CurrentStatus)),
            Warning = await activeAlerts.CountAsync(a => a.AlertLevel == "WARNING"),
            Overstay = await activeAlerts.CountAsync(a => a.AlertLevel == "OVERSTAY" || a.AlertLevel == "OVERSTAY_MEDIUM"),
            Critical = await activeAlerts.CountAsync(a => a.AlertLevel == "CRITICAL")
        };
    }

    private IQueryable<OverstayAlertDto> GetActiveAlertQuery()
    {
        return GetAlertQuery()
            .Where(a => a.AlertStatus != "RESOLVED" && a.AlertStatus != "AUTO_CLOSED")
            .OrderByDescending(a => a.AlertLevel == "CRITICAL")
            .ThenByDescending(a => a.OverstayMinutes);
    }

    private IQueryable<OverstayAlertDto> GetAlertQuery()
    {
        return _context.OverstayAlerts
            .AsNoTracking()
            .Select(a => new OverstayAlertDto
            {
                AlertId = a.AlertId,
                VehicleDockSessionId = a.VehicleDockSessionId,
                VehicleId = a.VehicleId,
                LicensePlate = a.Vehicle.TruckPlate,
                VehicleType = a.Vehicle.VehicleType,
                DriverName = a.Vehicle.DefaultDriver != null ? a.Vehicle.DefaultDriver.FullName : null,
                BookingCode = a.VehicleDockSession.Booking != null ? a.VehicleDockSession.Booking.BookingCode : null,
                DockId = a.DockId,
                DockCode = a.Dock.DockCode,
                DockName = a.Dock.DockName,
                CustomerName = a.VehicleDockSession.Booking != null && a.VehicleDockSession.Booking.Customer != null
                    ? a.VehicleDockSession.Booking.Customer.CompanyName
                    : null,
                CurrentStatus = a.VehicleDockSession.CurrentStatus,
                ServiceType = a.VehicleDockSession.ServiceType,
                CargoType = a.VehicleDockSession.CargoType,
                CheckInTime = a.VehicleDockSession.CheckInTime,
                DockStartTime = a.VehicleDockSession.DockStartTime,
                SlaMinutes = a.SlaMinutes,
                ActualMinutes = a.ActualMinutes,
                OverstayMinutes = a.OverstayMinutes,
                AlertLevel = a.AlertLevel,
                AlertStatus = a.AlertStatus,
                AlertMessage = a.AlertMessage,
                Reason = a.Reason,
                ActionTaken = a.ActionTaken,
                LastCheckedAt = a.LastCheckedAt,
                CreatedAt = a.CreatedAt,
                ResolvedAt = a.ResolvedAt
            });
    }
}
