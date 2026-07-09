using System;
using System.Threading.Tasks;
using BACKEND.Services;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IVehicleDashboardService _vehicleDashboardService;

    public DashboardController(IVehicleDashboardService vehicleDashboardService)
    {
        _vehicleDashboardService = vehicleDashboardService;
    }

    [HttpGet("vehicle-status-summary")]
    public async Task<IActionResult> GetVehicleStatusSummary(
        [FromQuery] string? filterMode,
        [FromQuery] DateTime? date,
        [FromQuery] string? month)
    {
        var summary = await _vehicleDashboardService.GetVehicleStatusSummaryAsync(
            filterMode ?? "day",
            date ?? DateTime.Today,
            month);
        return Ok(summary);
    }

    [HttpGet("vehicle-status-list")]
    public async Task<IActionResult> GetVehicleStatusList(
        [FromQuery] string? filterMode,
        [FromQuery] DateTime? date,
        [FromQuery] string? month,
        [FromQuery] string? status)
    {
        var list = await _vehicleDashboardService.GetVehicleStatusListAsync(
            filterMode ?? "day",
            date ?? DateTime.Today,
            month,
            status);
        return Ok(list);
    }

    [HttpPut("vehicle-status/{bookingId}")]
    public async Task<IActionResult> UpdateVehicleStatus(int bookingId, [FromBody] UpdateStatusRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.Status))
        {
            return BadRequest("Dữ liệu trạng thái không được để trống.");
        }

        var success = await _vehicleDashboardService.UpdateVehicleStatusAsync(bookingId, request.Status, request.DockCode);
        if (!success)
        {
            return BadRequest("Cập nhật trạng thái không thành công hoặc trạng thái không hợp lệ.");
        }

        return Ok(new { message = "Cập nhật trạng thái phương tiện thành công." });
    }

    [HttpGet("docks")]
    public async Task<IActionResult> GetDocksByWarehouse([FromQuery] int warehouseId)
    {
        if (warehouseId <= 0)
        {
            return BadRequest("WarehouseId không hợp lệ.");
        }

        var docks = await _vehicleDashboardService.GetDocksByWarehouseAsync(warehouseId);
        return Ok(docks);
    }
}

public class UpdateStatusRequest
{
    public string Status { get; set; } = null!;
    public string? DockCode { get; set; }
}
