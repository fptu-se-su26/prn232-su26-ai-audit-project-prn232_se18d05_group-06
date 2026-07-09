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
        private readonly ILprService _lprService;

        public GateController(IGateService gateService, ILprService lprService)
        {
            _gateService = gateService;
            _lprService = lprService;
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

        // POST: api/gate/checkin
        [HttpPost("checkin")]
        public async Task<ActionResult> CheckIn([FromBody] GateCheckInRequestDto request)
        {
            if (request == null || (string.IsNullOrWhiteSpace(request.AlprPlate) && string.IsNullOrWhiteSpace(request.BookingCode)))
            {
                return BadRequest("License Plate or Booking Code is required for check-in.");
            }

            try
            {
                int? operatorId = null;
                var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                               ?? User.FindFirst("sub")?.Value 
                               ?? User.FindFirst(ClaimTypes.Name)?.Value;

                if (int.TryParse(subClaim, out int parsedId))
                {
                    operatorId = parsedId;
                }

                var result = await _gateService.ProcessCheckInAsync(request, operatorId);
                if (result is GateAccessDeniedResponseDto accessDenied)
                {
                    return StatusCode(403, accessDenied);
                }

                return Ok(result);
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

        // POST: api/gate/check-plate
        [HttpPost("check-plate")]
        public async Task<ActionResult<GateCheckResultDto>> CheckPlate([FromBody] GateCheckPlateRequestDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.DetectedPlate))
            {
                return BadRequest("DetectedPlate is required.");
            }

            try
            {
                int? operatorId = null;
                var operatorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (operatorIdClaim != null && int.TryParse(operatorIdClaim.Value, out int oid))
                {
                    operatorId = oid;
                }

                var result = await _gateService.CheckVehiclePlateAsync(request, operatorId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/gate/scan
        [HttpPost("scan")]
        public async Task<ActionResult> ScanLicensePlate([FromForm] Microsoft.AspNetCore.Http.IFormFile imageFile, [FromForm] string eventType = "")
        {
            if (imageFile == null || imageFile.Length == 0)
            {
                return BadRequest("No image provided.");
            }

            try
            {
                // Run LprService
                var lprResult = await _lprService.RecognizeLicensePlateAsync(imageFile);
                var licensePlate = lprResult.Text;
                
                if (string.IsNullOrWhiteSpace(licensePlate))
                {
                    return Ok(new { 
                        LicensePlate = string.Empty, 
                        Message = "Could not detect license plate.",
                        DebugInfo = new { confidence = lprResult.Confidence, bbox = lprResult.BoundingBox }
                    });
                }

                // Clean the plate text for processing (remove spaces/dashes)
                licensePlate = licensePlate.Replace(" ", "").Replace("-", "").ToUpper();

                int? operatorId = null;
                var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                               ?? User.FindFirst("sub")?.Value 
                               ?? User.FindFirst(ClaimTypes.Name)?.Value;

                if (int.TryParse(subClaim, out int parsedId))
                {
                    operatorId = parsedId;
                }

                if (eventType.Equals("IN", StringComparison.OrdinalIgnoreCase))
                {
                    var result = await _gateService.ProcessCheckInAsync(new GateCheckInRequestDto { AlprPlate = licensePlate }, operatorId);
                    return Ok(new { LicensePlate = licensePlate, Result = result, DebugInfo = new { confidence = lprResult.Confidence, bbox = lprResult.BoundingBox } });
                }
                else if (eventType.Equals("OUT", StringComparison.OrdinalIgnoreCase))
                {
                    var result = await _gateService.ProcessCheckoutAsync(new CheckoutRequestDto { AlprPlate = licensePlate }, operatorId);
                    return Ok(new { LicensePlate = licensePlate, Result = result, DebugInfo = new { confidence = lprResult.Confidence, bbox = lprResult.BoundingBox } });
                }

                return Ok(new { LicensePlate = licensePlate, DebugInfo = new { confidence = lprResult.Confidence, bbox = lprResult.BoundingBox } });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
