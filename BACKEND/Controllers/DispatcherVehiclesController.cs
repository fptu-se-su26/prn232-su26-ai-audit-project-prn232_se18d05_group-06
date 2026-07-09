using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BACKEND.DTOs;
using BACKEND.Services;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/dispatcher/vehicles")]
    public class DispatcherVehiclesController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;

        public DispatcherVehiclesController(IVehicleService vehicleService)
        {
            _vehicleService = vehicleService;
        }

        [HttpGet]
        public async Task<ActionResult<List<DispatcherVehicleDto>>> GetVehicles(
            [FromQuery] string? search,
            [FromQuery] string? vehicleType,
            [FromQuery] string? status,
            [FromQuery] bool? isInternal,
            [FromQuery] bool? expiringSoon,
            [FromQuery] bool? blacklisted)
        {
            var vehicles = await _vehicleService.GetDispatcherVehiclesAsync(
                search,
                vehicleType,
                status,
                isInternal,
                expiringSoon,
                blacklisted);

            return Ok(vehicles);
        }

        [HttpGet("{vehicleId:int}")]
        public async Task<ActionResult<DispatcherVehicleDto>> GetVehicle(int vehicleId)
        {
            try
            {
                return Ok(await _vehicleService.GetDispatcherVehicleAsync(vehicleId));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<VehicleActionResponseDto>> CreateVehicle([FromBody] UpsertDispatcherVehicleRequestDto request)
        {
            try
            {
                var created = await _vehicleService.CreateDispatcherVehicleAsync(request);
                return CreatedAtAction(
                    nameof(GetVehicle),
                    new { vehicleId = created.VehicleId },
                    new VehicleActionResponseDto
                    {
                        Success = true,
                        Message = "Tao ho so xe thanh cong.",
                        VehicleId = created.VehicleId
                    });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{vehicleId:int}")]
        public async Task<ActionResult<DispatcherVehicleDto>> UpdateVehicle(
            int vehicleId,
            [FromBody] UpsertDispatcherVehicleRequestDto request)
        {
            try
            {
                return Ok(await _vehicleService.UpdateDispatcherVehicleAsync(vehicleId, request));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{vehicleId:int}/deactivate")]
        public async Task<ActionResult<VehicleActionResponseDto>> DeactivateVehicle(int vehicleId)
        {
            try
            {
                await _vehicleService.DeactivateDispatcherVehicleAsync(vehicleId);
                return Ok(new VehicleActionResponseDto
                {
                    Success = true,
                    Message = "Xe da duoc vo hieu hoa.",
                    VehicleId = vehicleId
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
        }

        [HttpPatch("{vehicleId:int}/blacklist")]
        public async Task<ActionResult<VehicleActionResponseDto>> BlacklistVehicle(
            int vehicleId,
            [FromBody] BlacklistVehicleRequestDto request)
        {
            try
            {
                await _vehicleService.BlacklistDispatcherVehicleAsync(vehicleId, request);
                return Ok(new VehicleActionResponseDto
                {
                    Success = true,
                    Message = "Xe da duoc dua vao danh sach han che.",
                    VehicleId = vehicleId
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPatch("{vehicleId:int}/assign-driver")]
        public async Task<ActionResult<VehicleActionResponseDto>> AssignDriver(
            int vehicleId,
            [FromBody] AssignVehicleDriverRequestDto request)
        {
            try
            {
                await _vehicleService.AssignDispatcherVehicleDriverAsync(vehicleId, request);
                return Ok(new VehicleActionResponseDto
                {
                    Success = true,
                    Message = "Gan tai xe phu trach thanh cong.",
                    VehicleId = vehicleId
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
