using System.Threading.Tasks;
using BACKEND.DTOs;

namespace BACKEND.Services;

public interface IDispatchOptimizationService
{
    Task<DispatchOptimizationQueueDto> GetQueueAsync(int? warehouseId);
    Task<DispatchActionResponseDto> AssignDockAsync(AssignDockRequestDto request);
    Task<DispatchActionResponseDto> HoldVehicleAsync(HoldVehicleRequestDto request);
    Task<DispatchActionResponseDto> OverridePriorityAsync(OverridePriorityRequestDto request);
    Task<DispatchActionResponseDto> SeedDemoDataAsync();
}