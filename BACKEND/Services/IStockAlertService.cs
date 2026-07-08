using BACKEND.DTOs;

namespace BACKEND.Services
{
    public interface IStockAlertService
    {
        /// <summary>
        /// Scans inventory, detects SKUs at or below their safety threshold, records alerts,
        /// and sends email notifications. Scheduled scans use debounce; manual scans can force resend.
        /// </summary>
        Task<int> ScanAndNotifyAsync(bool forceResend = false, string? recipientEmail = null, CancellationToken cancellationToken = default);

        Task<List<StockAlertDto>> GetActiveAlertsAsync();

        Task<StockAlertSummaryDto> GetSummaryAsync();

        Task<bool> ResolveAlertAsync(int alertId);
    }
}