using System.Collections.Generic;
using System.Threading.Tasks;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public interface IOutboundService
    {
        Task<OutboundResponseDto> CreateOutboundOrderAsync(int orderId, int authenticatedUserId);
        Task<List<OutboundOrderDto>> GetOutboundOrdersAsync();
        Task<OutboundOrderDto?> GetOutboundOrderByIdAsync(int id);
        Task<OutboundLineDto> MarkLineAsPickedAsync(int outboundId, int lineId, int pickedQty, int authenticatedUserId);
        Task<OutboundOrderDto> ConfirmPickingAsync(int outboundId, int authenticatedUserId);
        Task<ShippingLabelDto> GetOrCreateShippingLabelAsync(int outboundId, int authenticatedUserId);
        Task<ShippingLabelDto?> GetShippingLabelAsync(int outboundId);
    }
}
