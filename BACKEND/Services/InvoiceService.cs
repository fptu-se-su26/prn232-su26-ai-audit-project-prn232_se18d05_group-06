using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace BACKEND.Services
{
    public class InvoiceService : IInvoiceService
    {
        private const decimal DefaultVatRate = 8m;
        private readonly SmartLogAiContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<InvoiceService> _logger;

        public InvoiceService(
            SmartLogAiContext context,
            IEmailService emailService,
            ILogger<InvoiceService> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<Invoice> GenerateInvoiceFromOrderAsync(int orderId)
        {
            var order = await _context.ServiceOrders
                .Include(o => o.Customer)
                .Include(o => o.Voucher)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
            {
                throw new KeyNotFoundException($"Service Order with ID {orderId} not found.");
            }

            var status = order.Status?.Trim().ToUpperInvariant() ?? string.Empty;
            if (status != "COMPLETED" && status != "DELIVERED")
            {
                throw new InvalidOperationException($"Cannot generate invoice for order in '{order.Status}' status. Order must be completed or delivered.");
            }

            var existingInvoice = await _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.Order)
                .Include(i => i.ServiceCharges)
                .FirstOrDefaultAsync(i => i.OrderId == orderId);

            if (existingInvoice != null)
            {
                await EnsureInvoicePdfExistsAsync(existingInvoice);
                return existingInvoice;
            }

            var charges = await _context.ServiceCharges
                .Where(c => c.OrderId == orderId && c.IsApproved == true)
                .OrderBy(c => c.ChargeId)
                .ToListAsync();

            if (charges.Count == 0)
            {
                var fallbackAmount = order.FinalCost ?? order.EstimatedCost ?? 0m;
                if (fallbackAmount <= 0)
                {
                    throw new InvalidOperationException($"Order {order.OrderCode} has no approved service charges and no final cost to invoice.");
                }

                var fallbackCharge = new ServiceCharge
                {
                    ChargeCode = $"AUTO-{order.OrderCode}",
                    OrderId = order.OrderId,
                    ChargeType = NormalizeChargeType(order.ServiceType),
                    Description = "Tổng hợp chi phí dịch vụ logistics sau khi hoàn thành đơn hàng",
                    Amount = fallbackAmount,
                    IsApproved = true,
                    IsAdjustment = false,
                    CreatedAt = DateTime.UtcNow
                };
                _context.ServiceCharges.Add(fallbackCharge);
                await _context.SaveChangesAsync();
                charges.Add(fallbackCharge);
            }

            var subTotal = charges.Sum(c => c.Amount);
            var discount = CalculateDiscount(order, subTotal);
            var invoiceNo = await GenerateInvoiceNumberAsync(order.OrderId);

            var invoice = new Invoice
            {
                InvoiceNo = invoiceNo,
                OrderId = orderId,
                CustomerId = order.CustomerId,
                IssueDate = DateOnly.FromDateTime(DateTime.UtcNow),
                DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30)),
                SubTotal = subTotal,
                DiscountAmt = discount,
                Vatrate = DefaultVatRate,
                PaidAmount = 0,
                Status = "PENDING",
                Pdfpath = $"/invoices/{invoiceNo}.pdf",
                DigitalSigned = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            foreach (var charge in charges)
            {
                charge.InvoiceId = invoice.InvoiceId;
            }
            await _context.SaveChangesAsync();

            var savedInvoice = await _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.Order)
                .Include(i => i.ServiceCharges)
                .FirstAsync(i => i.InvoiceId == invoice.InvoiceId);

            await SaveInvoicePdfFileAsync(savedInvoice, savedInvoice.ServiceCharges.ToList());

            try
            {
                await SendInvoiceEmailAsync(savedInvoice.InvoiceId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Automatic email delivery failed during invoice creation for {InvoiceNo}.", savedInvoice.InvoiceNo);
            }

            return savedInvoice;
        }

        public async Task<List<ServiceOrder>> GetCompletedOrdersWithoutInvoiceAsync()
        {
            var completedStatuses = new[] { "COMPLETED", "DELIVERED" };
            return await _context.ServiceOrders
                .Include(o => o.Customer)
                .Where(o => o.Status != null && completedStatuses.Contains(o.Status.ToUpper()))
                .Where(o => !o.Invoices.Any())
                .OrderByDescending(o => o.DeliveredAt ?? o.CreatedAt)
                .Take(50)
                .ToListAsync();
        }

        public async Task<List<Invoice>> GetInvoicesAsync(string? status, string? search, int? customerId = null)
        {
            var query = _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.Order)
                .AsQueryable();

            if (customerId.HasValue)
            {
                query = query.Where(i => i.CustomerId == customerId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                var upperStatus = status.ToUpper();
                query = query.Where(i => i.Status == upperStatus);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(i =>
                    i.InvoiceNo.Contains(search) ||
                    i.Order.OrderCode.Contains(search) ||
                    i.Customer.CompanyName.Contains(search));
            }

            return await query.OrderByDescending(i => i.InvoiceId).ToListAsync();
        }

        public async Task<Invoice?> GetInvoiceByIdAsync(int invoiceId)
        {
            return await _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.Order)
                .Include(i => i.ServiceCharges)
                .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);
        }

        public async Task<bool> SendInvoiceEmailAsync(int invoiceId)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.Order)
                .Include(i => i.ServiceCharges)
                .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);

            if (invoice == null)
            {
                throw new KeyNotFoundException($"Invoice with ID {invoiceId} not found.");
            }

            var recipientEmail = invoice.Customer.Email;
            if (string.IsNullOrWhiteSpace(recipientEmail))
            {
                throw new InvalidOperationException($"Khách hàng {invoice.Customer.CompanyName} chưa có email. Không thể gửi hóa đơn.");
            }

            await EnsureInvoicePdfExistsAsync(invoice);

            var pdfFilePath = GetInvoicePdfPath(invoice.InvoiceNo);
            var pdfBytes = await File.ReadAllBytesAsync(pdfFilePath);
            var subject = $"[SmartLog AI] Hóa đơn thanh toán - {invoice.InvoiceNo}";
            var body = $@"
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f8fafc; padding: 20px;'>
    <div style='max-width: 640px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-radius: 14px;'>
        <h2 style='color: #2563eb; margin-top: 0;'>SmartLog AI - Hóa đơn thanh toán</h2>
        <p>Kính chào Quý khách <strong>{invoice.Customer.CompanyName}</strong>,</p>
        <p>SmartLog AI gửi kèm hóa đơn PDF cho đơn hàng <strong>{invoice.Order.OrderCode}</strong>. Hóa đơn được tổng hợp tự động từ các phí dịch vụ logistics đã được duyệt.</p>
        <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
            <tr style='background-color: #f8fafc;'>
                <td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>Mã hóa đơn</td>
                <td style='padding: 10px; border: 1px solid #e2e8f0;'>{invoice.InvoiceNo}</td>
            </tr>
            <tr>
                <td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>Ngày phát hành</td>
                <td style='padding: 10px; border: 1px solid #e2e8f0;'>{invoice.IssueDate:dd/MM/yyyy}</td>
            </tr>
            <tr style='background-color: #f8fafc;'>
                <td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>Hạn thanh toán</td>
                <td style='padding: 10px; border: 1px solid #e2e8f0;'>{invoice.DueDate:dd/MM/yyyy}</td>
            </tr>
            <tr style='font-size: 16px; font-weight: bold;'>
                <td style='padding: 10px; border: 1px solid #e2e8f0; color: #2563eb;'>Tổng thanh toán</td>
                <td style='padding: 10px; border: 1px solid #e2e8f0; color: #2563eb;'>{(invoice.TotalAmount ?? 0):N0} VND</td>
            </tr>
        </table>
        <p>Chi tiết từng khoản phí, giảm giá và VAT nằm trong file PDF đính kèm.</p>
        <p>Trân trọng,<br/><strong>SmartLog AI Finance Team</strong></p>
    </div>
</body>
</html>";

            try
            {
                await _emailService.SendEmailWithAttachmentAsync(recipientEmail, subject, body, pdfBytes, $"{invoice.InvoiceNo}.pdf");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to deliver email attachment for Invoice {InvoiceNo}.", invoice.InvoiceNo);
                return false;
            }
        }


        public async Task<bool> SendPaymentConfirmationEmailAsync(int invoiceId, int? paymentId = null)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.Order)
                .Include(i => i.Payments)
                .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);

            if (invoice == null)
            {
                throw new KeyNotFoundException($"Invoice with ID {invoiceId} not found.");
            }

            var recipientEmail = invoice.Customer.Email;
            if (string.IsNullOrWhiteSpace(recipientEmail))
            {
                throw new InvalidOperationException($"Customer {invoice.Customer.CompanyName} has no email address.");
            }

            var paymentQuery = _context.Payments.Where(p => p.InvoiceId == invoiceId && p.Status != null && p.Status.ToUpper() == "CONFIRMED");
            Payment? payment = null;
            if (paymentId.HasValue)
            {
                payment = await paymentQuery.FirstOrDefaultAsync(p => p.PaymentId == paymentId.Value);
            }
            payment ??= await paymentQuery.OrderByDescending(p => p.PaidAt).ThenByDescending(p => p.PaymentId).FirstOrDefaultAsync();

            if (payment == null)
            {
                throw new InvalidOperationException("Invoice has no confirmed payment to notify.");
            }

            await EnsureInvoicePdfExistsAsync(invoice);
            var pdfFilePath = GetInvoicePdfPath(invoice.InvoiceNo);
            var pdfBytes = await File.ReadAllBytesAsync(pdfFilePath);

            var total = invoice.TotalAmount ?? Math.Max(0, invoice.SubTotal - (invoice.DiscountAmt ?? 0) + (invoice.Vatamount ?? 0));
            var paid = invoice.PaidAmount ?? 0m;
            var remaining = Math.Max(0m, total - paid);
            var statusText = invoice.Status == "PAID" ? "Da thanh toan" : invoice.Status == "PARTIAL" ? "Thanh toan mot phan" : invoice.Status ?? "PENDING";
            var paidAt = payment.PaidAt ?? DateTime.UtcNow;
            var subject = $"[SmartLog AI] Xac nhan thanh toan hoa don {invoice.InvoiceNo}";
            var body = $@"
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f8fafc; padding: 20px;'>
    <div style='max-width: 640px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-radius: 14px;'>
        <h2 style='color: #059669; margin-top: 0;'>SmartLog AI - X&#225;c nh&#7853;n thanh to&#225;n</h2>
        <p>Xin ch&#224;o <strong>{invoice.Customer.CompanyName}</strong>,</p>
        <p>SmartLog AI x&#225;c nh&#7853;n &#273;&#227; nh&#7853;n &#273;&#432;&#7907;c thanh to&#225;n cho h&#243;a &#273;&#417;n d&#7883;ch v&#7909; logistics c&#7911;a qu&#253; kh&#225;ch.</p>
        <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
            <tr style='background-color: #f8fafc;'><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>M&#227; h&#243;a &#273;&#417;n</td><td style='padding: 10px; border: 1px solid #e2e8f0;'>{invoice.InvoiceNo}</td></tr>
            <tr><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>M&#227; &#273;&#417;n h&#224;ng</td><td style='padding: 10px; border: 1px solid #e2e8f0;'>{invoice.Order.OrderCode}</td></tr>
            <tr style='background-color: #f8fafc;'><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>S&#7889; ti&#7873;n thanh to&#225;n</td><td style='padding: 10px; border: 1px solid #e2e8f0;'>{payment.Amount:N0} VND</td></tr>
            <tr><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>Ph&#432;&#417;ng th&#7913;c</td><td style='padding: 10px; border: 1px solid #e2e8f0;'>{payment.PaymentMethod ?? "N/A"}</td></tr>
            <tr style='background-color: #f8fafc;'><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>Th&#7901;i gian thanh to&#225;n</td><td style='padding: 10px; border: 1px solid #e2e8f0;'>{paidAt:dd/MM/yyyy HH:mm}</td></tr>
            <tr><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>T&#7893;ng &#273;&#227; thanh to&#225;n</td><td style='padding: 10px; border: 1px solid #e2e8f0;'>{paid:N0} VND</td></tr>
            <tr style='background-color: #f8fafc;'><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>C&#242;n l&#7841;i</td><td style='padding: 10px; border: 1px solid #e2e8f0;'>{remaining:N0} VND</td></tr>
            <tr><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>Tr&#7841;ng th&#225;i h&#243;a &#273;&#417;n</td><td style='padding: 10px; border: 1px solid #e2e8f0; color: #059669; font-weight: bold;'>{statusText}</td></tr>
        </table>
        <p>File h&#243;a &#273;&#417;n PDF &#273;&#432;&#7907;c &#273;&#237;nh k&#232;m trong email n&#224;y.</p>
        <p>C&#7843;m &#417;n qu&#253; kh&#225;ch &#273;&#227; s&#7917; d&#7909;ng d&#7883;ch v&#7909; c&#7911;a SmartLog AI.</p>
        <p>Tr&#226;n tr&#7885;ng,<br/><strong>SmartLog AI Finance Team</strong></p>
    </div>
</body>
</html>";

            try
            {
                await _emailService.SendEmailWithAttachmentAsync(recipientEmail, subject, body, pdfBytes, $"{invoice.InvoiceNo}.pdf");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to deliver payment confirmation email for Invoice {InvoiceNo}.", invoice.InvoiceNo);
                return false;
            }
        }

        public async Task<Invoice> RegenerateInvoicePdfAsync(int invoiceId)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.Order)
                .Include(i => i.ServiceCharges)
                .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);

            if (invoice == null)
            {
                throw new KeyNotFoundException($"Invoice with ID {invoiceId} not found.");
            }

            await SaveInvoicePdfFileAsync(invoice, invoice.ServiceCharges.ToList());
            return invoice;
        }

        public async Task<Invoice> UpdateInvoiceStatusAsync(int invoiceId, string status)
        {
            var invoice = await _context.Invoices.FindAsync(invoiceId);
            if (invoice == null)
            {
                throw new KeyNotFoundException($"Invoice with ID {invoiceId} not found.");
            }

            var upper = status.ToUpper();
            if (upper != "PENDING" && upper != "PARTIAL" && upper != "PAID" && upper != "OVERDUE" && upper != "CANCELLED")
            {
                throw new ArgumentException("Invalid invoice status. Allowed values: PENDING, PARTIAL, PAID, OVERDUE, CANCELLED.");
            }

            invoice.Status = upper;
            if (upper == "PAID")
            {
                invoice.PaidAmount = invoice.TotalAmount;
            }

            await _context.SaveChangesAsync();
            return invoice;
        }

        private static decimal CalculateDiscount(ServiceOrder order, decimal subTotal)
        {
            var discount = order.DiscountAmount ?? 0m;
            var voucher = order.Voucher;
            if (voucher != null && subTotal >= (voucher.MinOrderValue ?? 0m))
            {
                if (voucher.DiscountAmount.HasValue)
                {
                    discount = Math.Max(discount, voucher.DiscountAmount.Value);
                }
                if (voucher.DiscountPct.HasValue)
                {
                    discount = Math.Max(discount, Math.Round(subTotal * voucher.DiscountPct.Value / 100m, 0));
                }
            }

            return Math.Clamp(discount, 0m, subTotal);
        }

        private static string NormalizeChargeType(string? serviceType)
        {
            var normalized = serviceType?.Trim().ToUpperInvariant();
            return normalized switch
            {
                "COLD_STORAGE" => "Lưu kho lạnh",
                "WAREHOUSE" or "STORAGE" => "Lưu kho",
                "TRANSPORT" or "DELIVERY" => "Vận chuyển",
                "HANDLING" => "Bốc dỡ",
                _ => string.IsNullOrWhiteSpace(serviceType) ? "Dịch vụ logistics" : serviceType
            };
        }

        private async Task<string> GenerateInvoiceNumberAsync(int orderId)
        {
            var baseNo = $"INV-{DateTime.UtcNow:yyyyMMdd}-{orderId:0000}";
            var invoiceNo = baseNo;
            var suffix = 1;
            while (await _context.Invoices.AnyAsync(i => i.InvoiceNo == invoiceNo))
            {
                invoiceNo = $"{baseNo}-{suffix++}";
            }
            return invoiceNo;
        }

        private async Task EnsureInvoicePdfExistsAsync(Invoice invoice)
        {
            var pdfFilePath = GetInvoicePdfPath(invoice.InvoiceNo);
            if (File.Exists(pdfFilePath))
            {
                return;
            }

            var fullInvoice = await _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.Order)
                .Include(i => i.ServiceCharges)
                .FirstAsync(i => i.InvoiceId == invoice.InvoiceId);

            await SaveInvoicePdfFileAsync(fullInvoice, fullInvoice.ServiceCharges.ToList());
        }

        private async Task SaveInvoicePdfFileAsync(Invoice invoice, List<ServiceCharge> charges)
        {
            var pdfCharges = charges.Select(c => (c.ChargeType, c.Description ?? string.Empty, c.Amount)).ToList();
            var pdfBytes = InvoicePdfGenerator.Generate(
                invoice.InvoiceNo,
                invoice.Order.OrderCode,
                invoice.Customer.CompanyName,
                invoice.Customer.ContactName,
                invoice.Customer.Address,
                invoice.Customer.TaxCode,
                invoice.IssueDate.ToDateTime(TimeOnly.MinValue),
                invoice.DueDate.ToDateTime(TimeOnly.MinValue),
                pdfCharges,
                invoice.SubTotal,
                invoice.DiscountAmt ?? 0,
                (invoice.Vatrate ?? 0) / 100,
                invoice.Vatamount ?? 0,
                invoice.TotalAmount ?? 0
            );

            var invoicesDirectory = GetInvoicesDirectory();
            if (!Directory.Exists(invoicesDirectory))
            {
                Directory.CreateDirectory(invoicesDirectory);
            }

            var pdfFilePath = Path.Combine(invoicesDirectory, $"{invoice.InvoiceNo}.pdf");
            await File.WriteAllBytesAsync(pdfFilePath, pdfBytes);
            invoice.Pdfpath = $"/invoices/{invoice.InvoiceNo}.pdf";
            await _context.SaveChangesAsync();
            _logger.LogInformation("Invoice PDF saved to local path: {PdfFilePath}", pdfFilePath);
        }

        private static string GetInvoicePdfPath(string invoiceNo)
        {
            return Path.Combine(GetInvoicesDirectory(), $"{invoiceNo}.pdf");
        }

        private static string GetInvoicesDirectory()
        {
            var projectRoot = AppDomain.CurrentDomain.BaseDirectory;
            var binIndex = projectRoot.IndexOf("bin", StringComparison.OrdinalIgnoreCase);
            if (binIndex >= 0)
            {
                projectRoot = projectRoot[..binIndex];
            }
            return Path.Combine(projectRoot, "wwwroot", "invoices");
        }
    }
}
