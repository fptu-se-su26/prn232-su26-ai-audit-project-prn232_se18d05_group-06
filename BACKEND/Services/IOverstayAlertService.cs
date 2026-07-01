using BACKEND.DTOs;

namespace BACKEND.Services;

public interface IOverstayAlertService
{
    Task<OverstayAlertDashboardDto> GetDashboardAsync();
    Task<OverstayAlertDto?> GetByIdAsync(int id);
    Task<OverstayAlertDashboardDto> CheckAsync();
    Task<OverstayAlertDto> ResolveAsync(int id, ResolveOverstayAlertRequestDto request);
    Task<OverstayAlertDashboardDto> UpdateDockSessionStatusAsync(int sessionId, UpdateDockSessionStatusRequestDto request);
}
