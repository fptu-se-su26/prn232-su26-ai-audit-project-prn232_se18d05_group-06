using BACKEND.DTOs;
using BACKEND.Services;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryReportsController : ControllerBase
{
    private readonly IInventoryReportService _reportService;
    private readonly ILogger<InventoryReportsController> _logger;

    public InventoryReportsController(
        IInventoryReportService reportService,
        ILogger<InventoryReportsController> logger)
    {
        _reportService = reportService;
        _logger = logger;
    }

    /// <summary>
    /// Lấy danh sách hàng tồn lâu (Dead Stock)
    /// </summary>
    [HttpGet("deadstock")]
    public async Task<ActionResult<DeadStockPagedResultDto>> GetDeadStock([FromQuery] FilterDeadStockDto filter)
    {
        try
        {
            filter.AlertType = "DEAD_STOCK";
            var result = await _reportService.GetDeadStockAsync(filter);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dead stock list");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    /// <summary>
    /// Lấy danh sách hàng sắp hết hạn (Expiry Soon)
    /// </summary>
    [HttpGet("expirystock")]
    public async Task<ActionResult<DeadStockPagedResultDto>> GetExpiryStock([FromQuery] FilterDeadStockDto filter)
    {
        try
        {
            filter.AlertType = "EXPIRY_SOON";
            var result = await _reportService.GetExpiryStockAsync(filter);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting expiry stock list");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    /// <summary>
    /// Lấy danh sách hàng tồn lâu và sắp hết hạn (tất cả)
    /// </summary>
    [HttpGet("all")]
    public async Task<ActionResult<DeadStockPagedResultDto>> GetAllDeadAndExpiry([FromQuery] FilterDeadStockDto filter)
    {
        try
        {
            filter.AlertType = "ALL";
            var deadStock = await _reportService.GetDeadStockAsync(filter);
            var expiryStock = await _reportService.GetExpiryStockAsync(filter);

            var combined = new DeadStockPagedResultDto
            {
                Items = deadStock.Items.Concat(expiryStock.Items).ToList(),
                TotalCount = deadStock.TotalCount + expiryStock.TotalCount,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize
            };

            return Ok(combined);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all dead and expiry stock");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    /// <summary>
    /// Lấy tổng quan thống kê Dead Stock và Expiry Stock
    /// </summary>
    [HttpGet("summary")]
    public async Task<ActionResult<DeadStockSummaryDto>> GetSummary()
    {
        try
        {
            var summary = await _reportService.GetSummaryAsync();
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dead stock summary");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    /// <summary>
    /// Quét và tạo cảnh báo Dead Stock / Expiry Soon
    /// </summary>
    [HttpPost("scan")]
    public async Task<IActionResult> Scan([FromQuery] bool force = false)
    {
        try
        {
            var alertsCreated = await _reportService.ScanAndCreateAlertsAsync(force);
            return Ok(new
            {
                AlertsCreated = alertsCreated,
                Message = alertsCreated > 0
                    ? $"Quét hoàn tất. Đã tạo {alertsCreated} cảnh báo mới."
                    : "Quét hoàn tất. Không có cảnh báo mới nào cần tạo."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scanning dead stock");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}
