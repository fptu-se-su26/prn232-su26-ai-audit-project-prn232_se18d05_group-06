using BACKEND.Models;
using BACKEND.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers;

[ApiController]
[Route("api/notification-config")]
[Authorize(Roles = "ADMIN")]
public class NotificationConfigController : ControllerBase
{
    private readonly INotificationConfigService _notificationConfigService;

    public NotificationConfigController(INotificationConfigService notificationConfigService)
    {
        _notificationConfigService = notificationConfigService;
    }

    [HttpGet]
    public async Task<ActionResult<List<NotificationConfig>>> GetAllConfigs()
    {
        var configs = await _notificationConfigService.GetAllConfigsAsync();
        return Ok(configs);
    }

    [HttpGet("{configId}")]
    public async Task<ActionResult<NotificationConfig>> GetConfigById(int configId)
    {
        var config = await _notificationConfigService.GetConfigByIdAsync(configId);
        if (config == null)
            return NotFound();
        return Ok(config);
    }

    [HttpGet("by-event-type/{eventType}")]
    public async Task<ActionResult<List<NotificationConfig>>> GetConfigsByEventType(string eventType)
    {
        var configs = await _notificationConfigService.GetConfigsByEventTypeAsync(eventType);
        return Ok(configs);
    }

    [HttpPost]
    public async Task<ActionResult<NotificationConfig>> CreateConfig([FromBody] NotificationConfig config)
    {
        var createdConfig = await _notificationConfigService.CreateConfigAsync(config);
        return CreatedAtAction(nameof(GetConfigById), new { configId = createdConfig.ConfigId }, createdConfig);
    }

    [HttpPut("{configId}")]
    public async Task<ActionResult<NotificationConfig>> UpdateConfig(int configId, [FromBody] NotificationConfig config)
    {
        var updatedConfig = await _notificationConfigService.UpdateConfigAsync(configId, config);
        if (updatedConfig == null)
            return NotFound();
        return Ok(updatedConfig);
    }

    [HttpDelete("{configId}")]
    public async Task<ActionResult> DeleteConfig(int configId)
    {
        var result = await _notificationConfigService.DeleteConfigAsync(configId);
        if (!result)
            return NotFound();
        return NoContent();
    }

    [HttpPatch("{configId}/toggle")]
    public async Task<ActionResult> ToggleConfig(int configId)
    {
        var result = await _notificationConfigService.ToggleConfigAsync(configId);
        if (!result)
            return NotFound();
        return Ok();
    }
}
