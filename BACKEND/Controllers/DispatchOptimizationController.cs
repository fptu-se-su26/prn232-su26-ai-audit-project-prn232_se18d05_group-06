using BACKEND.DTOs;
using BACKEND.Services;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers;

[ApiController]
[Route("api/dispatch/optimization")]
public class DispatchOptimizationController : ControllerBase
{
    private readonly IDispatchOptimizationService _service;

    public DispatchOptimizationController(IDispatchOptimizationService service)
    {
        _service = service;
    }

    [HttpGet("queue")]
    public async Task<ActionResult<DispatchOptimizationQueueDto>> GetQueue([FromQuery] int? warehouseId)
    {
        return Ok(await _service.GetQueueAsync(warehouseId));
    }

    [HttpPost("assign-dock")]
    public async Task<ActionResult<DispatchActionResponseDto>> AssignDock([FromBody] AssignDockRequestDto request)
    {
        var result = await _service.AssignDockAsync(request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("hold")]
    public async Task<ActionResult<DispatchActionResponseDto>> Hold([FromBody] HoldVehicleRequestDto request)
    {
        var result = await _service.HoldVehicleAsync(request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("override-priority")]
    public async Task<ActionResult<DispatchActionResponseDto>> OverridePriority([FromBody] OverridePriorityRequestDto request)
    {
        var result = await _service.OverridePriorityAsync(request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("seed-demo")]
    public async Task<ActionResult<DispatchActionResponseDto>> SeedDemoData()
    {
        var result = await _service.SeedDemoDataAsync();
        return result.Success ? Ok(result) : BadRequest(result);
    }
}