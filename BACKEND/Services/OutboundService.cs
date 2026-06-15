using BACKEND.Models;
using BACKEND.DTOs;
namespace BACKEND.Services;
public class OutboundService : IOutboundService {
    public OutboundService(SmartLogAiContext context, IConfiguration config) { }
    public Task<OutboundResponseDto> CreateOutboundOrderAsync(OutboundRequestDto request) => Task.FromResult<OutboundResponseDto>(null!);
}
