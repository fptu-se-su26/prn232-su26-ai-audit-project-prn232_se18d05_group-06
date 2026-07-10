using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BACKEND.DTOs;
using BACKEND.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        private readonly BACKEND.Models.SmartLogAiContext _context;

        public CustomerOrdersController(
            ICustomerOrderTrackingService trackingService, 
            IPricingEngineService pricingEngine, 
            IInvoiceOcrService invoiceOcr,
            BACKEND.Models.SmartLogAiContext context)
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

            // Find customer ID for this user
            var customer = _context.Customers.FirstOrDefault(c => c.UserId == userId.Value);
            if (customer == null)
            {
                return BadRequest(new { Message = "User is not associated with any customer." });
            }

            // Validations based on requirement
            if (request.ServiceType == "TRANSPORT")
            {
                if (string.IsNullOrWhiteSpace(request.PickupAddress))
                    return BadRequest(new { Message = "Vui lòng nhập điểm lấy hàng." });
                if (string.IsNullOrWhiteSpace(request.DeliveryAddress))
                    return BadRequest(new { Message = "Vui lòng nhập điểm giao hàng." });
            }

            var order = new BACKEND.Models.ServiceOrder
            {
                OrderCode = "SO" + DateTime.Now.ToString("yyyyMMddHHmmss"),
                CustomerId = customer.CustomerId,
                WarehouseId = request.WarehouseID,
                ServiceType = request.ServiceType,
                PickupAddress = request.PickupAddress,
                PickupLat = request.PickupLat,
                PickupLng = request.PickupLng,
                DeliveryAddress = request.DeliveryAddress,
                DeliveryLat = request.DeliveryLat,
                DeliveryLng = request.DeliveryLng,
                TotalWeightKg = request.TotalWeightKg,
                TotalCbm = request.TotalCBM,
                TotalPallets = request.TotalPallets,
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
    }
}
