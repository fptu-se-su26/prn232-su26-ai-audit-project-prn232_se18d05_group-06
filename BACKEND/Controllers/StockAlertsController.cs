using BACKEND.DTOs;
using BACKEND.Services;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StockAlertsController : ControllerBase
    {
        private readonly IStockAlertService _service;

        public StockAlertsController(IStockAlertService service)
        {
            _service = service;
        }

        // GET: api/stockalerts
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

        // GET: api/stockalerts/summary
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

        // POST: api/stockalerts/scan — chạy quét tồn kho thủ công (ngoài lịch 30 phút).
        [HttpPost("scan")]
        public async Task<IActionResult> Scan()
        {
            try
            {
                var sent = await _service.ScanAndNotifyAsync();
                return Ok(new { EmailsSent = sent, Message = $"Quét hoàn tất. {sent} email cảnh báo đã gửi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/stockalerts/{id}/resolve
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
