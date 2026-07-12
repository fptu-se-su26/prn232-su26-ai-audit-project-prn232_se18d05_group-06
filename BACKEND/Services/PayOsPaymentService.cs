using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;
using PayOS;
using PayOS.Models.V2.PaymentRequests;
using PayOS.Models.Webhooks;

namespace BACKEND.Services
{
    public class PayOsPaymentService : IPayOsPaymentService
    {
        private readonly SmartLogAiContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PayOsPaymentService> _logger;
        private readonly IPaymentService _paymentService;
        private readonly string? _clientId;
        private readonly string? _apiKey;
        private readonly string? _checksumKey;

        public PayOsPaymentService(
            SmartLogAiContext context,
            IConfiguration configuration,
            IPaymentService paymentService,
            ILogger<PayOsPaymentService> logger)
        {
            _context = context;
            _configuration = configuration;
            _paymentService = paymentService;
            _logger = logger;

            _clientId = _configuration["PayOS:ClientId"];
            _apiKey = _configuration["PayOS:ApiKey"];
            _checksumKey = _configuration["PayOS:ChecksumKey"];
        }

        public async Task<PayOsPaymentLinkResponseDto> CreatePaymentLinkAsync(CreatePayOsPaymentRequestDto request, int currentUserId)
        {
            var payOsClient = CreatePayOsClient();
            var order = await GetOwnedOrderAsync(request.OrderId, currentUserId);
            var originalAmount = ResolveOrderAmount(order);
            var voucher = await ResolveVoucherAsync(order.CustomerId, request.VoucherCode, originalAmount);
            var discountAmount = CalculateDiscount(originalAmount, voucher);
            var amount = Math.Max(1000m, decimal.Round(originalAmount - discountAmount, 0));
            var invoice = await EnsureInvoiceAsync(order, originalAmount, discountAmount, currentUserId);
            var payment = await EnsurePendingPaymentAsync(invoice, order.CustomerId, amount);
            var payOsOrderCode = GeneratePayOsOrderCode(order.OrderId);

            payment.PaymentCode = BuildPaymentCode(payOsOrderCode);
            payment.PaymentMethod = "PAYOS";
            payment.Status = "PENDING";
            payment.Amount = amount;
            payment.PaidAt = null;
            order.VoucherId = voucher?.VoucherId;
            order.DiscountAmount = discountAmount;
            order.EstimatedCost = originalAmount;
            order.FinalCost = amount;

            var frontendBaseUrl = _configuration["PayOS:FrontendBaseUrl"]?.TrimEnd('/') ?? "http://localhost:3000";
            var returnUrl = $"{frontendBaseUrl}/payment?orderId={order.OrderId}";
            var cancelUrl = $"{frontendBaseUrl}/";

            var paymentLink = await payOsClient.PaymentRequests.CreateAsync(new CreatePaymentLinkRequest
            {
                OrderCode = payOsOrderCode,
                Amount = Decimal.ToInt32(decimal.Round(amount, 0)),
                Description = $"SmartLog {order.OrderId}",
                ReturnUrl = returnUrl,
                CancelUrl = cancelUrl
            });

            payment.HashCode = paymentLink.PaymentLinkId;
            payment.ReceiptPath = paymentLink.CheckoutUrl;
            order.Status = "PENDING_PAYMENT";

            await _context.SaveChangesAsync();

            return new PayOsPaymentLinkResponseDto
            {
                OrderId = order.OrderId,
                OrderCode = order.OrderCode,
                PayOsOrderCode = payOsOrderCode,
                Amount = amount,
                OriginalAmount = originalAmount,
                DiscountAmount = discountAmount,
                VoucherCode = voucher?.VoucherCode,
                Status = payment.Status ?? "PENDING",
                CheckoutUrl = paymentLink.CheckoutUrl,
                QrCode = paymentLink.QrCode,
                PaymentLinkId = paymentLink.PaymentLinkId
            };
        }

        public async Task<List<PaymentVoucherDto>> GetAvailableVouchersAsync(int orderId, int currentUserId)
        {
            var order = await GetOwnedOrderAsync(orderId, currentUserId);
            await EnsureDemoVouchersAsync(order.CustomerId);

            var amount = ResolveOrderAmount(order);
            var today = DateOnly.FromDateTime(DateTime.Now);

            var vouchers = await _context.Vouchers
                .AsNoTracking()
                .Where(v => (v.CustomerId == order.CustomerId || v.CustomerId == null) &&
                            v.ValidFrom <= today &&
                            v.ValidTo >= today &&
                            v.IsUsed != true)
                .OrderByDescending(v => v.DiscountAmount ?? 0)
                .ThenByDescending(v => v.DiscountPct ?? 0)
                .ToListAsync();

            return vouchers.Select(v =>
            {
                var minOrderValue = v.MinOrderValue ?? 0;
                var eligible = amount >= minOrderValue;
                return new PaymentVoucherDto
                {
                    VoucherId = v.VoucherId,
                    VoucherCode = v.VoucherCode,
                    Title = BuildVoucherTitle(v),
                    Description = BuildVoucherDescription(v),
                    DiscountAmount = v.DiscountAmount ?? 0,
                    DiscountPct = v.DiscountPct ?? 0,
                    MinOrderValue = minOrderValue,
                    ValidTo = v.ValidTo,
                    IsEligible = eligible,
                    IneligibleReason = eligible ? string.Empty : $"Đơn tối thiểu {minOrderValue:N0} đ"
                };
            }).ToList();
        }

        public async Task<PayOsPaymentStatusDto> GetPaymentStatusAsync(int orderId, int currentUserId)
        {
            var order = await GetOwnedOrderAsync(orderId, currentUserId);
            var invoice = await _context.Invoices
                .Include(i => i.Payments)
                .OrderByDescending(i => i.InvoiceId)
                .FirstOrDefaultAsync(i => i.OrderId == order.OrderId);

            return ToStatusDto(order, invoice, invoice?.Payments.OrderByDescending(p => p.PaymentId).FirstOrDefault());
        }

        public async Task HandleWebhookAsync(Webhook webhook)
        {
            var payOsClient = CreatePayOsClient();
            var verifiedData = await payOsClient.Webhooks.VerifyAsync(webhook);
            var payOsOrderCode = Convert.ToInt64(verifiedData.OrderCode);
            var paymentCode = BuildPaymentCode(payOsOrderCode);
            var payment = await _context.Payments
                .Include(p => p.Invoice)
                    .ThenInclude(i => i.Order)
                .FirstOrDefaultAsync(p => p.PaymentCode == paymentCode);

            if (payment == null)
            {
                _logger.LogWarning("Received PayOS webhook for unknown orderCode {OrderCode}", payOsOrderCode);
                return;
            }

            var paid = string.Equals(verifiedData.Code, "00", StringComparison.OrdinalIgnoreCase);
            var shouldSendBill = ApplyPaymentResult(payment, paid, verifiedData.Reference, verifiedData.PaymentLinkId);
            await _context.SaveChangesAsync();

            if (shouldSendBill)
            {
                await ConfirmAndSendBillAsync(payment.PaymentId);
            }
        }

        public async Task<PayOsPaymentStatusDto> SyncReturnAsync(PayOsReturnSyncRequestDto request, int currentUserId)
        {
            var order = await GetOwnedOrderAsync(request.OrderId, currentUserId);
            var invoice = await _context.Invoices
                .Include(i => i.Order)
                .Include(i => i.Payments)
                .FirstOrDefaultAsync(i => i.OrderId == order.OrderId);

            if (invoice == null)
            {
                throw new KeyNotFoundException("Không tìm thấy hóa đơn của đơn hàng.");
            }

            var payment = invoice.Payments
                .OrderByDescending(p => p.PaymentId)
                .FirstOrDefault(p => p.PaymentMethod == "PAYOS");

            if (payment == null)
            {
                throw new KeyNotFoundException("Không tìm thấy giao dịch PayOS của đơn hàng.");
            }

            if (request.Cancel)
            {
                payment.Status = "CANCELLED";
                order.Status = "DRAFT";
            }
            else if (IsSuccessfulReturn(request))
            {
                var shouldSendBill = ApplyPaymentResult(payment, true, request.PayOsOrderCode?.ToString(), payment.HashCode);
                await _context.SaveChangesAsync();

                if (shouldSendBill)
                {
                    await ConfirmAndSendBillAsync(payment.PaymentId);
                }
            }

            await _context.SaveChangesAsync();
            return ToStatusDto(order, invoice, payment);
        }

        private async Task<ServiceOrder> GetOwnedOrderAsync(int orderId, int currentUserId)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == currentUserId);
            if (customer == null)
            {
                throw new UnauthorizedAccessException("User is not associated with any customer.");
            }

            var order = await _context.ServiceOrders
                .Include(o => o.Customer)
                .Include(o => o.Voucher)
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.CustomerId == customer.CustomerId);

            return order ?? throw new KeyNotFoundException("Không tìm thấy đơn hàng.");
        }

        private async Task<Invoice> EnsureInvoiceAsync(ServiceOrder order, decimal originalAmount, decimal discountAmount, int currentUserId)
        {
            var invoice = await _context.Invoices
                .OrderByDescending(i => i.InvoiceId)
                .FirstOrDefaultAsync(i => i.OrderId == order.OrderId);

            if (invoice != null)
            {
                invoice.SubTotal = originalAmount;
                invoice.DiscountAmt = discountAmount;
                invoice.Vatrate = 0;
                invoice.Status = invoice.Status == "PAID" ? "PAID" : "PENDING";
                return invoice;
            }

            invoice = new Invoice
            {
                InvoiceNo = BuildInvoiceNo(order.OrderId),
                OrderId = order.OrderId,
                CustomerId = order.CustomerId,
                IssueDate = DateOnly.FromDateTime(DateTime.Now),
                DueDate = DateOnly.FromDateTime(DateTime.Now.AddDays(3)),
                SubTotal = originalAmount,
                DiscountAmt = discountAmount,
                Vatrate = 0,
                PaidAmount = 0,
                Status = "PENDING",
                DigitalSigned = false,
                CreatedBy = currentUserId,
                CreatedAt = DateTime.Now
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();
            return invoice;
        }

        private async Task<Payment> EnsurePendingPaymentAsync(Invoice invoice, int customerId, decimal amount)
        {
            var payment = await _context.Payments
                .OrderByDescending(p => p.PaymentId)
                .FirstOrDefaultAsync(p => p.InvoiceId == invoice.InvoiceId && p.PaymentMethod == "PAYOS" && p.Status != "CONFIRMED" && p.Status != "PAID");

            if (payment != null)
            {
                return payment;
            }

            payment = new Payment
            {
                PaymentCode = BuildPaymentCode(GeneratePayOsOrderCode(invoice.OrderId)),
                InvoiceId = invoice.InvoiceId,
                CustomerId = customerId,
                Amount = amount,
                PaymentMethod = "PAYOS",
                Status = "PENDING"
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();
            return payment;
        }

        private static decimal ResolveOrderAmount(ServiceOrder order)
        {
            var amount = order.EstimatedCost ?? order.FinalCost;
            if (amount.HasValue && amount.Value > 0)
            {
                return decimal.Round(amount.Value, 0);
            }

            var weight = order.TotalWeightKg ?? 1;
            var cbm = order.TotalCbm ?? 0;
            var fallback = 30000m + (weight * 5000m) + (cbm * 50000m);
            return Math.Max(10000m, decimal.Round(fallback / 1000m, 0) * 1000m);
        }

        private static bool ApplyPaymentResult(Payment payment, bool paid, string? bankReference, string? paymentLinkId)
        {
            if (!paid)
            {
                payment.Status = "FAILED";
                return false;
            }

            var alreadyConfirmed = string.Equals(payment.Status, "CONFIRMED", StringComparison.OrdinalIgnoreCase)
                || string.Equals(payment.Status, "PAID", StringComparison.OrdinalIgnoreCase);

            payment.Status = "CONFIRMED";
            payment.PaidAt = DateTime.Now;
            payment.BankTxnRef = bankReference;
            payment.HashCode = paymentLinkId ?? payment.HashCode;

            payment.Invoice.PaidAmount = payment.Amount;
            payment.Invoice.Status = "PAID";
            if (payment.Invoice.Order != null)
            {
                payment.Invoice.Order.Status = "CONFIRMED";
                payment.Invoice.Order.ConfirmedAt ??= DateTime.Now;
            }

            return !alreadyConfirmed;
        }

        private async Task ConfirmAndSendBillAsync(int paymentId)
        {
            try
            {
                await _paymentService.ConfirmExistingPaymentAsync(paymentId, null, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "PayOS payment was confirmed but invoice PDF email failed for PaymentId {PaymentId}.", paymentId);
            }
        }

        private static PayOsPaymentStatusDto ToStatusDto(ServiceOrder order, Invoice? invoice, Payment? payment)
        {
            var invoiceAmount = invoice == null
                ? (decimal?)null
                : Math.Max(0m, invoice.SubTotal - (invoice.DiscountAmt ?? 0m));

            return new PayOsPaymentStatusDto
            {
                OrderId = order.OrderId,
                OrderCode = order.OrderCode,
                Amount = payment?.Amount ?? invoiceAmount ?? order.FinalCost ?? 0,
                OriginalAmount = invoice?.SubTotal ?? order.EstimatedCost ?? order.FinalCost ?? 0,
                DiscountAmount = invoice?.DiscountAmt ?? order.DiscountAmount ?? 0,
                VoucherCode = order.Voucher?.VoucherCode,
                OrderStatus = order.Status ?? "UNKNOWN",
                InvoiceStatus = invoice?.Status ?? "NONE",
                PaymentStatus = payment?.Status ?? "NONE",
                CheckoutUrl = payment?.ReceiptPath,
                PaymentLinkId = payment?.HashCode,
                PaidAt = payment?.PaidAt
            };
        }

        private async Task<Voucher?> ResolveVoucherAsync(int customerId, string? voucherCode, decimal orderAmount)
        {
            if (string.IsNullOrWhiteSpace(voucherCode))
            {
                return null;
            }

            var today = DateOnly.FromDateTime(DateTime.Now);
            var normalizedCode = voucherCode.Trim();
            var voucher = await _context.Vouchers
                .FirstOrDefaultAsync(v => v.VoucherCode == normalizedCode &&
                                          (v.CustomerId == customerId || v.CustomerId == null) &&
                                          v.ValidFrom <= today &&
                                          v.ValidTo >= today &&
                                          v.IsUsed != true);

            if (voucher == null)
            {
                throw new InvalidOperationException("Voucher không hợp lệ hoặc đã hết hạn.");
            }

            if (orderAmount < (voucher.MinOrderValue ?? 0))
            {
                throw new InvalidOperationException($"Voucher chỉ áp dụng cho đơn từ {(voucher.MinOrderValue ?? 0):N0} đ.");
            }

            return voucher;
        }

        private async Task EnsureDemoVouchersAsync(int customerId)
        {
            var hasActiveVoucher = await _context.Vouchers.AnyAsync(v => v.CustomerId == customerId && v.IsUsed != true);
            if (hasActiveVoucher)
            {
                return;
            }

            var today = DateOnly.FromDateTime(DateTime.Now);
            var suffix = $"{customerId}{DateTime.Now:MMdd}";
            _context.Vouchers.AddRange(
                new Voucher
                {
                    VoucherCode = $"SLWELCOME{suffix}",
                    CustomerId = customerId,
                    DiscountPct = 5,
                    DiscountAmount = 0,
                    MinOrderValue = 500000,
                    ValidFrom = today,
                    ValidTo = today.AddMonths(1),
                    IsUsed = false,
                    CreatedAt = DateTime.Now
                },
                new Voucher
                {
                    VoucherCode = $"SLFAST{suffix}",
                    CustomerId = customerId,
                    DiscountPct = 0,
                    DiscountAmount = 150000,
                    MinOrderValue = 1000000,
                    ValidFrom = today,
                    ValidTo = today.AddMonths(1),
                    IsUsed = false,
                    CreatedAt = DateTime.Now
                },
                new Voucher
                {
                    VoucherCode = $"SLVIP{suffix}",
                    CustomerId = customerId,
                    DiscountPct = 10,
                    DiscountAmount = 0,
                    MinOrderValue = 3000000,
                    ValidFrom = today,
                    ValidTo = today.AddMonths(1),
                    IsUsed = false,
                    CreatedAt = DateTime.Now
                });

            await _context.SaveChangesAsync();
        }

        private static decimal CalculateDiscount(decimal amount, Voucher? voucher)
        {
            if (voucher == null)
            {
                return 0;
            }

            var percentDiscount = amount * ((voucher.DiscountPct ?? 0) / 100m);
            var fixedDiscount = voucher.DiscountAmount ?? 0;
            return decimal.Round(Math.Max(percentDiscount, fixedDiscount), 0);
        }

        private static string BuildVoucherTitle(Voucher voucher)
        {
            if ((voucher.DiscountPct ?? 0) > 0)
            {
                return $"Giảm {(voucher.DiscountPct ?? 0):0.#}%";
            }

            return $"Giảm {(voucher.DiscountAmount ?? 0):N0} đ";
        }

        private static string BuildVoucherDescription(Voucher voucher)
        {
            var minOrderValue = voucher.MinOrderValue ?? 0;
            return minOrderValue > 0
                ? $"Áp dụng cho đơn từ {minOrderValue:N0} đ"
                : "Áp dụng cho mọi đơn hàng";
        }

        private static bool IsSuccessfulReturn(PayOsReturnSyncRequestDto request)
        {
            return string.Equals(request.Code, "00", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(request.Status, "PAID", StringComparison.OrdinalIgnoreCase);
        }

        private static string BuildInvoiceNo(int orderId)
        {
            var invoiceNo = $"INV{DateTime.Now:yyyyMMddHHmmss}{orderId:D6}";
            return invoiceNo.Length > 30 ? invoiceNo[^30..] : invoiceNo;
        }

        private static long GeneratePayOsOrderCode(int orderId)
        {
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            return long.Parse($"{timestamp}{Math.Abs(orderId % 100000):D5}");
        }

        private static string BuildPaymentCode(long payOsOrderCode)
        {
            var paymentCode = $"PAY{payOsOrderCode}";
            return paymentCode[..Math.Min(30, paymentCode.Length)];
        }

        private static long? ExtractPayOsOrderCode(string? paymentCode)
        {
            if (string.IsNullOrWhiteSpace(paymentCode) || !paymentCode.StartsWith("PAY", StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            return long.TryParse(paymentCode[3..], out var value) ? value : null;
        }

        private static bool IsMissingCredential(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ||
                   value.StartsWith("your_", StringComparison.OrdinalIgnoreCase);
        }

        private PayOSClient CreatePayOsClient()
        {
            if (IsMissingCredential(_clientId) ||
                IsMissingCredential(_apiKey) ||
                IsMissingCredential(_checksumKey))
            {
                throw new InvalidOperationException("PayOS chưa được cấu hình. Vui lòng nhập PayOS:ClientId, PayOS:ApiKey và PayOS:ChecksumKey trong appsettings.json.");
            }

            return new PayOSClient(new PayOSOptions
            {
                ClientId = _clientId!,
                ApiKey = _apiKey!,
                ChecksumKey = _checksumKey!
            });
        }
    }
}
