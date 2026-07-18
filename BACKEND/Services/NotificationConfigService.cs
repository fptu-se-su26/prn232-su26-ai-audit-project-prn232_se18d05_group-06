using BACKEND.Models;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Services;

public class NotificationConfigService : INotificationConfigService
{
    private readonly SmartLogAiContext _context;

    public NotificationConfigService(SmartLogAiContext context)
    {
        _context = context;
    }

    public async Task<List<NotificationConfig>> GetAllConfigsAsync()
    {
        return await _context.NotificationConfigs
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<NotificationConfig?> GetConfigByIdAsync(int configId)
    {
        return await _context.NotificationConfigs
            .FirstOrDefaultAsync(c => c.ConfigId == configId);
    }

    public async Task<List<NotificationConfig>> GetConfigsByEventTypeAsync(string eventType)
    {
        return await _context.NotificationConfigs
            .Where(c => c.EventType == eventType)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<NotificationConfig> CreateConfigAsync(NotificationConfig config)
    {
        config.CreatedAt = DateTime.UtcNow;
        config.IsActive = config.IsActive ?? true;
        
        _context.NotificationConfigs.Add(config);
        await _context.SaveChangesAsync();
        
        return config;
    }

    public async Task<NotificationConfig?> UpdateConfigAsync(int configId, NotificationConfig config)
    {
        var existingConfig = await _context.NotificationConfigs
            .FirstOrDefaultAsync(c => c.ConfigId == configId);
        
        if (existingConfig == null)
            return null;
        
        existingConfig.EventType = config.EventType;
        existingConfig.Channel = config.Channel;
        existingConfig.Template = config.Template;
        existingConfig.IsActive = config.IsActive;
        
        await _context.SaveChangesAsync();
        
        return existingConfig;
    }

    public async Task<bool> DeleteConfigAsync(int configId)
    {
        var config = await _context.NotificationConfigs
            .FirstOrDefaultAsync(c => c.ConfigId == configId);
        
        if (config == null)
            return false;
        
        _context.NotificationConfigs.Remove(config);
        await _context.SaveChangesAsync();
        
        return true;
    }

    public async Task<bool> ToggleConfigAsync(int configId)
    {
        var config = await _context.NotificationConfigs
            .FirstOrDefaultAsync(c => c.ConfigId == configId);
        
        if (config == null)
            return false;
        
        config.IsActive = !config.IsActive;
        await _context.SaveChangesAsync();
        
        return true;
    }
}
