namespace BACKEND.Services;
public class VehicleCleanupWorker : BackgroundService {
    protected override Task ExecuteAsync(CancellationToken stoppingToken) => Task.CompletedTask;
}
