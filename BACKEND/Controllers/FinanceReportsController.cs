using BACKEND.DTOs;
using BACKEND.Services;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers;

[ApiController]
[Route("api/finance/reports")]
public class FinanceReportsController : ControllerBase
{
    private readonly IFinanceReportService _financeReportService;
    private readonly IFinanceReportExportService _exportService;

    public FinanceReportsController(
        IFinanceReportService financeReportService,
        IFinanceReportExportService exportService)
    {
        _financeReportService = financeReportService;
        _exportService = exportService;
    }

    [HttpGet("revenue-by-service")]
    public async Task<ActionResult<RevenueByServiceDto>> GetRevenueByService(
        [FromQuery] DateOnly? fromDate,
        [FromQuery] DateOnly? toDate,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        return Ok(await _financeReportService.GetRevenueByServiceAsync(fromDate, toDate, status, cancellationToken));
    }

    [HttpGet("operating-expenses")]
    public async Task<ActionResult<OperatingExpenseReportDto>> GetOperatingExpenses(
        [FromQuery] DateOnly? fromDate,
        [FromQuery] DateOnly? toDate,
        [FromQuery] string? category,
        CancellationToken cancellationToken)
    {
        return Ok(await _financeReportService.GetOperatingExpensesAsync(fromDate, toDate, category, cancellationToken));
    }
    [HttpGet("profit")]
    public async Task<ActionResult<ProfitReportDto>> GetProfitReport(
        [FromQuery] DateOnly? fromDate,
        [FromQuery] DateOnly? toDate,
        [FromQuery] string? period,
        CancellationToken cancellationToken)
    {
        return Ok(await _financeReportService.GetProfitReportAsync(fromDate, toDate, period, cancellationToken));
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportReport(
        [FromQuery] string reportType,
        [FromQuery] string format,
        [FromQuery] DateOnly? fromDate,
        [FromQuery] DateOnly? toDate,
        [FromQuery] string? status,
        [FromQuery] string? category,
        [FromQuery] string? period,
        CancellationToken cancellationToken)
    {
        var result = await _exportService.ExportAsync(reportType, format, fromDate, toDate, status, category, period, cancellationToken);
        return File(result.Content, result.ContentType, result.FileName);
    }
}