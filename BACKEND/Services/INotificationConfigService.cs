using BACKEND.Models;

namespace BACKEND.Services;

public interface INotificationConfigService
{
    Task<List<NotificationConfig>> GetAllConfigsAsync();
    Task<NotificationConfig?> GetConfigByIdAsync(int configId);
    Task<List<NotificationConfig>> GetConfigsByEventTypeAsync(string eventType);
    Task<NotificationConfig> CreateConfigAsync(NotificationConfig config);
    Task<NotificationConfig?> UpdateConfigAsync(int configId, NotificationConfig config);
    Task<bool> DeleteConfigAsync(int configId);
    Task<bool> ToggleConfigAsync(int configId);
}
