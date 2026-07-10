using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Services;

public class FinanceReconciliationService : IFinanceReconciliationService
{
    private readonly SmartLogAiContext _context;

    public FinanceReconciliationService(SmartLogAiContext context)
    {
        _context = context;
    }

    public async Task<PaymentReconciliationListDto> GetReconciliationsAsync(string? status, CancellationToken cancellationToken = default)
    {
        var normalizedStatus = string.IsNullOrWhiteSpace(status) ? "ALL" : status.Trim().ToUpperInvariant();
        var query = _context.BankReconciliations
            .AsNoTracking()
            .Include(item => item.MatchedInvoice)
            .Include(item => item.MatchedPayment)
            .AsQueryable();

        if (normalizedStatus != "ALL")
        {
            query = query.Where(item => item.Status != null && item.Status.ToUpper() == normalizedStatus);
        }

        var rows = await query
            .OrderByDescending(item => item.BankTxnDate)
            .ThenByDescending(item => item.ReconcileId)
            .ToListAsync(cancellationToken);

        var items = rows.Select(ToItemDto).ToList();

        return new PaymentReconciliationListDto
        {
            Total = items.Count,
            Matched = items.Count(item => item.Status == "MATCHED"),
            Partial = items.Count(item => item.Status == "PARTIAL"),
            Unmatched = items.Count(item => item.Status == "UNMATCHED"),
            Items = items
        };
    }

    public async Task<AutoMatchReconciliationResponseDto> AutoMatchAsync(CancellationToken cancellationToken = default)
    {
        var reconciliations = await _context.BankReconciliations
            .Where(item => item.Status == null || item.Status.ToUpper() != "MATCHED")
            .ToListAsync(cancellationToken);

        var matched = 0;
        var partial = 0;
        var unmatched = 0;

        foreach (var reconciliation in reconciliations)
        {
            var payment = await _context.Payments
                .Include(item => item.Invoice)
                .FirstOrDefaultAsync(item => item.BankTxnRef == reconciliation.BankTxnRef, cancellationToken);

            if (payment == null || IsInvoiceCancelled(payment.Invoice))
            {
                reconciliation.MatchedInvoiceId = null;
                reconciliation.MatchedPaymentId = null;
                reconciliation.Status = "UNMATCHED";
                unmatched++;
                continue;
            }

            reconciliation.MatchedPaymentId = payment.PaymentId;
            reconciliation.MatchedInvoiceId = payment.InvoiceId;

            var invoiceAmount = ResolveInvoiceAmount(payment.Invoice);
            if (reconciliation.Amount == payment.Amount && payment.Amount >= invoiceAmount)
            {
                reconciliation.Status = "MATCHED";
                matched++;
            }
            else if (reconciliation.Amount == payment.Amount && payment.Amount > 0 && payment.Amount < invoiceAmount)
            {
                reconciliation.Status = "PARTIAL";
                partial++;
            }
            else
            {
                reconciliation.Status = payment.Amount > 0 && payment.Amount < invoiceAmount ? "PARTIAL" : "UNMATCHED";
                if (reconciliation.Status == "PARTIAL") partial++; else unmatched++;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new AutoMatchReconciliationResponseDto
        {
            TotalChecked = reconciliations.Count,
            Matched = matched,
            Partial = partial,
            Unmatched = unmatched,
            Message = "Auto-match completed."
        };
    }

    public async Task<ManualMatchReconciliationResponseDto> ManualMatchAsync(ManualMatchReconciliationRequestDto request, CancellationToken cancellationToken = default)
    {
        var reconciliation = await _context.BankReconciliations
            .FirstOrDefaultAsync(item => item.ReconcileId == request.ReconcileId, cancellationToken);
        if (reconciliation == null)
        {
            return new ManualMatchReconciliationResponseDto
            {
                Status = "UNMATCHED",
                Message = "Khong tim thay giao dich doi soat."
            };
        }

        var invoice = await _context.Invoices.FirstOrDefaultAsync(item => item.InvoiceId == request.InvoiceId, cancellationToken);
        var payment = await _context.Payments.FirstOrDefaultAsync(item => item.PaymentId == request.PaymentId, cancellationToken);
        if (invoice == null || payment == null || payment.InvoiceId != invoice.InvoiceId || IsInvoiceCancelled(invoice))
        {
            reconciliation.MatchedInvoiceId = null;
            reconciliation.MatchedPaymentId = null;
            reconciliation.Status = "UNMATCHED";
            await _context.SaveChangesAsync(cancellationToken);
            return new ManualMatchReconciliationResponseDto
            {
                Status = "UNMATCHED",
                Message = "Giao dich khong khop voi hoa don hoac payment da chon."
            };
        }

        reconciliation.MatchedInvoiceId = invoice.InvoiceId;
        reconciliation.MatchedPaymentId = payment.PaymentId;
        reconciliation.Status = ResolveMatchStatus(reconciliation.Amount, payment.Amount, ResolveInvoiceAmount(invoice));
        await _context.SaveChangesAsync(cancellationToken);

        return new ManualMatchReconciliationResponseDto
        {
            Status = reconciliation.Status,
            Message = reconciliation.Status == "MATCHED"
                ? "Giao dich da duoc doi soat thanh cong."
                : "Giao dich da duoc gan thu cong va can theo doi phan con lai."
        };
    }

    private static PaymentReconciliationItemDto ToItemDto(BankReconciliation item)
    {
        decimal? invoiceAmount = item.MatchedInvoice == null ? null : ResolveInvoiceAmount(item.MatchedInvoice);
        return new PaymentReconciliationItemDto
        {
            ReconcileId = item.ReconcileId,
            BankTxnRef = item.BankTxnRef,
            BankTxnDate = item.BankTxnDate,
            BankAmount = item.Amount,
            Description = item.Description,
            MatchedInvoiceId = item.MatchedInvoiceId,
            InvoiceNo = item.MatchedInvoice?.InvoiceNo,
            InvoiceAmount = invoiceAmount,
            InvoiceStatus = item.MatchedInvoice?.Status,
            MatchedPaymentId = item.MatchedPaymentId,
            PaymentCode = item.MatchedPayment?.PaymentCode,
            PaymentAmount = item.MatchedPayment?.Amount,
            PaymentMethod = item.MatchedPayment?.PaymentMethod,
            Status = item.Status ?? "UNMATCHED",
            MatchNote = BuildMatchNote(item, invoiceAmount)
        };
    }

    private static string BuildMatchNote(BankReconciliation item, decimal? invoiceAmount)
    {
        if (item.MatchedPayment == null) return "Chua tim thay payment cung BankTxnRef.";
        if (item.MatchedInvoice == null) return "Payment chua lien ket hoa don.";
        if (IsInvoiceCancelled(item.MatchedInvoice)) return "Hoa don da huy.";
        if (item.Amount != item.MatchedPayment.Amount) return "So tien ngan hang khac so tien payment.";
        if (invoiceAmount.HasValue && item.MatchedPayment.Amount < invoiceAmount.Value) return "Payment moi thanh toan mot phan hoa don.";
        return "Giao dich khop ma ngan hang, payment va hoa don.";
    }

    private static string ResolveMatchStatus(decimal bankAmount, decimal paymentAmount, decimal invoiceAmount)
    {
        if (bankAmount == paymentAmount && paymentAmount >= invoiceAmount) return "MATCHED";
        if (bankAmount == paymentAmount && paymentAmount > 0 && paymentAmount < invoiceAmount) return "PARTIAL";
        return paymentAmount > 0 && paymentAmount < invoiceAmount ? "PARTIAL" : "UNMATCHED";
    }

    private static decimal ResolveInvoiceAmount(Invoice invoice)
    {
        return invoice.TotalAmount ?? Math.Max(0, invoice.SubTotal - (invoice.DiscountAmt ?? 0) + (invoice.Vatamount ?? 0));
    }

    private static bool IsInvoiceCancelled(Invoice invoice)
    {
        var status = invoice.Status?.Trim().ToUpperInvariant();
        return status is "CANCELLED" or "CANCELED" or "VOID";
    }
}