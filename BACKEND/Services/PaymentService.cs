using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace BACKEND.Services;

public class PaymentService : IPaymentService
{
    private readonly SmartLogAiContext _context;
    private readonly IInvoiceService _invoiceService;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(SmartLogAiContext context, IInvoiceService invoiceService, ILogger<PaymentService> logger)
    {
        _context = context;
        _invoiceService = invoiceService;
        _logger = logger;
    }

    public async Task<PaymentConfirmationDto> ConfirmPaymentAsync(ConfirmPaymentRequestDto request, int? confirmedBy = null, CancellationToken cancellationToken = default)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Order)
            .FirstOrDefaultAsync(i => i.InvoiceId == request.InvoiceId, cancellationToken);

        if (invoice == null)
        {
            throw new KeyNotFoundException($"Invoice {request.InvoiceId} not found.");
        }

        if (IsCancelled(invoice.Status))
        {
            throw new InvalidOperationException("Can not confirm payment for a cancelled invoice.");
        }

        Payment payment;
        if (request.PaymentId.HasValue)
        {
            payment = await _context.Payments.FirstOrDefaultAsync(p => p.PaymentId == request.PaymentId.Value, cancellationToken)
                ?? throw new KeyNotFoundException($"Payment {request.PaymentId.Value} not found.");
            if (payment.InvoiceId != invoice.InvoiceId)
            {
                throw new InvalidOperationException("Payment does not belong to the selected invoice.");
            }
        }
        else
        {
            var total = ResolveInvoiceAmount(invoice);
            var paid = invoice.PaidAmount ?? 0m;
            var remaining = Math.Max(0m, total - paid);
            var amount = request.Amount ?? remaining;
            if (amount <= 0)
            {
                throw new InvalidOperationException("Payment amount must be greater than zero.");
            }

            payment = new Payment
            {
                PaymentCode = await GeneratePaymentCodeAsync(invoice.InvoiceId, cancellationToken),
                InvoiceId = invoice.InvoiceId,
                CustomerId = invoice.CustomerId,
                Amount = amount,
                PaymentMethod = string.IsNullOrWhiteSpace(request.PaymentMethod) ? "MANUAL" : request.PaymentMethod.Trim().ToUpperInvariant(),
                BankTxnRef = string.IsNullOrWhiteSpace(request.BankTxnRef) ? $"MANUAL-{invoice.InvoiceNo}" : request.BankTxnRef.Trim(),
                Status = "CONFIRMED",
                PaidAt = request.PaidAt ?? DateTime.UtcNow,
                ConfirmedBy = confirmedBy
            };
            _context.Payments.Add(payment);
        }

        payment.Status = "CONFIRMED";
        payment.PaidAt ??= request.PaidAt ?? DateTime.UtcNow;
        payment.ConfirmedBy ??= confirmedBy;
        if (!string.IsNullOrWhiteSpace(request.PaymentMethod)) payment.PaymentMethod = request.PaymentMethod.Trim().ToUpperInvariant();
        if (!string.IsNullOrWhiteSpace(request.BankTxnRef)) payment.BankTxnRef = request.BankTxnRef.Trim();
        if (request.Amount.HasValue && request.Amount.Value > 0 && request.PaymentId.HasValue) payment.Amount = request.Amount.Value;

        await _context.SaveChangesAsync(cancellationToken);
        return await RefreshInvoiceAndNotifyAsync(invoice.InvoiceId, payment.PaymentId, request.SendEmail, cancellationToken);
    }

    public async Task<PaymentConfirmationDto> ConfirmExistingPaymentAsync(int paymentId, int? confirmedBy = null, bool sendEmail = true, CancellationToken cancellationToken = default)
    {
        var payment = await _context.Payments
            .Include(p => p.Invoice)
            .FirstOrDefaultAsync(p => p.PaymentId == paymentId, cancellationToken)
            ?? throw new KeyNotFoundException($"Payment {paymentId} not found.");

        payment.Status = "CONFIRMED";
        payment.PaidAt ??= DateTime.UtcNow;
        payment.ConfirmedBy ??= confirmedBy;
        await _context.SaveChangesAsync(cancellationToken);

        return await RefreshInvoiceAndNotifyAsync(payment.InvoiceId, payment.PaymentId, sendEmail, cancellationToken);
    }

    private async Task<PaymentConfirmationDto> RefreshInvoiceAndNotifyAsync(int invoiceId, int paymentId, bool sendEmail, CancellationToken cancellationToken)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Payments)
            .FirstAsync(i => i.InvoiceId == invoiceId, cancellationToken);

        var confirmedPaid = await _context.Payments
            .Where(p => p.InvoiceId == invoiceId && p.Status != null && p.Status.ToUpper() == "CONFIRMED")
            .SumAsync(p => p.Amount, cancellationToken);

        var total = ResolveInvoiceAmount(invoice);
        invoice.PaidAmount = confirmedPaid;
        invoice.Status = confirmedPaid >= total ? "PAID" : confirmedPaid > 0 ? "PARTIAL" : "PENDING";
        await _context.SaveChangesAsync(cancellationToken);

        var emailSent = false;
        if (sendEmail)
        {
            try
            {
                emailSent = await _invoiceService.SendPaymentConfirmationEmailAsync(invoiceId, paymentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Payment confirmation email failed for invoice {InvoiceId}, payment {PaymentId}.", invoiceId, paymentId);
            }
        }

        var payment = await _context.Payments.FirstAsync(p => p.PaymentId == paymentId, cancellationToken);
        return new PaymentConfirmationDto
        {
            PaymentId = payment.PaymentId,
            PaymentCode = payment.PaymentCode,
            InvoiceId = invoice.InvoiceId,
            InvoiceNo = invoice.InvoiceNo,
            PaymentAmount = payment.Amount,
            PaidAmount = invoice.PaidAmount ?? 0m,
            TotalAmount = total,
            RemainingAmount = Math.Max(0m, total - (invoice.PaidAmount ?? 0m)),
            InvoiceStatus = invoice.Status ?? "PENDING",
            EmailSent = emailSent,
            Message = emailSent
                ? "Payment confirmed and confirmation email sent."
                : "Payment confirmed. Confirmation email was not sent."
        };
    }

    private async Task<string> GeneratePaymentCodeAsync(int invoiceId, CancellationToken cancellationToken)
    {
        var baseCode = $"PAY-{DateTime.UtcNow:yyyyMMddHHmmss}-{invoiceId}";
        var code = baseCode.Length <= 30 ? baseCode : baseCode[..30];
        var suffix = 1;
        while (await _context.Payments.AnyAsync(p => p.PaymentCode == code, cancellationToken))
        {
            var tail = $"-{suffix++}";
            code = baseCode.Length + tail.Length <= 30 ? baseCode + tail : baseCode[..(30 - tail.Length)] + tail;
        }
        return code;
    }

    private static decimal ResolveInvoiceAmount(Invoice invoice)
    {
        return invoice.TotalAmount ?? Math.Max(0, invoice.SubTotal - (invoice.DiscountAmt ?? 0) + (invoice.Vatamount ?? 0));
    }

    private static bool IsCancelled(string? status)
    {
        var normalized = status?.Trim().ToUpperInvariant();
        return normalized is "CANCELLED" or "CANCELED" or "VOID";
    }
}
