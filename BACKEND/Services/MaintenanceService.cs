using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Services;

public class MaintenanceService : IMaintenanceService
{
    private readonly SmartLogAiContext _context;
    private readonly IWebHostEnvironment _env;

    public MaintenanceService(SmartLogAiContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    public async Task<IEnumerable<MaintenanceSchedule>> GetMaintenanceSchedulesAsync(int vehicleId)
    {
        return await _context.MaintenanceSchedules
            .Where(s => s.VehicleId == vehicleId)
            .OrderBy(s => s.DueDate)
            .ToListAsync();
    }

    public async Task<MaintenanceSchedule> CreateMaintenanceScheduleAsync(CreateMaintenanceScheduleDto dto)
    {
        var schedule = new MaintenanceSchedule
        {
            VehicleId = dto.VehicleId,
            Type = dto.Type,
            DueDate = dto.DueDate,
            Notes = dto.Notes,
            Status = "PENDING",
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };

        _context.MaintenanceSchedules.Add(schedule);
        await _context.SaveChangesAsync();
        return schedule;
    }

    public async Task<MaintenanceSchedule> UpdateMaintenanceScheduleAsync(int id, UpdateMaintenanceScheduleDto dto)
    {
        var schedule = await _context.MaintenanceSchedules.FindAsync(id);
        if (schedule == null) return null;

        if (dto.Type != null) schedule.Type = dto.Type;
        if (dto.DueDate.HasValue) schedule.DueDate = dto.DueDate.Value;
        if (dto.Status != null) schedule.Status = dto.Status;
        if (dto.Notes != null) schedule.Notes = dto.Notes;

        schedule.UpdatedAt = DateTime.Now;
        await _context.SaveChangesAsync();
        return schedule;
    }

    public async Task<bool> DeleteMaintenanceScheduleAsync(int id)
    {
        var schedule = await _context.MaintenanceSchedules.FindAsync(id);
        if (schedule == null) return false;

        _context.MaintenanceSchedules.Remove(schedule);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<InspectionRecord>> GetInspectionRecordsAsync(int vehicleId)
    {
        return await _context.InspectionRecords
            .Where(r => r.VehicleId == vehicleId)
            .OrderByDescending(r => r.InspectionDate)
            .ToListAsync();
    }

    public async Task<InspectionRecord> CreateInspectionRecordAsync(CreateInspectionRecordDto dto)
    {
        string documentUrl = null;

        if (dto.Document != null && dto.Document.Length > 0)
        {
            var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "inspections");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(dto.Document.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Document.CopyToAsync(fileStream);
            }

            documentUrl = $"/uploads/inspections/{uniqueFileName}";
        }

        var record = new InspectionRecord
        {
            VehicleId = dto.VehicleId,
            InspectionDate = dto.InspectionDate,
            ExpiryDate = dto.ExpiryDate,
            Result = dto.Result,
            InspectorName = dto.InspectorName,
            Notes = dto.Notes,
            DocumentUrl = documentUrl
        };

        _context.InspectionRecords.Add(record);

        // Update vehicle status if inspection failed
        if (dto.Result == "FAIL")
        {
            var vehicle = await _context.Vehicles.FindAsync(dto.VehicleId);
            if (vehicle != null)
            {
                vehicle.Status = "NEEDS_REPAIR";
                vehicle.InspectionExpiry = null; // Clear expiry date on fail
            }
        }
        else if (dto.ExpiryDate.HasValue)
        {
            // Update vehicle inspection expiry if passed
            var vehicle = await _context.Vehicles.FindAsync(dto.VehicleId);
            if (vehicle != null)
            {
                vehicle.InspectionExpiry = DateOnly.FromDateTime(dto.ExpiryDate.Value);
            }
        }

        await _context.SaveChangesAsync();
        return record;
    }

    public async Task<object> GetMaintenanceAnalyticsAsync()
    {
        var totalSchedules = await _context.MaintenanceSchedules.CountAsync();
        var pendingSchedules = await _context.MaintenanceSchedules.CountAsync(s => s.Status == "PENDING");
        var overdueSchedules = await _context.MaintenanceSchedules.CountAsync(s => s.Status == "OVERDUE");
        var completedSchedules = await _context.MaintenanceSchedules.CountAsync(s => s.Status == "COMPLETED");

        return new
        {
            TotalSchedules = totalSchedules,
            Pending = pendingSchedules,
            Overdue = overdueSchedules,
            Completed = completedSchedules
        };
    }

    public async Task<object> GetMaintenancePredictionsAsync()
    {
        // Simple AI/Predictive dummy logic for upcoming failures based on historical data
        // For a full implementation, you'd integrate with an ML model or use complex statistical analysis.
        var upcomingSchedules = await _context.MaintenanceSchedules
            .Where(s => s.Status == "PENDING" && s.DueDate <= DateTime.Now.AddDays(30))
            .Select(s => new {
                s.VehicleId,
                s.Type,
                s.DueDate,
                RiskLevel = s.DueDate < DateTime.Now ? "High" : "Medium"
            })
            .ToListAsync();

        return new
        {
            PredictedMaintenanceNeeds = upcomingSchedules,
            Recommendation = "Schedule maintenance for high-risk vehicles immediately."
        };
    }
}
