using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BACKEND.Services;
using BACKEND.DTOs;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GateController : ControllerBase
    {
        private readonly IGateService _gateService;

        public GateController(IGateService gateService)
        {
            _gateService = gateService;
        }

        // GET: api/gate/active-booking?search={search}
        [HttpGet("active-booking")]
        public async Task<ActionResult<ActiveBookingSummaryDto>> GetActiveBooking([FromQuery] string search)
        {
            if (string.IsNullOrWhiteSpace(search))
            {
                return BadRequest("Search criteria (License Plate or Booking Code) is required.");
            }

            try
            {
                var booking = await _gateService.GetActiveBookingAsync(search);
                if (booking == null)
                {
                    return NotFound($"No active (Checked-In or In-Dock) booking found for: {search}");
                }

                return Ok(booking);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/gate/checkout
        [HttpPost("checkout")]
        public async Task<ActionResult<CheckoutResponseDto>> Checkout([FromBody] CheckoutRequestDto request)
        {
            if (request == null || (string.IsNullOrWhiteSpace(request.AlprPlate) && string.IsNullOrWhiteSpace(request.BookingCode)))
            {
                return BadRequest("License Plate or Booking Code is required for checkout.");
            }

            try
            {
                // Attempt to retrieve Operator ID from JWT Claims
                int? operatorId = null;
                var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                               ?? User.FindFirst("sub")?.Value 
                               ?? User.FindFirst(ClaimTypes.Name)?.Value;

                if (int.TryParse(subClaim, out int parsedId))
                {
                    operatorId = parsedId;
                }

                var response = await _gateService.ProcessCheckoutAsync(request, operatorId);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
