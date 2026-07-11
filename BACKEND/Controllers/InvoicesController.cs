using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
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
    [Route("api/invoices")]
    public class InvoicesController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;
        private readonly SmartLogAiContext _context;

        public InvoicesController(IInvoiceService invoiceService, SmartLogAiContext context)
        {
            _invoiceService = invoiceService;
            _context = context;
        }


        [HttpGet("completed-orders")]
        public async Task<ActionResult<List<CompletedOrderForInvoiceDto>>> GetCompletedOrdersWithoutInvoice()
        {
            try
            {
                var orders = await _invoiceService.GetCompletedOrdersWithoutInvoiceAsync();
                return Ok(orders.Select(o => new CompletedOrderForInvoiceDto
                {
                    OrderId = o.OrderId,
                    OrderCode = o.OrderCode,
                    CustomerName = o.Customer?.CompanyName ?? string.Empty,
                    CustomerEmail = o.Customer?.Email,
                    ServiceType = o.ServiceType,
                    Status = o.Status ?? "COMPLETED",
                    EstimatedAmount = o.FinalCost ?? o.EstimatedCost ?? o.ServiceCharges.Where(c => c.IsApproved == true).Sum(c => c.Amount),
                    DiscountAmount = o.DiscountAmount ?? 0,
                    DeliveredAt = o.DeliveredAt,
                    CreatedAt = o.CreatedAt
                }).ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpPost("generate/{orderId}")]
        public async Task<ActionResult<InvoiceDto>> GenerateInvoice(int orderId)
        {
            try
            {
                var inv = await _invoiceService.GenerateInvoiceFromOrderAsync(orderId);
                var dto = MapToDto(inv);
                return CreatedAtAction(nameof(GetInvoiceById), new { invoiceId = inv.InvoiceId }, dto);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<ActionResult<List<InvoiceDto>>> GetInvoices([FromQuery] string? status, [FromQuery] string? search)
        {
            try
            {
                int? customerId = null;
                var userId = GetCurrentUserId();
                if (userId.HasValue)
                {
                    var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId.Value);
                    if (customer != null)
                    {
                        customerId = customer.CustomerId;
                    }
                }

                var list = await _invoiceService.GetInvoicesAsync(status, search, customerId);
                var dtos = list.Select(MapToDto).ToList();
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{invoiceId}")]
        public async Task<ActionResult<InvoiceDetailDto>> GetInvoiceById(int invoiceId)
        {
            try
            {
                var inv = await _invoiceService.GetInvoiceByIdAsync(invoiceId);
                if (inv == null)
                {
                    return NotFound($"Invoice with ID {invoiceId} not found.");
                }

                // Check authorization if Customer is logged in
                var userId = GetCurrentUserId();
                if (userId.HasValue)
                {
                    var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId.Value);
                    if (customer != null && inv.CustomerId != customer.CustomerId)
                    {
                        return StatusCode(StatusCodes.Status403Forbidden, "You do not have permission to view this invoice.");
                    }
                }

                var dto = new InvoiceDetailDto
                {
                    InvoiceId = inv.InvoiceId,
                    InvoiceNo = inv.InvoiceNo,
                    OrderId = inv.OrderId,
                    OrderCode = inv.Order?.OrderCode ?? string.Empty,
                    CustomerId = inv.CustomerId,
                    CustomerName = inv.Customer?.CompanyName ?? string.Empty,
                    CustomerEmail = inv.Customer?.Email,
                    IssueDate = inv.IssueDate,
                    DueDate = inv.DueDate,
                    SubTotal = inv.SubTotal,
                    DiscountAmt = inv.DiscountAmt ?? 0,
                    Vatrate = inv.Vatrate ?? 0,
                    Vatamount = inv.Vatamount ?? 0,
                    TotalAmount = inv.TotalAmount ?? 0,
                    PaidAmount = inv.PaidAmount ?? 0,
                    Status = inv.Status ?? "PENDING",
                    Pdfpath = inv.Pdfpath,
                    ServiceCharges = inv.ServiceCharges.Select(c => new InvoiceServiceChargeDto
                    {
                        ChargeId = c.ChargeId,
                        ChargeCode = c.ChargeCode,
                        ChargeType = c.ChargeType,
                        Description = c.Description,
                        Amount = c.Amount,
                        IsApproved = c.IsApproved ?? false
                    }).ToList()
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{invoiceId}/send-email")]
        public async Task<IActionResult> SendInvoiceEmail(int invoiceId)
        {
            try
            {
                var sent = await _invoiceService.SendInvoiceEmailAsync(invoiceId);
                if (sent)
                {
                    return Ok(new { Message = "Email sent successfully." });
                }
                return BadRequest("Failed to send email. Check SMTP server state and customer address.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpPost("{invoiceId}/send-payment-confirmation")]
        public async Task<IActionResult> SendPaymentConfirmationEmail(int invoiceId)
        {
            try
            {
                var sent = await _invoiceService.SendPaymentConfirmationEmailAsync(invoiceId);
                if (sent)
                {
                    return Ok(new { Message = "Payment confirmation email sent successfully." });
                }
                return BadRequest("Payment confirmation email was not sent. Check SMTP server state and customer address.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{invoiceId}/regenerate-pdf")]
        public async Task<ActionResult<InvoiceDto>> RegeneratePdf(int invoiceId)
        {
            try
            {
                var inv = await _invoiceService.RegenerateInvoicePdfAsync(invoiceId);
                return Ok(MapToDto(inv));
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

        [HttpPatch("{invoiceId}/status")]
        public async Task<ActionResult<InvoiceDto>> UpdateStatus(int invoiceId, [FromBody] InvoiceStatusPatchDto dto)
        {
            try
            {
                var inv = await _invoiceService.UpdateInvoiceStatusAsync(invoiceId, dto.Status);
                return Ok(MapToDto(inv));
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

        private static InvoiceDto MapToDto(Models.Invoice inv)
        {
            return new InvoiceDto
            {
                InvoiceId = inv.InvoiceId,
                InvoiceNo = inv.InvoiceNo,
                OrderId = inv.OrderId,
                OrderCode = inv.Order?.OrderCode ?? string.Empty,
                CustomerId = inv.CustomerId,
                CustomerName = inv.Customer?.CompanyName ?? string.Empty,
                CustomerEmail = inv.Customer?.Email,
                IssueDate = inv.IssueDate,
                DueDate = inv.DueDate,
                SubTotal = inv.SubTotal,
                DiscountAmt = inv.DiscountAmt ?? 0,
                Vatrate = inv.Vatrate ?? 0,
                Vatamount = inv.Vatamount ?? 0,
                TotalAmount = inv.TotalAmount ?? 0,
                PaidAmount = inv.PaidAmount ?? 0,
                Status = inv.Status ?? "PENDING",
                Pdfpath = inv.Pdfpath
            };
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
