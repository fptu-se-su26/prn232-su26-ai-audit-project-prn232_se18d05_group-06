using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using BACKEND.DTOs;
using BACKEND.Models;
using BACKEND.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/customer/invoices")]
    public class CustomerInvoicesController : ControllerBase
    {
        private readonly SmartLogAiContext _context;
        private readonly IInvoiceService _invoiceService;
        private static readonly ConcurrentDictionary<int, DateTime> _resendTimestamps = new();

        public CustomerInvoicesController(SmartLogAiContext context, IInvoiceService invoiceService)
        {
            _context = context;
            _invoiceService = invoiceService;
        }

        [HttpGet]
        public async Task<ActionResult<List<InvoiceDto>>> GetCustomerInvoices(
            [FromQuery] string? status,
            [FromQuery] DateOnly? fromDate,
            [FromQuery] DateOnly? toDate,
            [FromQuery] string? keyword)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("Missing or invalid user id claim.");
                }

                var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId.Value);
                if (customer == null)
                {
                    return BadRequest("User is not registered as a customer.");
                }

                var query = _context.Invoices
                    .Include(i => i.Order)
                    .Where(i => i.CustomerId == customer.CustomerId)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status) && status.ToUpper() != "ALL")
                {
                    var upperStatus = status.ToUpper();
                    query = query.Where(i => i.Status == upperStatus);
                }

                if (fromDate.HasValue)
                {
                    query = query.Where(i => i.IssueDate >= fromDate.Value);
                }

                if (toDate.HasValue)
                {
                    query = query.Where(i => i.IssueDate <= toDate.Value);
                }

                if (!string.IsNullOrEmpty(keyword))
                {
                    query = query.Where(i =>
                        i.InvoiceNo.Contains(keyword) ||
                        i.Order.OrderCode.Contains(keyword));
                }

                var list = await query.OrderByDescending(i => i.InvoiceId).ToListAsync();
                var dtos = list.Select(MapToDto).ToList();
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{invoiceId:int}")]
        public async Task<ActionResult<InvoiceDetailDto>> GetCustomerInvoiceById(int invoiceId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("Missing or invalid user id claim.");
                }

                var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId.Value);
                if (customer == null)
                {
                    return BadRequest("User is not registered as a customer.");
                }

                var inv = await _context.Invoices
                    .Include(i => i.Customer)
                    .Include(i => i.Order)
                    .Include(i => i.ServiceCharges)
                    .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);

                if (inv == null)
                {
                    return NotFound($"Invoice with ID {invoiceId} not found.");
                }

                // Security check: Customer can only view their own invoices
                if (inv.CustomerId != customer.CustomerId)
                {
                    return StatusCode(StatusCodes.Status403Forbidden, "You do not have permission to view this invoice.");
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


        [HttpGet("{invoiceId:int}/receipt")]
        public async Task<IActionResult> GetReceipt(int invoiceId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("Missing or invalid user id claim.");
                }

                var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId.Value);
                if (customer == null)
                {
                    return BadRequest("User is not registered as a customer.");
                }

                var invoice = await _context.Invoices
                    .Include(i => i.Order)
                    .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId && i.CustomerId == customer.CustomerId);

                if (invoice == null)
                {
                    return NotFound($"Invoice with ID {invoiceId} not found.");
                }

                var payments = await _context.Payments
                    .Where(p => p.InvoiceId == invoiceId && p.Status != null && p.Status.ToUpper() == "CONFIRMED")
                    .OrderByDescending(p => p.PaidAt)
                    .Select(p => new
                    {
                        p.PaymentId,
                        p.PaymentCode,
                        p.Amount,
                        p.PaymentMethod,
                        p.BankTxnRef,
                        p.PaidAt,
                        p.Status,
                        p.ReceiptPath
                    })
                    .ToListAsync();

                if (payments.Count == 0)
                {
                    return BadRequest("Invoice has no confirmed payment receipt yet.");
                }

                var total = invoice.TotalAmount ?? invoice.SubTotal;
                var paid = invoice.PaidAmount ?? payments.Sum(p => p.Amount);
                return Ok(new
                {
                    invoice.InvoiceId,
                    invoice.InvoiceNo,
                    OrderCode = invoice.Order?.OrderCode,
                    InvoiceStatus = invoice.Status,
                    TotalAmount = total,
                    PaidAmount = paid,
                    RemainingAmount = Math.Max(0, total - paid),
                    Payments = payments
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{invoiceId:int}/request-resend")]
        public async Task<IActionResult> RequestResendEmail(int invoiceId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("Missing or invalid user id claim.");
                }

                var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId.Value);
                if (customer == null)
                {
                    return BadRequest("User is not registered as a customer.");
                }

                var inv = await _context.Invoices.FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);
                if (inv == null)
                {
                    return NotFound($"Invoice with ID {invoiceId} not found.");
                }

                // Security check
                if (inv.CustomerId != customer.CustomerId)
                {
                    return StatusCode(StatusCodes.Status403Forbidden, "You do not have permission to view this invoice.");
                }

                // Spam prevention limit: 5 minutes
                if (_resendTimestamps.TryGetValue(invoiceId, out var lastSent))
                {
                    var diff = DateTime.UtcNow - lastSent;
                    if (diff.TotalMinutes < 5)
                    {
                        var remaining = Math.Ceiling(5 - diff.TotalMinutes);
                        return BadRequest($"Moi hoa don chi cho phep gui lai sau moi 5 phut. Vui long thu lai sau {remaining} phut.");
                    }
                }

                var sent = await _invoiceService.SendInvoiceEmailAsync(invoiceId);
                if (sent)
                {
                    _resendTimestamps[invoiceId] = DateTime.UtcNow;
                    return Ok(new { Message = "Email sent successfully." });
                }

                return BadRequest("Failed to send email. Smtp delivery error.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private int? GetCurrentUserId()
        {
            var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                ?? User.FindFirst("sub")?.Value;

            return int.TryParse(raw, out var userId) ? userId : null;
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
    }
}
