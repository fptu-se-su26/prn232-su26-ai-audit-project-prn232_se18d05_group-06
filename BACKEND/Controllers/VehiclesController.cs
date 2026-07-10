using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BACKEND.Services;
using BACKEND.DTOs;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VehiclesController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;

        public VehiclesController(IVehicleService vehicleService)
        {
            _vehicleService = vehicleService;
        }

        // POST: api/vehicles/detect
        [HttpPost("detect")]
        public async Task<ActionResult<VehicleDto>> DetectVehicle([FromBody] DetectVehicleRequestDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.LicensePlate))
            {
                return BadRequest("License plate is required.");
            }

            try
            {
                var vehicle = await _vehicleService.DetectStrangeVehicleAsync(request.LicensePlate);
                return Ok(vehicle);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/vehicles/pending
        [HttpGet("pending")]
        public async Task<ActionResult<List<VehicleDto>>> GetPendingVehicles()
        {
            try
            {
                var pendingList = await _vehicleService.GetPendingVehiclesAsync();
                return Ok(pendingList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/vehicles/approve/{id}
        // Note: Using POST instead of PUT as strictly specified to align with Frontend Axios configuration
        [HttpPost("approve/{id}")]
        public async Task<ActionResult<VehicleDto>> ApproveVehicle(int id, [FromBody] ApproveVehicleRequestDto request)
        {
            if (request == null)
            {
                return BadRequest("Approval details are required.");
            }

            if (string.IsNullOrWhiteSpace(request.VehicleModel))
            {
                return BadRequest("Vehicle model is required.");
            }

            try
            {
                var approved = await _vehicleService.ApproveVehicleAsync(id, request);
                return Ok(approved);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/vehicles
        [HttpGet]
        public async Task<ActionResult<List<DispatcherVehicleDto>>> GetAllVehicles()
        {
            try
            {
                var vehicles = await _vehicleService.GetDispatcherVehiclesAsync(null, null, null, null, null, null);
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/vehicles/dashboard
        [HttpGet("dashboard")]
        public async Task<ActionResult<DashboardDataDto>> GetDashboardData()
        {
            try
            {
                var data = await _vehicleService.GetDashboardDataAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/vehicles/reject/{id}
        [HttpDelete("reject/{id}")]
        public async Task<IActionResult> RejectVehicle(int id)
        {
            try
            {
                await _vehicleService.RejectVehicleAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/vehicles/{id}/blacklist
        [HttpPost("{id}/blacklist")]
        public async Task<ActionResult<VehicleDto>> UpdateBlacklist(int id, [FromBody] UpdateBlacklistRequestDto request)
        {
            if (request == null)
            {
                return BadRequest("Request body is required.");
            }

            try
            {
                var updated = await _vehicleService.UpdateBlacklistStatusAsync(id, request);
                return Ok(updated);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
