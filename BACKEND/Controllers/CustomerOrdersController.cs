using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BACKEND.DTOs;
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

            // Find or bootstrap customer profile for this user.
            var customer = await ResolveCustomerAsync(userId.Value);
            if (customer == null)
            {
                return BadRequest(new { Message = "User is not associated with any customer." });
            }

            // Validations based on requirement
            if (!string.IsNullOrWhiteSpace(request.ServiceType))
            {
                if (string.IsNullOrWhiteSpace(request.PickupAddress))
                    return BadRequest(new { Message = "Vui lòng nhập điểm lấy hàng." });
                if (string.IsNullOrWhiteSpace(request.DeliveryAddress))
                    return BadRequest(new { Message = "Vui lòng nhập điểm giao hàng." });
            }

            var finalCost = request.QuotedPrice;
            if (!finalCost.HasValue || finalCost.Value <= 0)
            {
                var quote = await _pricingEngine.CalculateQuoteAsync(new QuoteRequestDto
                {
                    PickupLat = (double)(request.PickupLat ?? 0),
                    PickupLng = (double)(request.PickupLng ?? 0),
                    DeliveryLat = (double)(request.DeliveryLat ?? 0),
                    DeliveryLng = (double)(request.DeliveryLng ?? 0),
                    WeightKg = (double)(request.TotalWeightKg ?? 1),
                    Cbm = (double)(request.TotalCBM ?? 0),
                    ServiceType = request.ServiceType
                });

                finalCost = string.Equals(request.ServiceType, "EXPRESS", StringComparison.OrdinalIgnoreCase)
                    ? quote.ExpressPrice
                    : quote.StandardPrice;
            }

            var warehouseId = await ResolveWarehouseIdAsync(request.WarehouseID);
            if (warehouseId == null)
            {
                return BadRequest(new { Message = "Chưa có kho hoạt động để tạo đơn hàng. Vui lòng tạo kho trước." });
            }

            var order = new BACKEND.Models.ServiceOrder
            {
                OrderCode = "SO" + DateTime.Now.ToString("yyyyMMddHHmmss"),
                CustomerId = customer.CustomerId,
                WarehouseId = warehouseId.Value,
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
                EstimatedCost = finalCost,
                FinalCost = finalCost,
                Status = "PENDING_PAYMENT",
                CreatedBy = userId.Value,
                CreatedAt = DateTime.Now
            };

            _context.ServiceOrders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Tạo đơn hàng thành công.",
                orderId = order.OrderId,
                orderCode = order.OrderCode,
                amount = finalCost,
                nextAction = "PAYMENT_REQUIRED"
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

        private async Task<int?> ResolveWarehouseIdAsync(int requestedWarehouseId)
        {
            if (requestedWarehouseId > 0)
            {
                var requestedWarehouseExists = await _context.Warehouses
                    .AnyAsync(w => w.WarehouseId == requestedWarehouseId);

                if (requestedWarehouseExists)
                {
                    return requestedWarehouseId;
                }
            }

            var existingWarehouseId = await _context.Warehouses
                .Where(w => w.IsActive != false)
                .OrderBy(w => w.WarehouseId)
                .Select(w => (int?)w.WarehouseId)
                .FirstOrDefaultAsync();

            if (existingWarehouseId.HasValue)
            {
                return existingWarehouseId;
            }

            var defaultWarehouse = new BACKEND.Models.Warehouse
            {
                WarehouseCode = "WH-DEMO",
                WarehouseName = "Kho demo SmartLog",
                Address = "TP. Hồ Chí Minh",
                TotalCapacity = 10000,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            _context.Warehouses.Add(defaultWarehouse);
            await _context.SaveChangesAsync();

            return defaultWarehouse.WarehouseId;
        }

        private async Task<BACKEND.Models.Customer?> ResolveCustomerAsync(int userId)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
            if (customer != null)
            {
                return customer;
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId && u.IsActive != false);
            if (user == null)
            {
                return null;
            }

            customer = new BACKEND.Models.Customer
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
    }
}
