using System.Collections.Generic;
using System.Threading.Tasks;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public interface IVehicleService
    {
        Task<VehicleDto> DetectStrangeVehicleAsync(string licensePlate);
        Task<List<VehicleDto>> GetPendingVehiclesAsync();
        Task<VehicleDto> ApproveVehicleAsync(int id, ApproveVehicleRequestDto dto);
        Task<bool> RejectVehicleAsync(int id);
        Task<VehicleDto> UpdateBlacklistStatusAsync(int id, UpdateBlacklistRequestDto dto);
        Task<List<DispatcherVehicleDto>> GetDispatcherVehiclesAsync(string? search, string? vehicleType, string? status, bool? isInternal, bool? expiringSoon, bool? blacklisted);
        Task<DispatcherVehicleDto> GetDispatcherVehicleAsync(int id);
        Task<DispatcherVehicleDto> CreateDispatcherVehicleAsync(UpsertDispatcherVehicleRequestDto dto);
        Task<DispatcherVehicleDto> UpdateDispatcherVehicleAsync(int id, UpsertDispatcherVehicleRequestDto dto);
        Task DeactivateDispatcherVehicleAsync(int id);
        Task BlacklistDispatcherVehicleAsync(int id, BlacklistVehicleRequestDto dto);
        Task<DispatcherVehicleDto> AssignDispatcherVehicleDriverAsync(int id, AssignVehicleDriverRequestDto dto);
    }
}
