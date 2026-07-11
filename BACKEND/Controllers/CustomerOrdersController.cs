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
        private readonly IPricingEngineService _pricingEngine;
        private readonly IInvoiceOcrService _invoiceOcr;
        private readonly SmartLogAiContext _context;

        public CustomerOrdersController(
            ICustomerOrderTrackingService trackingService,
            IPricingEngineService pricingEngine,
            IInvoiceOcrService invoiceOcr,
            SmartLogAiContext context)
        {
            _trackingService = trackingService;
            _pricingEngine = pricingEngine;
            _invoiceOcr = invoiceOcr;
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

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateServiceOrderRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { Message = "Missing or invalid user id claim." });
            }

            Customer customer;
            try
            {
                customer = await EnsureCustomerForUserAsync(userId.Value);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }

            var serviceType = string.IsNullOrWhiteSpace(request.ServiceType)
                ? "TRANSPORT"
                : request.ServiceType.Trim().ToUpperInvariant();

            if (serviceType == "STANDARD" || serviceType == "EXPRESS")
            {
                serviceType = "TRANSPORT";
            }

            if (serviceType == "TRANSPORT")
            {
                if (string.IsNullOrWhiteSpace(request.PickupAddress))
                    return BadRequest(new { Message = "Vui lòng nhập điểm lấy hàng." });
                if (string.IsNullOrWhiteSpace(request.DeliveryAddress))
                    return BadRequest(new { Message = "Vui lòng nhập điểm giao hàng." });
            }

            var warehouseId = request.WarehouseID;
            var warehouseExists = warehouseId > 0 && await _context.Warehouses.AnyAsync(w => w.WarehouseId == warehouseId);
            if (!warehouseExists)
            {
                warehouseId = await _context.Warehouses
                    .OrderBy(w => w.WarehouseId)
                    .Select(w => w.WarehouseId)
                    .FirstOrDefaultAsync();
            }

            if (warehouseId <= 0)
            {
                return BadRequest(new { Message = "Chưa có kho trong hệ thống để tạo đơn hàng." });
            }

            var order = new BACKEND.Models.ServiceOrder
            {
                OrderCode = "SO" + DateTime.Now.ToString("yyyyMMddHHmmss"),
                CustomerId = customer.CustomerId,
                WarehouseId = warehouseId,
                ServiceType = serviceType,
                PickupAddress = request.PickupAddress,
                PickupLat = request.PickupLat,
                PickupLng = request.PickupLng,
                DeliveryAddress = request.DeliveryAddress,
                DeliveryLat = request.DeliveryLat,
                DeliveryLng = request.DeliveryLng,
                TotalWeightKg = request.TotalWeightKg,
                TotalCbm = request.TotalCBM,
                TotalPallets = request.TotalPallets,
                EstimatedCost = request.EstimatedCost,
                FinalCost = request.EstimatedCost,
                Status = "DRAFT",
                CreatedBy = userId.Value,
                CreatedAt = DateTime.Now
            };

            _context.ServiceOrders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Tạo đơn hàng thành công.",
                orderId = order.OrderId
            });
        }

        [HttpPost("quote")]
        public async Task<ActionResult<QuoteResponseDto>> GetQuote([FromBody] QuoteRequestDto request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { Message = "Missing or invalid user id claim." });
            }

            var quote = await _pricingEngine.CalculateQuoteAsync(request);
            return Ok(quote);
        }

        [HttpPost("scan-invoice")]
        public async Task<ActionResult<InvoiceOcrResultDto>> ScanInvoice(IFormFile imageFile)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { Message = "Missing or invalid user id claim." });
            }

            if (imageFile == null || imageFile.Length == 0)
            {
                return BadRequest(new { Message = "Please provide an image file." });
            }

            var result = await _invoiceOcr.ScanInvoiceAsync(imageFile);

            if (!result.IsInvoice)
            {
                return BadRequest(new { Message = result.Message });
            }

            return Ok(result);
        }

        private int? GetCurrentUserId()
        {
            var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                ?? User.FindFirst("sub")?.Value;

            return int.TryParse(raw, out var userId) ? userId : null;
        }

        private async Task<Customer> EnsureCustomerForUserAsync(int userId)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.UserId == userId && c.IsActive != false);

            if (customer != null)
            {
                return customer;
            }

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId && u.IsActive != false);

            if (user == null)
            {
                throw new UnauthorizedAccessException("Current user is not active.");
            }

            var isCustomerRole = string.Equals(user.Role?.RoleCode, "CUSTOMER", StringComparison.OrdinalIgnoreCase)
                || user.RoleId == 4;

            if (!isCustomerRole)
            {
                throw new UnauthorizedAccessException("Current user is not linked to a customer role.");
            }

            customer = new Customer
            {
                CustomerCode = $"CUST{user.UserId:D8}",
                CompanyName = string.IsNullOrWhiteSpace(user.FullName) ? user.Username : user.FullName,
                ContactName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Tier = "BRONZE",
                TotalOrders12M = 0,
                UserId = user.UserId,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return customer;
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
