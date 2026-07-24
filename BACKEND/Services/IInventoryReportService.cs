using BACKEND.DTOs;

namespace BACKEND.Services;

public interface IInventoryReportService
{
    Task<DeadStockPagedResultDto> GetDeadStockAsync(FilterDeadStockDto filter);
    Task<DeadStockPagedResultDto> GetExpiryStockAsync(FilterDeadStockDto filter);
    Task<DeadStockSummaryDto> GetSummaryAsync();
    Task<int> ScanAndCreateAlertsAsync(bool forceResend = false, CancellationToken cancellationToken = default);
    Task<List<DeadStockDto>> GetDeadAndExpiryStockAsync(string? alertType = null);
}
