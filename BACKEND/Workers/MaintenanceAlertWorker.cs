using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BACKEND.Workers;

public class MaintenanceAlertWorker : BackgroundService
{
    private readonly ILogger<MaintenanceAlertWorker> _logger;
    private readonly IServiceProvider _serviceProvider;

    public MaintenanceAlertWorker(ILogger<MaintenanceAlertWorker> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Maintenance Alert Worker running.");

        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Maintenance Alert Worker checking for due schedules and inspections at: {time}", DateTimeOffset.Now);

            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<SmartLogAiContext>();

                    // 1. Check for Maintenance Schedules that are due in 7 days or overdue
                    var today = DateTime.Now;
                    var upcomingSchedules = await context.MaintenanceSchedules
                        .Where(s => s.Status == "PENDING" && s.DueDate <= today.AddDays(7))
                        .ToListAsync(stoppingToken);

                    foreach (var schedule in upcomingSchedules)
                    {
                        if (schedule.DueDate < today)
                        {
                            schedule.Status = "OVERDUE";
                            _logger.LogWarning("Maintenance Schedule {Id} for Vehicle {VehicleId} is OVERDUE.", schedule.Id, schedule.VehicleId);
                        }
                        else
                        {
                            _logger.LogInformation("Maintenance Schedule {Id} for Vehicle {VehicleId} is due soon ({DueDate}).", schedule.Id, schedule.VehicleId, schedule.DueDate);
                        }
                    }

                    // 2. Check for Inspection Records expiring in 30 days
                    var expiringInspections = await context.InspectionRecords
                        .Where(i => i.ExpiryDate <= today.AddDays(30) && i.ExpiryDate >= today)
                        .ToListAsync(stoppingToken);

                    foreach (var inspection in expiringInspections)
                    {
                        _logger.LogInformation("Inspection Record {Id} for Vehicle {VehicleId} is expiring soon ({ExpiryDate}).", inspection.Id, inspection.VehicleId, inspection.ExpiryDate);
                    }

                    await context.SaveChangesAsync(stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing Maintenance Alert Worker.");
            }

            // Run once a day (24 hours = 24 * 60 * 60 * 1000 ms)
            // For demonstration/testing, you might want to change this to TimeSpan.FromMinutes(5) or similar.
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}
