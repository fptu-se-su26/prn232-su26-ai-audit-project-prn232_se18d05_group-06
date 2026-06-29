using System.Collections.Generic;
using System.Threading.Tasks;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public interface IDriverService
    {
        Task<List<DriverDto>> GetDriversAsync();
        Task<DriverDto> UpdateBlacklistStatusAsync(int id, UpdateBlacklistRequestDto dto);
    }
}
