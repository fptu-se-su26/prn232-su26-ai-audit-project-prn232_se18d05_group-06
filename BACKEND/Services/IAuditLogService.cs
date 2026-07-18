using BACKEND.DTOs;

namespace BACKEND.Services;

public interface IAuditLogService
{
    Task LogActionAsync(int? userId, string ipAddress, string action, string? tableName = null, string? recordId = null, string? oldValue = null, string? newValue = null);
    Task<List<AuditLogDto>> GetAuditLogsAsync(int? userId = null, string? action = null, string? tableName = null, DateTime? startDate = null, DateTime? endDate = null, int limit = 100);
}
