using BACKEND.DTOs;
using BACKEND.Services;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers;

[ApiController]
[Route("api/fleet/overstay-alerts")]
public class OverstayAlertsController : ControllerBase
{
    private readonly IOverstayAlertService _overstayAlertService;

    public OverstayAlertsController(IOverstayAlertService overstayAlertService)
    {
        _overstayAlertService = overstayAlertService;
    }

    [HttpGet]
    public async Task<ActionResult<OverstayAlertDashboardDto>> GetAlerts()
    {
        return Ok(await _overstayAlertService.GetDashboardAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OverstayAlertDto>> GetAlert(int id)
    {
        var alert = await _overstayAlertService.GetByIdAsync(id);
        return alert == null ? NotFound() : Ok(alert);
    }

    [HttpPost("check")]
    public async Task<ActionResult<OverstayAlertDashboardDto>> CheckAlerts()
    {
        return Ok(await _overstayAlertService.CheckAsync());
    }

    [HttpPut("{id:int}/resolve")]
    public async Task<ActionResult<OverstayAlertDto>> ResolveAlert(int id, [FromBody] ResolveOverstayAlertRequestDto request)
    {
        try
        {
            return Ok(await _overstayAlertService.ResolveAsync(id, request));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPut("/api/fleet/dock-sessions/{id:int}/status")]
    public async Task<ActionResult<OverstayAlertDashboardDto>> UpdateDockSessionStatus(int id, [FromBody] UpdateDockSessionStatusRequestDto request)
    {
        try
        {
            return Ok(await _overstayAlertService.UpdateDockSessionStatusAsync(id, request));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
