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
    public class DriversController : ControllerBase
    {
        private readonly IDriverService _driverService;

        public DriversController(IDriverService driverService)
        {
            _driverService = driverService;
        }

        // GET: api/drivers
        [HttpGet]
        public async Task<ActionResult<List<DriverDto>>> GetDrivers()
        {
            try
            {
                var list = await _driverService.GetDriversAsync();
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/drivers/{id}/blacklist
        [HttpPost("{id}/blacklist")]
        public async Task<ActionResult<DriverDto>> UpdateBlacklist(int id, [FromBody] UpdateBlacklistRequestDto request)
        {
            if (request == null)
            {
                return BadRequest("Request body is required.");
            }

            try
            {
                var updated = await _driverService.UpdateBlacklistStatusAsync(id, request);
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
