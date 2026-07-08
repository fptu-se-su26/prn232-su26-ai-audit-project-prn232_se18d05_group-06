namespace BACKEND.Services;

public class OverstayAlertWorker : BackgroundService
{
    private readonly ILogger<OverstayAlertWorker> _logger;
    private readonly IServiceProvider _services;

    public OverstayAlertWorker(ILogger<OverstayAlertWorker> logger, IServiceProvider services)
    {
        _logger = logger;
        _services = services;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _services.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<IOverstayAlertService>();
                await service.CheckAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to scan UC023 overstay alerts.");
            }

            await Task.Delay(TimeSpan.FromSeconds(60), stoppingToken);
        }
    }
}
