using BACKEND.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/locations")]
    public class LocationsController : ControllerBase
    {
        private readonly ILocationSuggestionService _locationSuggestionService;

        public LocationsController(ILocationSuggestionService locationSuggestionService)
        {
            _locationSuggestionService = locationSuggestionService;
        }

        [HttpGet("suggestions")]
        public async Task<IActionResult> GetSuggestions([FromQuery] string keyword, [FromQuery] string? type)
        {
            var result = await _locationSuggestionService.GetSuggestionsAsync(keyword, type);
            return Ok(new
            {
                success = true,
                data = result
            });
        }

        [HttpGet("place-detail")]
        public async Task<IActionResult> GetPlaceDetail([FromQuery] string placeId)
        {
            var result = await _locationSuggestionService.GetPlaceDetailAsync(placeId);

            if (result == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy địa chỉ."
                });
            }

            return Ok(new
            {
                success = true,
                data = result
            });
        }
    }
}
