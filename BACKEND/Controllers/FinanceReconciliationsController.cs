using BACKEND.DTOs;
using BACKEND.Services;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers;

[ApiController]
[Route("api/finance/reconciliations")]
public class FinanceReconciliationsController : ControllerBase
{
    private readonly IFinanceReconciliationService _reconciliationService;

    public FinanceReconciliationsController(IFinanceReconciliationService reconciliationService)
    {
        _reconciliationService = reconciliationService;
    }

    [HttpGet]
    public async Task<ActionResult<PaymentReconciliationListDto>> GetReconciliations(
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        return Ok(await _reconciliationService.GetReconciliationsAsync(status, cancellationToken));
    }

    [HttpPost("auto-match")]
    public async Task<ActionResult<AutoMatchReconciliationResponseDto>> AutoMatch(CancellationToken cancellationToken)
    {
        return Ok(await _reconciliationService.AutoMatchAsync(cancellationToken));
    }

    [HttpPost("manual-match")]
    public async Task<ActionResult<ManualMatchReconciliationResponseDto>> ManualMatch(
        [FromBody] ManualMatchReconciliationRequestDto request,
        CancellationToken cancellationToken)
    {
        return Ok(await _reconciliationService.ManualMatchAsync(request, cancellationToken));
    }
}