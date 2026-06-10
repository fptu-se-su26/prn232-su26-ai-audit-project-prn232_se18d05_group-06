using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using BACKEND.Models;

namespace BACKEND.Services
{
    public class VehicleCleanupWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<VehicleCleanupWorker> _logger;

        public VehicleCleanupWorker(IServiceScopeFactory scopeFactory, ILogger<VehicleCleanupWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Vehicle Cleanup Worker is starting.");

            // Run every 1 hour
            using var timer = new PeriodicTimer(TimeSpan.FromHours(1));

            try
            {
                // Run an initial purge immediately on startup
                await PurgeExpiredVehiclesAsync();

                while (await timer.WaitForNextTickAsync(stoppingToken))
                {
                    await PurgeExpiredVehiclesAsync();
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Vehicle Cleanup Worker is stopping due to task cancellation.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred in Vehicle Cleanup Worker.");
            }
        }

        private async Task PurgeExpiredVehiclesAsync()
        {
            _logger.LogInformation("Running expired vehicles cleanup task...");

            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<SmartLogDbContext>();

            var now = DateTime.UtcNow;

            var expiredVehicles = await context.Vehicles
                .Where(v => v.Status == "PENDING" && v.VehicleModel == "TEMP_ALPR" && v.InsuranceExpiry < now)
                .ToListAsync();

            if (expiredVehicles.Any())
            {
                context.Vehicles.RemoveRange(expiredVehicles);
                await context.SaveChangesAsync();
                _logger.LogInformation($"Successfully purged {expiredVehicles.Count} expired pending ALPR vehicles.");
            }
            else
            {
                _logger.LogInformation("No expired pending ALPR vehicles found to purge.");
            }
        }
    }
}
