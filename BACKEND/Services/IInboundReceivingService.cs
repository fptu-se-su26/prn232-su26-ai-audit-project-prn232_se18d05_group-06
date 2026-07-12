using BACKEND.DTOs;
using Microsoft.AspNetCore.Http;

namespace BACKEND.Services
{
    public interface IInboundReceivingService
    {
        Task<ApiResponse> CreateInboundFromCodeAsync(ScanInboundCodeRequest request, int currentUserId);
        Task<ApiResponse> CreateInboundFromOcrAsync(IFormFile file, int warehouseId, int customerId, int currentUserId);
        Task<ApiResponse> GetOcrReviewAsync(int inboundId);
        Task<ApiResponse> ConfirmOcrReviewAsync(int inboundId, ConfirmOcrReviewRequest request, int currentUserId);
        Task<ApiResponse> ConfirmReceivingAsync(int inboundId, ConfirmReceivingRequest request, int currentUserId);
    }
}
