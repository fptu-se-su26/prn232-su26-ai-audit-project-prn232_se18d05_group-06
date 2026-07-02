using BACKEND.DTOs;
using BACKEND.Services;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers;

[ApiController]
[Route("api/finance/forecast")]
public class FinancialForecastController : ControllerBase
{
    private readonly IFinancialForecastService _forecastService;

    public FinancialForecastController(IFinancialForecastService forecastService)
    {
        _forecastService = forecastService;
    }

    [HttpGet]
    public async Task<ActionResult<FinancialForecastDashboardDto>> GetDashboard()
    {
        return Ok(await _forecastService.GetDashboardAsync());
    }

    [HttpPost("generate")]
    public async Task<ActionResult<FinancialForecastDashboardDto>> Generate([FromBody] GenerateFinancialForecastRequestDto request)
    {
        return Ok(await _forecastService.GenerateAsync(request));
    }

    [HttpPost("retrain")]
    public async Task<ActionResult<AiModelTrainingLogDto>> Retrain([FromBody] RetrainFinancialForecastRequestDto request)
    {
        return Ok(await _forecastService.RetrainAsync(request));
    }

    [HttpGet("history")]
    public async Task<ActionResult<List<FinancialForecastPointDto>>> GetHistory()
    {
        return Ok(await _forecastService.GetHistoryAsync());
    }
}
