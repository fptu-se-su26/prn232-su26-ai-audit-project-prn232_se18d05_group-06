using BACKEND.DTOs;

namespace BACKEND.Services
{
    public interface IStockAlertService
    {
        /// <summary>
        /// Scans inventory, detects SKUs at/below their safety threshold, records alerts
        /// and sends (mock) email notifications applying the debounce window. Returns the
        /// number of alerts for which an email was sent in this run.
        /// </summary>
        Task<int> ScanAndNotifyAsync(CancellationToken cancellationToken = default);

        Task<List<StockAlertDto>> GetActiveAlertsAsync();

        Task<StockAlertSummaryDto> GetSummaryAsync();

        Task<bool> ResolveAlertAsync(int alertId);
    }
}
