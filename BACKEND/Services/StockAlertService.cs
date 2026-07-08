using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Services
{
    public class StockAlertService : IStockAlertService
    {
        private const string LowStockType = "LOW_STOCK";
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

        public async Task<int> ScanAndNotifyAsync(CancellationToken cancellationToken = default)
        {
            var now = DateTime.Now;
            var debounceHours = await GetDebounceHoursAsync();

            // Tổng tồn kho hiện tại theo SKU.
            var quantities = await _context.Inventories
                .GroupBy(i => i.Skuid)
                .Select(g => new { Skuid = g.Key, TotalQty = g.Sum(x => x.Quantity) })
                .ToDictionaryAsync(x => x.Skuid, x => x.TotalQty, cancellationToken);

            // SKU có ngưỡng an toàn > 0.
            var skus = await _context.Skus
                .Where(s => (s.IsActive ?? true) && s.SafetyMinQty != null && s.SafetyMinQty > 0)
                .Select(s => new { s.Skuid, s.Skucode, s.ProductName, SafetyMinQty = s.SafetyMinQty!.Value })
                .ToListAsync(cancellationToken);

            int emailsSent = 0;

            foreach (var sku in skus)
            {
                var currentQty = quantities.TryGetValue(sku.Skuid, out var q) ? q : 0;
                if (currentQty > sku.SafetyMinQty)
                {
                    // Đủ tồn → đánh dấu cảnh báo cũ (nếu có) là đã xử lý.
                    var open = await _context.StockAlerts
                        .Where(a => a.Skuid == sku.Skuid && a.AlertType == LowStockType && (a.IsResolved == false || a.IsResolved == null))
                        .ToListAsync(cancellationToken);
                    foreach (var a in open) a.IsResolved = true;
                    continue;
                }

                // Tồn chạm/dưới ngưỡng → tìm cảnh báo đang mở gần nhất.
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

                // Debounce: chỉ gửi email khi chưa từng gửi hoặc đã qua NextAllowedAt.
                var canSend = existing.NextAllowedAt == null || now >= existing.NextAllowedAt;
                if (canSend)
                {
                    // Lấy email người quản lý hoặc email mặc định
                    var targetEmail = "tvan20152@gmail.com"; // Gửi về email của người quản lý kho
                    var sent = await SendAlertEmailAsync(sku.Skucode, sku.ProductName, currentQty, sku.SafetyMinQty, targetEmail);
                    if (sent)
                    {
                        existing.EmailSentAt = now;
                        existing.NextAllowedAt = now.AddHours(debounceHours);
                        emailsSent++;
                    }
                }
                else
                {
                    _logger.LogInformation(
                        "Bỏ qua email cảnh báo SKU {Sku} do debounce (lần gửi kế tiếp: {Next:o}).",
                        sku.Skucode, existing.NextAllowedAt);
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Quét tồn kho hoàn tất: {Count} email cảnh báo đã gửi.", emailsSent);
            return emailsSent;
        }

        public async Task<List<StockAlertDto>> GetActiveAlertsAsync()
        {
            var alerts = await _context.StockAlerts
                .Where(a => a.IsResolved == false || a.IsResolved == null)
                .Include(a => a.Sku).ThenInclude(s => s.Customer)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return alerts.Select(MapAlert).ToList();
        }

        public async Task<StockAlertSummaryDto> GetSummaryAsync()
        {
            var open = await _context.StockAlerts
                .Where(a => a.IsResolved == false || a.IsResolved == null)
                .Select(a => a.AlertType)
                .ToListAsync();

            return new StockAlertSummaryDto
            {
                LowStock = open.Count(t => t == LowStockType),
                ExpiringSoon = open.Count(t => t == "EXPIRY_SOON"),
                DeadStock = open.Count(t => t == "DEAD_STOCK"),
                Total = open.Count
            };
        }

        public async Task<bool> ResolveAlertAsync(int alertId)
        {
            var alert = await _context.StockAlerts.FindAsync(alertId);
            if (alert == null) return false;
            alert.IsResolved = true;
            await _context.SaveChangesAsync();
            return true;
        }

        // ---- helpers ----

        private async Task<int> GetDebounceHoursAsync()
        {
            var param = await _context.Aiparameters
                .FirstOrDefaultAsync(p => p.ParamKey == "STOCK_ALERT_DEBOUNCE_HOURS");
            if (param != null && int.TryParse(param.ParamValue, out var h) && h > 0)
                return h;
            return DefaultDebounceHours;
        }

        private async Task<bool> SendAlertEmailAsync(string? skuCode, string? productName, int currentQty, int threshold, string toEmail)
        {
            var subject = $"[CẢNH BÁO TỒN KHO] Sản phẩm {skuCode} sắp hết hàng";
            var body = $@"
                <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <h2 style='color: #d9534f;'>Cảnh báo tồn kho an toàn</h2>
                    <p>Kính gửi Quản lý Kho,</p>
                    <p>Hệ thống phát hiện sản phẩm sau đã chạm ngưỡng tồn kho an toàn:</p>
                    <table style='width: 100%; border-collapse: collapse; margin-top: 10px;'>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>SKU:</td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>{skuCode}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Tên sản phẩm:</td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>{productName}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Tồn kho hiện tại:</td>
                            <td style='padding: 8px; border: 1px solid #ddd; color: #d9534f; font-weight: bold;'>{currentQty}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Ngưỡng an toàn:</td>
                            <td style='padding: 8px; border: 1px solid #ddd;'>{threshold}</td>
                        </tr>
                    </table>
                    <p style='margin-top: 15px;'>Vui lòng kiểm tra và nhập thêm hàng.</p>
                    <p>Trân trọng,<br/><strong>Warehouse Management System</strong></p>
                    <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'/>
                    <p style='font-size: 12px; color: #999;'>Đây là email tự động từ hệ thống SmartLog AI. Vui lòng không phản hồi email này.</p>
                </div>";

            try
            {
                await _emailService.SendEmailAsync(toEmail, subject, body);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gửi email cảnh báo cho SKU {Sku}", skuCode);
                return false;
            }
        }

        private static StockAlertDto MapAlert(StockAlert a)
        {
            var threshold = a.ThresholdQty ?? 0;
            var current = a.CurrentQty ?? 0;
            var severity = (current == 0 || (threshold > 0 && current * 2 <= threshold))
                ? "CRITICAL"
                : "WARNING";

            return new StockAlertDto
            {
                AlertId = a.AlertId,
                Skuid = a.Skuid,
                Skucode = a.Sku?.Skucode,
                ProductName = a.Sku?.ProductName,
                CustomerName = a.Sku?.Customer?.CompanyName,
                AlertType = a.AlertType,
                CurrentQty = a.CurrentQty,
                ThresholdQty = a.ThresholdQty,
                EmailSentAt = a.EmailSentAt,
                NextAllowedAt = a.NextAllowedAt,
                IsResolved = a.IsResolved ?? false,
                CreatedAt = a.CreatedAt,
                Severity = severity
            };
        }
    }
}
