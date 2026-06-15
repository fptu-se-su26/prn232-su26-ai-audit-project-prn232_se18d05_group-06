using System.Threading.Tasks;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public interface IOutboundService
    {
        Task<OutboundResponseDto> CreateOutboundOrderAsync(OutboundRequestDto request);
    }
}
