using BACKEND.DTOs;
using BACKEND.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class KpiController : ControllerBase
{
    private readonly IKpiService _kpiService;
    private readonly ILogger<KpiController> _logger;

    public KpiController(IKpiService kpiService, ILogger<KpiController> logger)
    {
        _kpiService = kpiService;
        _logger = logger;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<KpiDashboardDto>> GetDashboard()
    {
        try
        {
            var dashboard = await _kpiService.GetDashboardKpisAsync();
            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching KPI dashboard");
            return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu KPI Dashboard" });
        }
    }

    [HttpGet("overview")]
    public async Task<ActionResult<KpiOverviewDto>> GetOverview()
    {
        try
        {
            var overview = await _kpiService.GetOverviewKpisAsync();
            return Ok(overview);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching KPI overview");
            return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu KPI tổng quan" });
        }
    }

    [HttpGet("warehouse")]
    public async Task<ActionResult<KpiWarehouseDto>> GetWarehouse()
    {
        try
        {
            var warehouse = await _kpiService.GetWarehouseKpisAsync();
            return Ok(warehouse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching KPI warehouse");
            return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu KPI kho" });
        }
    }

    [HttpGet("dispatcher")]
    public async Task<ActionResult<KpiDispatcherDto>> GetDispatcher()
    {
        try
        {
            var dispatcher = await _kpiService.GetDispatcherKpisAsync();
            return Ok(dispatcher);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching KPI dispatcher");
            return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu KPI điều phối" });
        }
    }

    [HttpGet("finance")]
    public async Task<ActionResult<KpiFinanceDto>> GetFinance()
    {
        try
        {
            var finance = await _kpiService.GetFinanceKpisAsync();
            return Ok(finance);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching KPI finance");
            return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu KPI tài chính" });
        }
    }

    [HttpGet("export")]
    public async Task<IActionResult> Export(
        [FromQuery] string format = "excel",
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string reportType = "full")
    {
        try
        {
            var bytes = await _kpiService.ExportKpisAsync(format, fromDate, toDate, reportType);

            var contentType = format.ToLower() == "excel"
                ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                : "application/pdf";

            var fileName = format.ToLower() == "excel"
                ? $"KPI_Report_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx"
                : $"KPI_Report_{DateTime.Now:yyyyMMdd_HHmmss}.txt";

            return File(bytes, contentType, fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting KPI report");
            return StatusCode(500, new { message = "Lỗi khi xuất báo cáo KPI" });
        }
    }
}
