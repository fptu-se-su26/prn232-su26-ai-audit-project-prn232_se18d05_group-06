using BACKEND.DTOs;
using PayOS.Models.Webhooks;

namespace BACKEND.Services
{
    public interface IPayOsPaymentService
    {
        Task<PayOsPaymentLinkResponseDto> CreatePaymentLinkAsync(CreatePayOsPaymentRequestDto request, int currentUserId);
        Task<PayOsPaymentStatusDto> GetPaymentStatusAsync(int orderId, int currentUserId);
        Task<List<PaymentVoucherDto>> GetAvailableVouchersAsync(int orderId, int currentUserId);
        Task HandleWebhookAsync(Webhook webhook);
        Task<PayOsPaymentStatusDto> SyncReturnAsync(PayOsReturnSyncRequestDto request, int currentUserId);
    }
}
