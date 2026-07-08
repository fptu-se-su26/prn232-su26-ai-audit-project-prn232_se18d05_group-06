using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BACKEND.DTOs.VehicleDashboard;

namespace BACKEND.Services;

public interface IVehicleDashboardService
{
    Task<VehicleStatusSummaryDto> GetVehicleStatusSummaryAsync(string filterMode, DateTime date, string? month);
    Task<List<VehicleStatusItemDto>> GetVehicleStatusListAsync(string filterMode, DateTime date, string? month, string? status);
    Task<bool> UpdateVehicleStatusAsync(int bookingId, string status, string? dockCode);
    Task<List<DockDto>> GetDocksByWarehouseAsync(int warehouseId);
}

public class DockDto
{
    public int DockId { get; set; }
    public string DockCode { get; set; } = null!;
    public string? DockName { get; set; }
}
