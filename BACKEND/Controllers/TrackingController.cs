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
    public class TrackingController : ControllerBase
    {
        private readonly ITrackingService _trackingService;

        public TrackingController(ITrackingService trackingService)
        {
            _trackingService = trackingService;
        }

        // GET: api/tracking/vehicles
        [HttpGet("vehicles")]
        public async Task<ActionResult<List<VehicleDto>>> GetVehicles()
        {
            try
            {
                var vehicles = await _trackingService.GetVehiclesAsync();
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/tracking/events
        [HttpPost("events")]
        public async Task<ActionResult<VehicleEventDto>> LogEvent([FromBody] CreateVehicleEventDto request)
        {
            if (request == null)
            {
                return BadRequest("Event details are required.");
            }

            try
            {
                var loggedEvent = await _trackingService.LogEventAsync(request);
                return Ok(loggedEvent);
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

        // GET: api/tracking/history/{vehicleId}
        [HttpGet("history/{vehicleId}")]
        public async Task<ActionResult<List<VehicleEventDto>>> GetHistory(int vehicleId)
        {
            try
            {
                var history = await _trackingService.GetHistoryAsync(vehicleId);
                return Ok(history);
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

        // GET: api/tracking/trips/{vehicleId}/count
        [HttpGet("trips/{vehicleId}/count")]
        public async Task<ActionResult<TripCountDto>> GetTripCount(int vehicleId)
        {
            try
            {
                var tripCount = await _trackingService.GetTripCountAsync(vehicleId);
                return Ok(tripCount);
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

    }
}
