using BACKEND.DTOs;
using BACKEND.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AuditLogController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<ActionResult<List<AuditLogDto>>> GetAuditLogs(
        [FromQuery] int? userId = null,
        [FromQuery] string? action = null,
        [FromQuery] string? tableName = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int limit = 100)
    {
        var logs = await _auditLogService.GetAuditLogsAsync(userId, action, tableName, startDate, endDate, limit);
        return Ok(logs);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult> LogAction([FromBody] AuditLogRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        await _auditLogService.LogActionAsync(
            request.UserId,
            ipAddress,
            request.Action,
            request.TableName,
            request.RecordId,
            request.OldValue,
            request.NewValue
        );
        return Ok();
    }
}

public class AuditLogRequest
{
    public int? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? TableName { get; set; }
    public string? RecordId { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
}
