using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Services;

public class AuditLogService : IAuditLogService
{
    private readonly SmartLogAiContext _context;

    public AuditLogService(SmartLogAiContext context)
    {
        _context = context;
    }

    public async Task LogActionAsync(int? userId, string ipAddress, string action, string? tableName = null, string? recordId = null, string? oldValue = null, string? newValue = null)
    {
        var auditLog = new AuditLog
        {
            UserId = userId,
            Ipaddress = ipAddress,
            Action = action,
            TableName = tableName,
            RecordId = recordId,
            OldValue = oldValue,
            NewValue = newValue,
            LoggedAt = DateTime.UtcNow
        };

        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();
    }

    public async Task<List<AuditLogDto>> GetAuditLogsAsync(int? userId = null, string? action = null, string? tableName = null, DateTime? startDate = null, DateTime? endDate = null, int limit = 100)
    {
        var query = _context.AuditLogs
            .Include(a => a.User)
            .AsQueryable();

        if (userId.HasValue)
        {
            query = query.Where(a => a.UserId == userId.Value);
        }

        if (!string.IsNullOrEmpty(action))
        {
            query = query.Where(a => a.Action.Contains(action));
        }

        if (!string.IsNullOrEmpty(tableName))
        {
            query = query.Where(a => a.TableName == tableName);
        }

        if (startDate.HasValue)
        {
            query = query.Where(a => a.LoggedAt >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(a => a.LoggedAt <= endDate.Value);
        }

        var logs = await query
            .OrderByDescending(a => a.LoggedAt)
            .Take(limit)
            .ToListAsync();

        return logs.Select(log => new AuditLogDto
        {
            LogId = log.LogId,
            UserId = log.UserId,
            UserName = log.User?.FullName,
            UserEmail = log.User?.Email,
            IpAddress = log.Ipaddress,
            Action = log.Action,
            TableName = log.TableName,
            RecordId = log.RecordId,
            OldValue = log.OldValue,
            NewValue = log.NewValue,
            LoggedAt = log.LoggedAt
        }).ToList();
    }
}
