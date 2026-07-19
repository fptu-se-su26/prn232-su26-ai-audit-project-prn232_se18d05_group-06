using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BACKEND.DTOs;
using BACKEND.Services;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "ADMIN,WAREHOUSE,WF,DISPATCHER")]
    public class OutboundController : ControllerBase
    {
        private readonly IOutboundService _outboundService;

        public OutboundController(IOutboundService outboundService)
        {
            _outboundService = outboundService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateOutboundOrder([FromBody] OutboundRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Extract operator user ID from JWT claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "User context is missing or invalid in authenticated claims." });
            }

            try
            {
                var response = await _outboundService.CreateOutboundOrderAsync(request.OrderId, userId);
                return Ok(response);
            }
            catch (DbUpdateConcurrencyException)
            {
                // Explicitly catch and map database concurrency exceptions to HTTP 409 Conflict
                return Conflict(new { message = "Concurrency conflict: another transaction was updating the same inventory record. Please try again." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message, details = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing the outbound order.", details = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetOutboundOrders()
        {
            try
            {
                var list = await _outboundService.GetOutboundOrdersAsync();
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving outbound orders.", details = ex.Message });
            }
        }

        [HttpGet("eligible-service-orders")]
        public async Task<IActionResult> GetEligibleServiceOrders()
        {
            try
            {
                var list = await _outboundService.GetEligibleServiceOrdersAsync();
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving eligible service orders.", details = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOutboundOrderById(int id)
        {
            try
            {
                var order = await _outboundService.GetOutboundOrderByIdAsync(id);
                if (order == null)
                {
                    return NotFound(new { message = $"Outbound order with ID {id} was not found." });
                }
                return Ok(order);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the outbound order details.", details = ex.Message });
            }
        }

        [HttpPost("{outboundId}/lines/{lineId}/pick")]
        public async Task<IActionResult> PickLine(int outboundId, int lineId, [FromBody] PickRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "User context is missing or invalid in authenticated claims." });
            }

            try
            {
                var response = await _outboundService.MarkLineAsPickedAsync(outboundId, lineId, request.PickedQty, userId);
                return Ok(response);
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new { message = "Concurrency conflict: another transaction was updating the same outbound line. Please try again." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while picking the outbound line.", details = ex.Message });
            }
        }

        [HttpPost("{outboundId}/confirm-picking")]
        public async Task<IActionResult> ConfirmPicking(int outboundId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "User context is missing or invalid in authenticated claims." });
            }

            try
            {
                var response = await _outboundService.ConfirmPickingAsync(outboundId, userId);
                return Ok(response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while confirming outbound picking.", details = ex.Message });
            }
        }

        [HttpPut("{outboundId}/shipping-label")]
        public async Task<IActionResult> GetOrCreateShippingLabel(int outboundId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "User context is missing or invalid in authenticated claims." });
            }

            try
            {
                var label = await _outboundService.GetOrCreateShippingLabelAsync(outboundId, userId);
                return Ok(label);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred while processing the shipping label.", details = ex.ToString() });
            }
        }

        [HttpGet("{outboundId}/shipping-label")]
        public async Task<IActionResult> GetShippingLabel(int outboundId)
        {
            try
            {
                var label = await _outboundService.GetShippingLabelAsync(outboundId);
                if (label == null)
                {
                    return NotFound(new { message = $"No shipping label has been generated for outbound order {outboundId}." });
                }
                return Ok(label);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred while retrieving the shipping label.", details = ex.Message });
            }
        }

        [HttpPost("{outboundId}/dispatch")]
        public async Task<IActionResult> DispatchOrder(int outboundId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "User context is missing or invalid in authenticated claims." });
            }

            try
            {
                var response = await _outboundService.DispatchOrderAsync(outboundId, userId);
                return Ok(response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while dispatching the outbound order.", details = ex.Message });
            }
        }
    }
}
