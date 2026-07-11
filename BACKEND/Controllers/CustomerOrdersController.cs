using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BACKEND.DTOs;
using BACKEND.Models;
using BACKEND.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/customer/orders")]
    public class CustomerOrdersController : ControllerBase
    {
        private readonly ICustomerOrderTrackingService _trackingService;
        private readonly SmartLogAiContext _context;

        public CustomerOrdersController(ICustomerOrderTrackingService trackingService, SmartLogAiContext context)
        {
            _trackingService = trackingService;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<CustomerOrderSummaryDto>>> GetOrders()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { Message = "Missing or invalid user id claim." });
            }

            try
            {
                var result = await _trackingService.GetCustomerOrdersAsync(userId.Value);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }
        }

        [HttpGet("{orderId:int}/tracking")]
        public async Task<ActionResult<CustomerOrderTrackingResponse>> GetOrderTracking(int orderId)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { Message = "Missing or invalid user id claim." });
            }

            try
            {
                var result = await _trackingService.GetOrderTrackingAsync(orderId, userId.Value);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }
        }

        private int? GetCurrentUserId()
        {
            var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                ?? User.FindFirst("sub")?.Value;

            return int.TryParse(raw, out var userId) ? userId : null;
        }

        [HttpPost("{orderId:int}/feedback")]
        public async Task<IActionResult> SubmitFeedback(int orderId, [FromBody] SubmitFeedbackDto request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { Message = "Missing or invalid user id claim." });
            }

            try
            {
                var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId.Value);
                if (customer == null)
                {
                    return BadRequest("User is not a customer.");
                }

                var order = await _context.ServiceOrders.FirstOrDefaultAsync(o => o.OrderId == orderId && o.CustomerId == customer.CustomerId);
                if (order == null)
                {
                    return NotFound("Order not found or does not belong to you.");
                }

                var existing = await _context.ServiceFeedbacks.FirstOrDefaultAsync(f => f.OrderId == orderId && f.CustomerId == customer.CustomerId);
                if (existing != null)
                {
                    return BadRequest("You have already submitted feedback for this order.");
                }

                var feedback = new ServiceFeedback
                {
                    CustomerId = customer.CustomerId,
                    OrderId = orderId,
                    StarRating = (byte)request.StarRating,
                    Comment = request.Comment,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ServiceFeedbacks.Add(feedback);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Feedback submitted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    public class SubmitFeedbackDto
    {
        public int StarRating { get; set; }
        public string? Comment { get; set; }
    }
}
