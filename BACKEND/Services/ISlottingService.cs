using BACKEND.DTOs;

namespace BACKEND.Services
{
    public interface ISlottingService
    {
        Task<SlottingSuggestionResponseDto> GetSuggestionsAsync(int lineId);
        Task<ConfirmSlottingResponseDto> ConfirmSlotAsync(int lineId, ConfirmSlottingRequestDto request);
    }
}
