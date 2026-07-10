using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using BACKEND.DTOs.VehicleDashboard;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Services;

public class VehicleDashboardService : IVehicleDashboardService
{
    private readonly SmartLogAiContext _context;

    public VehicleDashboardService(SmartLogAiContext context)
    {
        _context = context;
    }

    public async Task<VehicleStatusSummaryDto> GetVehicleStatusSummaryAsync(string filterMode, DateTime date, string? month)
    {
        var query = _context.SlotBookings
            .Include(b => b.GateLogs)
            .AsQueryable();

        query = ApplyDateFilter(query, filterMode, date, month);

        var bookings = await query.ToListAsync();
        var targetDate = DateOnly.FromDateTime(date);

        var summary = new VehicleStatusSummaryDto();

        foreach (var b in bookings)
        {
            var determinedStatus = DetermineStatus(b, targetDate);
            switch (determinedStatus)
            {
                case "SCHEDULED": summary.Scheduled++; break;
                case "WAITING": summary.Waiting++; break;
                case "UNLOADING": summary.Unloading++; break;
                case "LOADING": summary.Loading++; break;
                case "COMPLETED": summary.Completed++; break;
                case "DEPARTED": summary.Departed++; break;
            }
        }

        return summary;
    }

    public async Task<List<VehicleStatusItemDto>> GetVehicleStatusListAsync(string filterMode, DateTime date, string? month, string? status)
    {
        var query = _context.SlotBookings
            .Include(b => b.Vehicle)
            .Include(b => b.Driver)
            .Include(b => b.Customer)
            .Include(b => b.Dock)
            .Include(b => b.GateLogs)
            .AsQueryable();

        query = ApplyDateFilter(query, filterMode, date, month);

        var bookings = await query.ToListAsync();
        var targetDate = DateOnly.FromDateTime(date);

        var resultList = new List<VehicleStatusItemDto>();

        foreach (var b in bookings)
        {
            var determinedStatus = DetermineStatus(b, targetDate);

            if (!string.IsNullOrEmpty(status) && determinedStatus != status.ToUpper())
            {
                continue;
            }

            resultList.Add(new VehicleStatusItemDto
            {
                BookingId = b.BookingId,
                BookingCode = b.BookingCode,
                TruckPlate = b.Vehicle?.TruckPlate,
                TrailerPlate = b.Vehicle?.TrailerPlate,
                DriverName = b.Driver?.FullName,
                CustomerName = b.Customer?.CompanyName,
                Status = determinedStatus,
                CheckInAt = b.CheckInAt,
                CheckOutAt = b.CheckOutAt,
                DockCode = b.Dock?.DockCode,
                DockName = b.Dock?.DockName,
                BookingType = b.BookingType,
                ScheduledDate = b.ScheduledDate,
                ScheduledStart = b.ScheduledStart,
                ScheduledEnd = b.ScheduledEnd,
                WarehouseId = b.WarehouseId
            });
        }

        return resultList;
    }

    public async Task<bool> UpdateVehicleStatusAsync(int bookingId, string status, string? dockCode)
    {
        var booking = await _context.SlotBookings
            .Include(b => b.GateLogs)
            .FirstOrDefaultAsync(b => b.BookingId == bookingId);

        if (booking == null) return false;

        switch (status.ToUpper())
        {
            case "SCHEDULED":
                booking.Status = "SCHEDULED";
                booking.CheckInAt = null;
                booking.CheckOutAt = null;
                booking.DockId = null;
                break;

            case "WAITING":
                booking.Status = "CHECKED_IN";
                booking.CheckInAt ??= DateTime.Now;
                booking.CheckOutAt = null;
                booking.DockId = null;
                break;

            case "UNLOADING":
                booking.Status = "IN_PROGRESS";
                booking.BookingType = "INBOUND";
                booking.CheckInAt ??= DateTime.Now;
                booking.CheckOutAt = null;
                if (!string.IsNullOrEmpty(dockCode))
                {
                    var dock = await _context.Docks.FirstOrDefaultAsync(d => d.WarehouseId == booking.WarehouseId && d.DockCode == dockCode);
                    if (dock != null) booking.DockId = dock.DockId;
                }
                break;

            case "LOADING":
                booking.Status = "IN_PROGRESS";
                booking.BookingType = "OUTBOUND";
                booking.CheckInAt ??= DateTime.Now;
                booking.CheckOutAt = null;
                if (!string.IsNullOrEmpty(dockCode))
                {
                    var dock = await _context.Docks.FirstOrDefaultAsync(d => d.WarehouseId == booking.WarehouseId && d.DockCode == dockCode);
                    if (dock != null) booking.DockId = dock.DockId;
                }
                break;

            case "COMPLETED":
                booking.Status = "COMPLETED";
                booking.CheckOutAt ??= DateTime.Now;
                break;

            case "DEPARTED":
                booking.Status = "DEPARTED";
                booking.CheckOutAt ??= DateTime.Now;
                
                // Add OUT gatelog if not exists to trigger "DEPARTED" determine status logic
                var hasOutLog = booking.GateLogs.Any(g => g.EventType == "OUT");
                if (!hasOutLog)
                {
                    _context.GateLogs.Add(new GateLog
                    {
                        BookingId = booking.BookingId,
                        VehicleId = booking.VehicleId,
                        DriverId = booking.DriverId,
                        EventType = "OUT",
                        EventAt = DateTime.Now
                    });
                }
                break;

            default:
                return false;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<DockDto>> GetDocksByWarehouseAsync(int warehouseId)
    {
        return await _context.Docks
            .Where(d => d.WarehouseId == warehouseId && d.IsActive == true)
            .Select(d => new DockDto
            {
                DockId = d.DockId,
                DockCode = d.DockCode,
                DockName = d.DockName
            })
            .ToListAsync();
    }

    private IQueryable<SlotBooking> ApplyDateFilter(IQueryable<SlotBooking> query, string filterMode, DateTime date, string? month)
    {
        switch (filterMode.ToLower())
        {
            case "day":
                var targetDate = DateOnly.FromDateTime(date);
                query = query.Where(b => b.ScheduledDate == targetDate);
                break;

            case "month":
                if (!string.IsNullOrEmpty(month) && DateTime.TryParseExact(month + "-01", "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedMonth))
                {
                    var monthStart = DateOnly.FromDateTime(parsedMonth);
                    var monthEnd = DateOnly.FromDateTime(parsedMonth.AddMonths(1).AddDays(-1));
                    query = query.Where(b => b.ScheduledDate >= monthStart && b.ScheduledDate <= monthEnd);
                }
                else
                {
                    var now = DateTime.Today;
                    var start = DateOnly.FromDateTime(new DateTime(now.Year, now.Month, 1));
                    var end = DateOnly.FromDateTime(new DateTime(now.Year, now.Month, DateTime.DaysInMonth(now.Year, now.Month)));
                    query = query.Where(b => b.ScheduledDate >= start && b.ScheduledDate <= end);
                }
                break;

            case "all":
                break;

            default:
                var today = DateOnly.FromDateTime(DateTime.Today);
                query = query.Where(b => b.ScheduledDate == today);
                break;
        }

        return query;
    }

    private string DetermineStatus(SlotBooking b, DateOnly targetDate)
    {
        // Đã rời kho: Status = "DEPARTED" OR có GateLog.EventType = "OUT" sau khi hoàn thành
        bool hasDepartedEvent = b.GateLogs.Any(g => g.EventType == "OUT" && b.CheckOutAt.HasValue && g.EventAt >= b.CheckOutAt);
        if (b.Status == "DEPARTED" || hasDepartedEvent)
            return "DEPARTED";

        // Hoàn thành: Status = "COMPLETED" AND CheckOutAt IS NOT NULL
        if (b.Status == "COMPLETED" && b.CheckOutAt.HasValue)
            return "COMPLETED";

        // Đang hạ hàng: Status = "IN_PROGRESS" AND BookingType = "INBOUND" AND DockId IS NOT NULL
        if (b.Status == "IN_PROGRESS" && b.BookingType == "INBOUND" && b.DockId.HasValue)
            return "UNLOADING";

        // Đang lấy hàng: Status = "IN_PROGRESS" AND BookingType = "OUTBOUND" AND DockId IS NOT NULL
        if (b.Status == "IN_PROGRESS" && b.BookingType == "OUTBOUND" && b.DockId.HasValue)
            return "LOADING";

        // Đang chờ: Status = "CHECKED_IN" AND CheckInAt IS NOT NULL AND DockId IS NULL
        if (b.Status == "CHECKED_IN" && b.CheckInAt.HasValue && !b.DockId.HasValue)
            return "WAITING";

        // Đã đặt lịch: Status = "SCHEDULED" AND CheckInAt IS NULL
        if (b.Status == "SCHEDULED" && !b.CheckInAt.HasValue)
            return "SCHEDULED";

        // Fallback
        return b.Status ?? "UNKNOWN";
    }
}
