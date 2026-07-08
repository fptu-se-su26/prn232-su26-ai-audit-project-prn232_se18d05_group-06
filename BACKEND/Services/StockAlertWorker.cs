namespace BACKEND.Services
{
    /// <summary>
    /// Quét tồn kho định kỳ, tạo cảnh báo khi SKU chạm ngưỡng tối thiểu
    /// và gửi email qua StockAlertService với cơ chế debounce 12 giờ.
    /// Chu kỳ mặc định là 30 phút, có thể cấu hình bằng AIParameters.STOCK_SCAN_INTERVAL_MINUTES.
    /// </summary>
    public class StockAlertWorker : BackgroundService
    {
        private const int DefaultIntervalMinutes = 30;

        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<StockAlertWorker> _logger;

        public StockAlertWorker(IServiceProvider serviceProvider, ILogger<StockAlertWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("StockAlertWorker started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                var intervalMinutes = DefaultIntervalMinutes;

                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var alertService = scope.ServiceProvider.GetRequiredService<IStockAlertService>();
                    await alertService.ScanAndNotifyAsync(cancellationToken: stoppingToken);

                    intervalMinutes = await GetIntervalMinutesAsync(scope, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Stock alert scheduled scan failed.");
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

            _logger.LogInformation("StockAlertWorker stopped.");
        }

        private static async Task<int> GetIntervalMinutesAsync(IServiceScope scope, CancellationToken cancellationToken)
        {
            var db = scope.ServiceProvider.GetRequiredService<Models.SmartLogAiContext>();
            var param = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions
                .FirstOrDefaultAsync(db.Aiparameters, p => p.ParamKey == "STOCK_SCAN_INTERVAL_MINUTES", cancellationToken);

            if (param != null && int.TryParse(param.ParamValue, out var minutes) && minutes > 0)
            {
                return minutes;
            }

            return DefaultIntervalMinutes;
        }
    }
}