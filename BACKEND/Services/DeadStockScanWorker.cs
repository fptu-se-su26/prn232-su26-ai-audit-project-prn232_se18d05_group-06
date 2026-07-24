namespace BACKEND.Services;

/// <summary>
/// Background worker quét định kỳ để phát hiện hàng tồn lâu (Dead Stock)
/// và hàng sắp hết hạn (Expiry Soon).
/// Chu kỳ mặc định là 60 phút.
/// </summary>
public class DeadStockScanWorker : BackgroundService
{
    private const int DefaultIntervalMinutes = 60;

    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DeadStockScanWorker> _logger;

    public DeadStockScanWorker(IServiceProvider serviceProvider, ILogger<DeadStockScanWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DeadStockScanWorker started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            var intervalMinutes = DefaultIntervalMinutes;

            try
            {
                using var scope = _serviceProvider.CreateScope();
                var reportService = scope.ServiceProvider.GetRequiredService<IInventoryReportService>();

                _logger.LogInformation("DeadStockScanWorker: Starting scan...");
                var alertsCreated = await reportService.ScanAndCreateAlertsAsync(
                    forceResend: false,
                    cancellationToken: stoppingToken);

                _logger.LogInformation(
                    "DeadStockScanWorker: Scan completed. {Count} alerts created/updated.",
                    alertsCreated);

                intervalMinutes = await GetIntervalMinutesAsync(scope, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DeadStockScanWorker: Scan failed.");
            }

            try
            {
                await Task.Delay(TimeSpan.FromMinutes(intervalMinutes), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }

        _logger.LogInformation("DeadStockScanWorker stopped.");
    }

    private static async Task<int> GetIntervalMinutesAsync(IServiceScope scope, CancellationToken cancellationToken)
    {
        var db = scope.ServiceProvider.GetRequiredService<Models.SmartLogAiContext>();
        var param = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions
            .FirstOrDefaultAsync(db.Aiparameters, p => p.ParamKey == "DEAD_STOCK_SCAN_INTERVAL_MINUTES", cancellationToken);

        if (param != null && int.TryParse(param.ParamValue, out var minutes) && minutes > 0)
        {
            return minutes;
        }

        return DefaultIntervalMinutes;
    }
}
