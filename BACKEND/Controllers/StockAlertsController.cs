using BACKEND.DTOs;
using BACKEND.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StockAlertsController : ControllerBase
    {
        private const string DefaultAlertEmail = "tungtvde180109@fpt.edu.vn";
        private readonly IStockAlertService _service;

        public StockAlertsController(IStockAlertService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<StockAlertDto>>> GetActiveAlerts()
        {
            try
            {
                return Ok(await _service.GetActiveAlertsAsync());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("summary")]
        public async Task<ActionResult<StockAlertSummaryDto>> GetSummary()
        {
            try
            {
                return Ok(await _service.GetSummaryAsync());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("scan")]
        public async Task<IActionResult> Scan([FromQuery] bool force = false)
        {
            try
            {
                var recipientEmail = GetCurrentUserEmailOrDefault();
                var sent = await _service.ScanAndNotifyAsync(forceResend: force, recipientEmail: recipientEmail);
                var message = sent > 0
                    ? $"Quét hoàn tất. Đã gửi {sent} email cảnh báo về {recipientEmail}."
                    : force
                        ? "Quét hoàn tất nhưng chưa gửi được email. Vui lòng kiểm tra cấu hình SMTP hoặc log backend."
                        : "Quét hoàn tất. Chưa gửi email mới vì các cảnh báo đang trong thời gian debounce.";

                return Ok(new
                {
                    EmailsSent = sent,
                    RecipientEmail = recipientEmail,
                    ForceResend = force,
                    Message = message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private string GetCurrentUserEmailOrDefault()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            return string.IsNullOrWhiteSpace(email) ? DefaultAlertEmail : email.Trim();
        }

        [HttpPost("{id}/resolve")]
        public async Task<IActionResult> Resolve(int id)
        {
            try
            {
                var ok = await _service.ResolveAlertAsync(id);
                if (!ok) return NotFound($"Stock alert {id} not found.");
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}