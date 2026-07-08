using System.Collections.Generic;
using System.Threading.Tasks;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public interface ITrackingService
    {
        Task<VehicleEventDto> LogEventAsync(CreateVehicleEventDto dto);
        Task<List<VehicleEventDto>> GetHistoryAsync(int vehicleId);
        Task<TripCountDto> GetTripCountAsync(int vehicleId);
        Task<List<VehicleDto>> GetVehiclesAsync();
    }
}
