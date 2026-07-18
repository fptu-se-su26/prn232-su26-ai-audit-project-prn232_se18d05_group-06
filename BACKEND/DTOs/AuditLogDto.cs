namespace BACKEND.DTOs;

public class AuditLogDto
{
    public long LogId { get; set; }
    public int? UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public string? IpAddress { get; set; }
    public string Action { get; set; } = null!;
    public string? TableName { get; set; }
    public string? RecordId { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public DateTime? LoggedAt { get; set; }
}
