using System.Threading.Tasks;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public interface IBlacklistValidationService
    {
        Task<GateAccessDeniedResponseDto?> CheckBlacklistAsync(int? vehicleId, int? driverId);
    }
}
