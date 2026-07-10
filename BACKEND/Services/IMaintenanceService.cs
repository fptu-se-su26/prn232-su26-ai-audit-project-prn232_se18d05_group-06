using System.Collections.Generic;
using System.Threading.Tasks;
using BACKEND.DTOs;
using BACKEND.Models;

namespace BACKEND.Services;

public interface IMaintenanceService
{
    // Maintenance Schedules
    Task<IEnumerable<MaintenanceSchedule>> GetMaintenanceSchedulesAsync(int vehicleId);
    Task<MaintenanceSchedule> CreateMaintenanceScheduleAsync(CreateMaintenanceScheduleDto dto);
    Task<MaintenanceSchedule> UpdateMaintenanceScheduleAsync(int id, UpdateMaintenanceScheduleDto dto);
    Task<bool> DeleteMaintenanceScheduleAsync(int id);

    // Inspection Records
    Task<IEnumerable<InspectionRecord>> GetInspectionRecordsAsync(int vehicleId);
    Task<InspectionRecord> CreateInspectionRecordAsync(CreateInspectionRecordDto dto);

    // Analytics & Predictions
    Task<object> GetMaintenanceAnalyticsAsync();
    Task<object> GetMaintenancePredictionsAsync();
}
