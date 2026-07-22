using BACKEND.DTOs;
using BACKEND.Services;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers
{
    /// <summary>
    /// UC007 — Dashboard hàng tồn lâu / sắp hết hạn.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class DeadExpiryStockController : ControllerBase
    {
        private readonly IDeadExpiryStockService _service;

        public DeadExpiryStockController(IDeadExpiryStockService service)
        {
            _service = service;
        }

        // ──────────────────────────────────────────────────────────────────────
        // GET /api/deadexpirystock
        // Query params: sku, alertType, zone, inboundFrom, inboundTo, expiryFrom, expiryTo
        // ──────────────────────────────────────────────────────────────────────
        [HttpGet]
        public async Task<ActionResult<List<DeadExpiryStockItemDto>>> GetItems(
            [FromQuery] string? sku,
            [FromQuery] string? alertType,
            [FromQuery] string? zone,
            [FromQuery] DateOnly? inboundFrom,
            [FromQuery] DateOnly? inboundTo,
            [FromQuery] DateOnly? expiryFrom,
            [FromQuery] DateOnly? expiryTo)
        {
            try
            {
                var items = await _service.GetItemsAsync(sku, alertType, zone, inboundFrom, inboundTo, expiryFrom, expiryTo);
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // ──────────────────────────────────────────────────────────────────────
        // GET /api/deadexpirystock/summary
        // ──────────────────────────────────────────────────────────────────────
        [HttpGet("summary")]
        public async Task<ActionResult<DeadExpiryStockSummaryDto>> GetSummary()
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

        // ──────────────────────────────────────────────────────────────────────
        // GET /api/deadexpirystock/zones
        // Trả về danh sách ZoneCode duy nhất để populate dropdown
        // ──────────────────────────────────────────────────────────────────────
        [HttpGet("zones")]
        public async Task<ActionResult<List<string>>> GetZones()
        {
            try
            {
                return Ok(await _service.GetDistinctZonesAsync());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // ──────────────────────────────────────────────────────────────────────
        // GET /api/deadexpirystock/export?format=excel|pdf&sku=...&alertType=...
        // ──────────────────────────────────────────────────────────────────────
        [HttpGet("export")]
        public async Task<IActionResult> Export(
            [FromQuery] string format = "excel",
            [FromQuery] string? sku = null,
            [FromQuery] string? alertType = null,
            [FromQuery] string? zone = null,
            [FromQuery] DateOnly? inboundFrom = null,
            [FromQuery] DateOnly? inboundTo = null,
            [FromQuery] DateOnly? expiryFrom = null,
            [FromQuery] DateOnly? expiryTo = null)
        {
            try
            {
                var (content, fileName, contentType) = await _service.ExportAsync(
                    format, sku, alertType, zone, inboundFrom, inboundTo, expiryFrom, expiryTo);

                return File(content, contentType, fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Export failed: {ex.Message}");
            }
        }
    }
}
