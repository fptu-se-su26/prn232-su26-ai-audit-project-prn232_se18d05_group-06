namespace BACKEND.Services
{
    /// <summary>
    /// UC006: quét ngầm tồn kho định kỳ (mặc định mỗi 30 phút), phát hiện SKU chạm ngưỡng
    /// an toàn và gửi email cảnh báo (áp dụng debounce 12h trong StockAlertService).
    /// Chu kỳ quét đọc từ AIParameters key STOCK_SCAN_INTERVAL_MINUTES.
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
            _logger.LogInformation("StockAlertWorker đã khởi động.");

            while (!stoppingToken.IsCancellationRequested)
            {
                var intervalMinutes = DefaultIntervalMinutes;
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var alertService = scope.ServiceProvider.GetRequiredService<IStockAlertService>();
                    await alertService.ScanAndNotifyAsync(stoppingToken);

                    intervalMinutes = await GetIntervalMinutesAsync(scope, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi quét tồn kho (StockAlertWorker).");
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

            _logger.LogInformation("StockAlertWorker đã dừng.");
        }

        private static async Task<int> GetIntervalMinutesAsync(IServiceScope scope, CancellationToken ct)
        {
            var db = scope.ServiceProvider.GetRequiredService<Models.SmartLogAiContext>();
            var param = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions
                .FirstOrDefaultAsync(db.Aiparameters, p => p.ParamKey == "STOCK_SCAN_INTERVAL_MINUTES", ct);
            if (param != null && int.TryParse(param.ParamValue, out var m) && m > 0)
                return m;
            return DefaultIntervalMinutes;
        }
    }
}
