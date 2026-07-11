using System.Collections.Generic;
using System.Threading.Tasks;
using BACKEND.DTOs;
using BACKEND.Models;
using BACKEND.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers;

[Route("api/[controller]")]
[ApiController]
public class MaintenanceController : ControllerBase
{
    private readonly IMaintenanceService _maintenanceService;

    public MaintenanceController(IMaintenanceService maintenanceService)
    {
        _maintenanceService = maintenanceService;
    }

    [HttpGet("vehicle/{vehicleId}/schedules")]
    public async Task<ActionResult<IEnumerable<MaintenanceSchedule>>> GetMaintenanceSchedules(int vehicleId)
    {
        var schedules = await _maintenanceService.GetMaintenanceSchedulesAsync(vehicleId);
        return Ok(schedules);
    }

    [HttpGet("vehicle/{vehicleId}/inspections")]
    public async Task<ActionResult<IEnumerable<InspectionRecord>>> GetInspectionRecords(int vehicleId)
    {
        var records = await _maintenanceService.GetInspectionRecordsAsync(vehicleId);
        return Ok(records);
    }

    [HttpPost("schedules")]
    public async Task<ActionResult<MaintenanceSchedule>> CreateMaintenanceSchedule([FromBody] CreateMaintenanceScheduleDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var schedule = await _maintenanceService.CreateMaintenanceScheduleAsync(dto);
        return CreatedAtAction(nameof(GetMaintenanceSchedules), new { vehicleId = schedule.VehicleId }, schedule);
    }

    [HttpPut("schedules/{id}")]
    public async Task<ActionResult<MaintenanceSchedule>> UpdateMaintenanceSchedule(int id, [FromBody] UpdateMaintenanceScheduleDto dto)
    {
        var schedule = await _maintenanceService.UpdateMaintenanceScheduleAsync(id, dto);
        if (schedule == null)
            return NotFound("Maintenance schedule not found");

        return Ok(schedule);
    }

    [HttpDelete("schedules/{id}")]
    public async Task<IActionResult> DeleteMaintenanceSchedule(int id)
    {
        var deleted = await _maintenanceService.DeleteMaintenanceScheduleAsync(id);
        if (!deleted)
            return NotFound("Maintenance schedule not found");

        return NoContent();
    }

    [HttpPost("inspections")]
    // Need to use FromForm to support file uploads
    public async Task<ActionResult<InspectionRecord>> CreateInspectionRecord([FromForm] CreateInspectionRecordDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var record = await _maintenanceService.CreateInspectionRecordAsync(dto);
        return Ok(record);
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        var analytics = await _maintenanceService.GetMaintenanceAnalyticsAsync();
        return Ok(analytics);
    }

    [HttpGet("predictions")]
    public async Task<IActionResult> GetPredictions()
    {
        var predictions = await _maintenanceService.GetMaintenancePredictionsAsync();
        return Ok(predictions);
    }
}
