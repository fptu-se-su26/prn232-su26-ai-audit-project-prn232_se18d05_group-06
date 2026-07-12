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
            var total = invoice.TotalAmount ?? Math.Max(0, invoice.SubTotal - (invoice.DiscountAmt ?? 0) + (invoice.Vatamount ?? 0));
            var paymentInstructionsHtml = BuildPaymentInstructionHtml(invoice, total, "Quét QR hoặc chuyển khoản để thanh toán");
            var subject = $"[SmartLog AI] Hóa đơn thanh toán - {invoice.InvoiceNo}";
            var body = $@"
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f8fafc; padding: 20px;'>
    <div style='max-width: 680px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-radius: 14px;'>
        <h2 style='color: #2563eb; margin-top: 0;'>SmartLog AI - Hóa đơn thanh toán</h2>
        <p>Kính chào Quý khách <strong>{invoice.Customer.CompanyName}</strong>,</p>
        <p>SmartLog AI gửi kèm hóa đơn PDF cho đơn hàng <strong>{invoice.Order.OrderCode}</strong>. Hóa đơn được tổng hợp tự động từ các phí dịch vụ logistics đã được duyệt.</p>
        <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
            <tr style='background-color: #f8fafc;'><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>Mã hóa đơn</td><td style='padding: 10px; border: 1px solid #e2e8f0;'>{invoice.InvoiceNo}</td></tr>
            <tr><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>Ngày phát hành</td><td style='padding: 10px; border: 1px solid #e2e8f0;'>{invoice.IssueDate:dd/MM/yyyy}</td></tr>
            <tr style='background-color: #f8fafc;'><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>Hạn thanh toán</td><td style='padding: 10px; border: 1px solid #e2e8f0;'>{invoice.DueDate:dd/MM/yyyy}</td></tr>
            <tr style='font-size: 16px; font-weight: bold;'><td style='padding: 10px; border: 1px solid #e2e8f0; color: #2563eb;'>Tổng thanh toán</td><td style='padding: 10px; border: 1px solid #e2e8f0; color: #2563eb;'>{total:N0} VND</td></tr>
        </table>
        {paymentInstructionsHtml}
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
            var paymentReferenceAmount = remaining > 0 ? remaining : total;
            var paymentInstructionsHtml = BuildPaymentInstructionHtml(invoice, paymentReferenceAmount, remaining > 0 ? "Thông tin thanh toán phần còn lại" : "Thông tin giao dịch đã thanh toán");
            var subject = $"[SmartLog AI] Xác nhận thanh toán hóa đơn {invoice.InvoiceNo}";
            var body = $@"
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f8fafc; padding: 20px;'>
    <div style='max-width: 680px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-radius: 14px;'>
        <h2 style='color: #059669; margin-top: 0;'>SmartLog AI - Xác nhận thanh toán</h2>
        <p>Xin chào <strong>{invoice.Customer.CompanyName}</strong>,</p>
        <p>SmartLog AI xác nhận đã nhận được thanh toán cho hóa đơn dịch vụ logistics của quý khách.</p>
        <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
            <tr style='background-color: #f8fafc;'><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>Mã hóa đơn</td><td style='padding: 10px; border: 1px solid #e2e8f0;'>{invoice.InvoiceNo}</td></tr>
            <tr><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>Mã đơn hàng</td><td style='padding: 10px; border: 1px solid #e2e8f0;'>{invoice.Order.OrderCode}</td></tr>
            <tr style='background-color: #f8fafc;'><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>Số tiền thanh toán</td><td style='padding: 10px; border: 1px solid #e2e8f0;'>{payment.Amount:N0} VND</td></tr>
            <tr><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>Phương thức</td><td style='padding: 10px; border: 1px solid #e2e8f0;'>{payment.PaymentMethod ?? "N/A"}</td></tr>
            <tr style='background-color: #f8fafc;'><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>Thời gian thanh toán</td><td style='padding: 10px; border: 1px solid #e2e8f0;'>{paidAt:dd/MM/yyyy HH:mm}</td></tr>
            <tr><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>Tổng đã thanh toán</td><td style='padding: 10px; border: 1px solid #e2e8f0;'>{paid:N0} VND</td></tr>
            <tr style='background-color: #f8fafc;'><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>Còn lại</td><td style='padding: 10px; border: 1px solid #e2e8f0;'>{remaining:N0} VND</td></tr>
            <tr><td style='padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;'>Trạng thái hóa đơn</td><td style='padding: 10px; border: 1px solid #e2e8f0; color: #059669; font-weight: bold;'>{statusText}</td></tr>
        </table>
        {paymentInstructionsHtml}
        <p>File hóa đơn PDF được đính kèm trong email này.</p>
        <p>Cảm ơn quý khách đã sử dụng dịch vụ của SmartLog AI.</p>
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


        private const string PaymentBankName = "MB Bank - Ngân hàng TMCP Quân đội";
        private const string PaymentAccountName = "VU LE DUY";
        private const string PaymentAccountNumber = "VQRQAKJRY6534";
        private const string PaymentQrBaseUrl = "https://img.vietqr.io/image/MB-VQRQAKJRY6534-compact2.png";

        private static string BuildPaymentTransferContent(Invoice invoice)
        {
            return $"SmartLog {invoice.InvoiceNo}";
        }

        private static string BuildVietQrUrl(Invoice invoice, decimal amount)
        {
            var roundedAmount = decimal.ToInt32(decimal.Round(Math.Max(0, amount), 0));
            var content = BuildPaymentTransferContent(invoice);
            return $"{PaymentQrBaseUrl}?amount={roundedAmount}&addInfo={Uri.EscapeDataString(content)}&accountName={Uri.EscapeDataString(PaymentAccountName)}";
        }

        private static string BuildPaymentInstructionHtml(Invoice invoice, decimal amount, string title)
        {
            var transferContent = BuildPaymentTransferContent(invoice);
            var qrUrl = BuildVietQrUrl(invoice, amount);
            return $@"
        <div style='margin: 22px 0; padding: 18px; border: 1px solid #bbf7d0; border-radius: 16px; background: #f0fdf4;'>
            <h3 style='margin: 0 0 12px; color: #047857;'>{title}</h3>
            <div style='display: table; width: 100%;'>
                <div style='display: table-cell; width: 180px; vertical-align: top;'>
                    <img src='{qrUrl}' alt='SmartLog AI VietQR' style='width: 160px; height: 160px; border: 1px solid #d1fae5; border-radius: 12px; background: #ffffff;' />
                </div>
                <div style='display: table-cell; vertical-align: top; padding-left: 16px;'>
                    <p style='margin: 4px 0;'><strong>Ngân hàng:</strong> {PaymentBankName}</p>
                    <p style='margin: 4px 0;'><strong>Chủ tài khoản:</strong> {PaymentAccountName}</p>
                    <p style='margin: 4px 0;'><strong>Số tài khoản:</strong> {PaymentAccountNumber}</p>
                    <p style='margin: 4px 0;'><strong>Số tiền:</strong> {amount:N0} VND</p>
                    <p style='margin: 4px 0;'><strong>Nội dung:</strong> {transferContent}</p>
                </div>
            </div>
            <p style='margin: 12px 0 0; color: #047857; font-size: 13px;'>Vui lòng chuyển đúng nội dung để hệ thống đối soát thanh toán tự động.</p>
        </div>";
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
