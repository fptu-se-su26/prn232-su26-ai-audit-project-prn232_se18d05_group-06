using BACKEND.DTOs;

namespace BACKEND.Services
{
    public interface ICustomerChatbotService
    {
        Task<ChatbotAskResponseDto> AskAsync(string question, int currentUserId, CancellationToken cancellationToken = default);
        Task<List<CustomerFaqDto>> GetFaqsAsync(string? keyword, string? category, CancellationToken cancellationToken = default);
    }
}