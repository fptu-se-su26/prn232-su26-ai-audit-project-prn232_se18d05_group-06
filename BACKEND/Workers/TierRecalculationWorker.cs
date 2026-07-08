using System;
using System.Threading;
using System.Threading.Tasks;
using BACKEND.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BACKEND.Workers;

public class TierRecalculationWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TierRecalculationWorker> _logger;

    public TierRecalculationWorker(IServiceProvider serviceProvider, ILogger<TierRecalculationWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Tier Recalculation Worker running.");

        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Tier Recalculation Worker starting batch update at: {time}", DateTimeOffset.Now);

            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var customerTierService = scope.ServiceProvider.GetRequiredService<ICustomerTierService>();
                    await customerTierService.UpdateAllCustomerTiersAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing Tier Recalculation Worker.");
            }

            // Run once a day. For testing/demo purposes, we could run more frequently.
            // Using 24 hours as the default interval.
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}
