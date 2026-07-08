using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Services
{
    public class StockAlertService : IStockAlertService
    {
        private const string LowStockType = "LOW_STOCK";
        private const string DefaultAlertEmail = "tungtvde180109@fpt.edu.vn";
        private const int DefaultDebounceHours = 12;

        private readonly SmartLogAiContext _context;
        private readonly ILogger<StockAlertService> _logger;
        private readonly IEmailService _emailService;

        public StockAlertService(SmartLogAiContext context, ILogger<StockAlertService> logger, IEmailService emailService)
        {
            _context = context;
            _logger = logger;
            _emailService = emailService;
        }

        public async Task<int> ScanAndNotifyAsync(bool forceResend = false, string? recipientEmail = null, CancellationToken cancellationToken = default)
        {
            var now = DateTime.Now;
            var debounceHours = await GetDebounceHoursAsync(cancellationToken);
            var targetEmail = ResolveRecipientEmail(recipientEmail);

            var quantities = await _context.Inventories
                .AsNoTracking()
                .GroupBy(i => i.Skuid)
                .Select(g => new { Skuid = g.Key, TotalQty = g.Sum(x => x.Quantity) })
                .ToDictionaryAsync(x => x.Skuid, x => x.TotalQty, cancellationToken);

            var skus = await _context.Skus
                .AsNoTracking()
                .Where(s => (s.IsActive ?? true) && s.SafetyMinQty != null && s.SafetyMinQty > 0)
                .Select(s => new { s.Skuid, s.Skucode, s.ProductName, SafetyMinQty = s.SafetyMinQty!.Value })
                .ToListAsync(cancellationToken);

            var emailsSent = 0;

            foreach (var sku in skus)
            {
                var currentQty = quantities.TryGetValue(sku.Skuid, out var qty) ? qty : 0;

                if (currentQty > sku.SafetyMinQty)
                {
                    var openAlerts = await _context.StockAlerts
                        .Where(a => a.Skuid == sku.Skuid && a.AlertType == LowStockType && (a.IsResolved == false || a.IsResolved == null))
                        .ToListAsync(cancellationToken);

                    foreach (var alert in openAlerts)
                    {
                        alert.IsResolved = true;
                    }

                    continue;
                }

                var existing = await _context.StockAlerts
                    .Where(a => a.Skuid == sku.Skuid && a.AlertType == LowStockType && (a.IsResolved == false || a.IsResolved == null))
                    .OrderByDescending(a => a.CreatedAt)
                    .FirstOrDefaultAsync(cancellationToken);

                if (existing == null)
                {
                    existing = new StockAlert
                    {
                        Skuid = sku.Skuid,
                        AlertType = LowStockType,
                        CurrentQty = currentQty,
                        ThresholdQty = sku.SafetyMinQty,
                        IsResolved = false,
                        CreatedAt = now
                    };
                    _context.StockAlerts.Add(existing);
                }
                else
                {
                    existing.CurrentQty = currentQty;
                    existing.ThresholdQty = sku.SafetyMinQty;
                }

                var canSend = forceResend || existing.NextAllowedAt == null || now >= existing.NextAllowedAt;
                if (!canSend)
                {
                    _logger.LogInformation("Skip stock alert email for SKU {Sku} until {Next:o}.", sku.Skucode, existing.NextAllowedAt);
                    continue;
                }

                var sent = await SendAlertEmailAsync(
                    sku.Skucode,
                    sku.ProductName,
                    currentQty,
                    sku.SafetyMinQty,
                    targetEmail);

                if (sent)
                {
                    existing.EmailSentAt = now;
                    existing.NextAllowedAt = now.AddHours(debounceHours);
                    emailsSent++;
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation(
                "Stock scan finished: {Count} email(s) sent to {Email}. ForceResend={ForceResend}.",
                emailsSent,
                targetEmail,
                forceResend);
            return emailsSent;
        }

        public async Task<List<StockAlertDto>> GetActiveAlertsAsync()
        {
            return await _context.StockAlerts
                .AsNoTracking()
                .Where(a => a.IsResolved == false || a.IsResolved == null)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new StockAlertDto
                {
                    AlertId = a.AlertId,
                    Skuid = a.Skuid,
                    Skucode = a.Sku != null ? a.Sku.Skucode : null,
                    ProductName = a.Sku != null ? a.Sku.ProductName : null,
                    CustomerName = a.Sku != null && a.Sku.Customer != null ? a.Sku.Customer.CompanyName : null,
                    AlertType = a.AlertType,
                    CurrentQty = a.CurrentQty,
                    ThresholdQty = a.ThresholdQty,
                    EmailSentAt = a.EmailSentAt,
                    NextAllowedAt = a.NextAllowedAt,
                    IsResolved = a.IsResolved ?? false,
                    CreatedAt = a.CreatedAt,
                    Severity = ((a.CurrentQty ?? 0) == 0 || ((a.ThresholdQty ?? 0) > 0 && (a.CurrentQty ?? 0) * 2 <= (a.ThresholdQty ?? 0)))
                        ? "CRITICAL"
                        : "WARNING"
                })
                .ToListAsync();
        }

        public async Task<StockAlertSummaryDto> GetSummaryAsync()
        {
            var alertTypes = await _context.StockAlerts
                .AsNoTracking()
                .Where(a => a.IsResolved == false || a.IsResolved == null)
                .Select(a => a.AlertType)
                .ToListAsync();

            return new StockAlertSummaryDto
            {
                LowStock = alertTypes.Count(t => t == LowStockType),
                ExpiringSoon = alertTypes.Count(t => t == "EXPIRY_SOON"),
                DeadStock = alertTypes.Count(t => t == "DEAD_STOCK"),
                Total = alertTypes.Count
            };
        }

        public async Task<bool> ResolveAlertAsync(int alertId)
        {
            var alert = await _context.StockAlerts.FindAsync(alertId);
            if (alert == null)
            {
                return false;
            }

            alert.IsResolved = true;
            await _context.SaveChangesAsync();
            return true;
        }


        private static string ResolveRecipientEmail(string? recipientEmail)
        {
            return string.IsNullOrWhiteSpace(recipientEmail)
                ? DefaultAlertEmail
                : recipientEmail.Trim();
        }
        private async Task<int> GetDebounceHoursAsync(CancellationToken cancellationToken)
        {
            var param = await _context.Aiparameters
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.ParamKey == "STOCK_ALERT_DEBOUNCE_HOURS", cancellationToken);

            if (param != null && int.TryParse(param.ParamValue, out var hours) && hours > 0)
            {
                return hours;
            }

            return DefaultDebounceHours;
        }

        private async Task<bool> SendAlertEmailAsync(string? skuCode, string? productName, int currentQty, int threshold, string toEmail)
        {
            var subject = $"[CẢNH BÁO TỒN KHO] SKU {skuCode} đã chạm ngưỡng tối thiểu";
            var body = $@"
                <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <h2 style='color: #d9534f;'>Cảnh báo tồn kho an toàn</h2>
                    <p>SmartLog AI phát hiện SKU này đã chạm hoặc thấp hơn ngưỡng tồn kho tối thiểu đã cấu hình.</p>
                    <table style='width: 100%; border-collapse: collapse; margin-top: 10px;'>
                        <tr><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>SKU</td><td style='padding: 8px; border: 1px solid #ddd;'>{skuCode}</td></tr>
                        <tr><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Sản phẩm</td><td style='padding: 8px; border: 1px solid #ddd;'>{productName}</td></tr>
                        <tr><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Tồn kho hiện tại</td><td style='padding: 8px; border: 1px solid #ddd; color: #d9534f; font-weight: bold;'>{currentQty}</td></tr>
                        <tr><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Ngưỡng tối thiểu</td><td style='padding: 8px; border: 1px solid #ddd;'>{threshold}</td></tr>
                    </table>
                    <p style='margin-top: 15px;'>Vui lòng kiểm tra dashboard kho và tạo kế hoạch bổ sung hàng nếu cần.</p>
                </div>";

            try
            {
                await _emailService.SendEmailAsync(toEmail, subject, body);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send stock alert email for SKU {Sku}.", skuCode);
                return false;
            }
        }
    }
}