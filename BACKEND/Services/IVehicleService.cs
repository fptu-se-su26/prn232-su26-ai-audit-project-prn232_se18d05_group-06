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
    }
}
