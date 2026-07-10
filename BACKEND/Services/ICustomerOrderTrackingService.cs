using BACKEND.DTOs;

namespace BACKEND.Services
{
    public interface ICustomerOrderTrackingService
    {
        Task<List<CustomerOrderSummaryDto>> GetCustomerOrdersAsync(int currentUserId);
        Task<CustomerOrderTrackingResponse> GetOrderTrackingAsync(int orderId, int currentUserId);
    }
}
