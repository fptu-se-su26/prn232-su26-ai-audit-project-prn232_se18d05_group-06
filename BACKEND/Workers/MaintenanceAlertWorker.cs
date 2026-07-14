using System;
using System.Data;
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
        _logger.LogInformation("MaintenanceAlertWorker starting — checking schema prerequisites.");

        // ── Schema guard ────────────────────────────────────────────────────────
        // If the required tables don't exist in the local database (e.g. during
        // development or when the maintenance module is not deployed), skip the
        // entire worker without spamming error logs on every tick.
        try
        {
            using var guardScope = _serviceProvider.CreateScope();
            var guardCtx = guardScope.ServiceProvider.GetRequiredService<SmartLogAiContext>();

            var tableCheckSql = @"
                SELECT COUNT(*) FROM (
                    SELECT 1 WHERE OBJECT_ID(N'dbo.MaintenanceSchedules', N'U') IS NOT NULL
                    UNION ALL
                    SELECT 1 WHERE OBJECT_ID(N'dbo.InspectionRecords',    N'U') IS NOT NULL
                ) t";

            // FormattableString overload — safe, no user input involved
            var existingCount = await guardCtx.Database
                .SqlQueryRaw<int>(tableCheckSql)
                .SingleAsync(stoppingToken);

            if (existingCount < 2)
            {
                _logger.LogWarning(
                    "MaintenanceAlertWorker: required tables (MaintenanceSchedules / InspectionRecords) " +
                    "are not present in the current database. Worker will remain idle. " +
                    "Deploy the maintenance module schema to enable this worker.");
                return; // exit ExecuteAsync — worker stays registered but does nothing
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "MaintenanceAlertWorker: schema existence check failed. Worker will remain idle.");
            return;
        }
        // ── End schema guard ─────────────────────────────────────────────────────

        _logger.LogInformation("MaintenanceAlertWorker: schema verified — starting schedule loop.");

        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("MaintenanceAlertWorker checking for due schedules and inspections at: {time}", DateTimeOffset.Now);

            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<SmartLogAiContext>();

                var hasMaintenanceSchedules = await TableExistsAsync(context, "MaintenanceSchedules", stoppingToken);
                var hasInspectionRecords = await TableExistsAsync(context, "InspectionRecords", stoppingToken);

                if (!hasMaintenanceSchedules && !hasInspectionRecords)
                {
                    _logger.LogWarning("Maintenance alert tables are not available yet. Skipping this worker cycle.");
                }
                else
                {
                    var today = DateTime.Now;

                    if (hasMaintenanceSchedules)
                    {
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
                    }

                    if (hasInspectionRecords)
                    {
                        var expiringInspections = await context.InspectionRecords
                            .Where(i => i.ExpiryDate <= today.AddDays(30) && i.ExpiryDate >= today)
                            .ToListAsync(stoppingToken);

                        foreach (var inspection in expiringInspections)
                        {
                            _logger.LogInformation("Inspection Record {Id} for Vehicle {VehicleId} is expiring soon ({ExpiryDate}).", inspection.Id, inspection.VehicleId, inspection.ExpiryDate);
                        }
                    }

                    await context.SaveChangesAsync(stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing MaintenanceAlertWorker.");
            }

            // Run once a day
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }

    private static async Task<bool> TableExistsAsync(SmartLogAiContext context, string tableName, CancellationToken cancellationToken)
    {
        var connection = context.Database.GetDbConnection();
        var shouldClose = connection.State == ConnectionState.Closed;

        if (shouldClose)
        {
            await connection.OpenAsync(cancellationToken);
        }

        try
        {
            await using var command = connection.CreateCommand();
            command.CommandText = "SELECT CASE WHEN OBJECT_ID(@tableName, N'U') IS NULL THEN CAST(0 AS int) ELSE CAST(1 AS int) END";

            var parameter = command.CreateParameter();
            parameter.ParameterName = "@tableName";
            parameter.Value = $"dbo.{tableName}";
            command.Parameters.Add(parameter);

            var result = await command.ExecuteScalarAsync(cancellationToken);
            return Convert.ToInt32(result) == 1;
        }
        finally
        {
            if (shouldClose)
            {
                await connection.CloseAsync();
            }
        }
    }
}
