using BACKEND.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BACKEND.Services
{
    public interface ILocationSuggestionService
    {
        Task<List<LocationSuggestionDto>> GetSuggestionsAsync(string keyword, string? type);
        Task<LocationSuggestionDto?> GetPlaceDetailAsync(string placeId);
    }
}
