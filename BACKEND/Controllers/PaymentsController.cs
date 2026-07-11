using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BACKEND.DTOs;
using BACKEND.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayOS.Models.Webhooks;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPayOsPaymentService _payOsPaymentService;

        public PaymentsController(IPayOsPaymentService payOsPaymentService)
        {
            _payOsPaymentService = payOsPaymentService;
        }

        [Authorize]
        [HttpPost("payos/create-link")]
        public async Task<ActionResult<PayOsPaymentLinkResponseDto>> CreatePayOsPaymentLink([FromBody] CreatePayOsPaymentRequestDto request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { Message = "Missing or invalid user id claim." });
            }

            try
            {
                var result = await _payOsPaymentService.CreatePaymentLinkAsync(request, userId.Value);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("vouchers/{orderId:int}")]
        public async Task<ActionResult<List<PaymentVoucherDto>>> GetPaymentVouchers(int orderId)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { Message = "Missing or invalid user id claim." });
            }

            try
            {
                var result = await _payOsPaymentService.GetAvailableVouchersAsync(orderId, userId.Value);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("payos/status/{orderId:int}")]
        public async Task<ActionResult<PayOsPaymentStatusDto>> GetPayOsPaymentStatus(int orderId)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { Message = "Missing or invalid user id claim." });
            }

            try
            {
                var result = await _payOsPaymentService.GetPaymentStatusAsync(orderId, userId.Value);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("payos/sync-return")]
        public async Task<ActionResult<PayOsPaymentStatusDto>> SyncPayOsReturn([FromBody] PayOsReturnSyncRequestDto request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { Message = "Missing or invalid user id claim." });
            }

            try
            {
                var result = await _payOsPaymentService.SyncReturnAsync(request, userId.Value);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpPost("payos/webhook")]
        public async Task<IActionResult> PayOsWebhook([FromBody] Webhook webhook)
        {
            await _payOsPaymentService.HandleWebhookAsync(webhook);
            return Ok(new { success = true });
        }

        private int? GetCurrentUserId()
        {
            var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                ?? User.FindFirst("sub")?.Value;

            return int.TryParse(raw, out var userId) ? userId : null;
        }
    }
}
