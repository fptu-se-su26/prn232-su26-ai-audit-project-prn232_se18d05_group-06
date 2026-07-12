using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "ADMIN")]
    public class AdminController : ControllerBase
    {
        private readonly SmartLogAiContext _context;

        public AdminController(SmartLogAiContext context)
        {
            _context = context;
        }

        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs(
            [FromQuery] int limit = 50,
            [FromQuery] int offset = 0,
            [FromQuery] string? action = null,
            [FromQuery] string? tableName = null,
            [FromQuery] int? userId = null)
        {
            limit = limit <= 0 ? 50 : limit;
            limit = limit > 200 ? 200 : limit;
            offset = offset < 0 ? 0 : offset;

            var query = _context.AuditLogs
                .Include(log => log.User)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(action))
            {
                query = query.Where(log => log.Action!.Contains(action));
            }

            if (!string.IsNullOrWhiteSpace(tableName))
            {
                query = query.Where(log => log.TableName == tableName);
            }

            if (userId.HasValue)
            {
                query = query.Where(log => log.UserId == userId.Value);
            }

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(log => log.LoggedAt)
                .Skip(offset)
                .Take(limit)
                .Select(log => new AuditLogDto
                {
                    LogId = log.LogId,
                    UserId = log.UserId,
                    UserName = log.User != null ? log.User.FullName : "Unknown",
                    UserEmail = log.User != null ? log.User.Email : string.Empty,
                    Action = log.Action,
                    TableName = log.TableName,
                    RecordId = log.RecordId,
                    IpAddress = log.Ipaddress,
                    LoggedAt = log.LoggedAt
                })
                .ToListAsync();

            return Ok(new { Total = total, Items = items });
        }

        [HttpGet("notification-configs")]
        public async Task<IActionResult> GetNotificationConfigs()
        {
            var configs = await _context.NotificationConfigs
                .OrderBy(config => config.ConfigId)
                .Select(config => new NotificationConfigDto
                {
                    ConfigId = config.ConfigId,
                    EventType = config.EventType,
                    Channel = config.Channel,
                    Template = config.Template,
                    IsActive = config.IsActive ?? false,
                    CreatedAt = config.CreatedAt
                })
                .ToListAsync();

            return Ok(configs);
        }

        [HttpGet("notification-configs/{id}")]
        public async Task<IActionResult> GetNotificationConfig(int id)
        {
            var config = await _context.NotificationConfigs
                .Where(c => c.ConfigId == id)
                .Select(c => new NotificationConfigDto
                {
                    ConfigId = c.ConfigId,
                    EventType = c.EventType,
                    Channel = c.Channel,
                    Template = c.Template,
                    IsActive = c.IsActive ?? false,
                    CreatedAt = c.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (config == null)
            {
                return NotFound(new { Message = "Notification config not found." });
            }

            return Ok(config);
        }

        [HttpPut("notification-configs/{id}")]
        public async Task<IActionResult> UpdateNotificationConfig(int id, [FromBody] UpdateNotificationConfigRequest request)
        {
            var config = await _context.NotificationConfigs.FindAsync(id);
            if (config == null)
            {
                return NotFound(new { Message = "Notification config not found." });
            }

            if (!string.IsNullOrWhiteSpace(request.EventType))
            {
                config.EventType = request.EventType;
            }

            if (!string.IsNullOrWhiteSpace(request.Channel))
            {
                config.Channel = request.Channel;
            }

            if (!string.IsNullOrWhiteSpace(request.Template))
            {
                config.Template = request.Template;
            }

            if (request.IsActive.HasValue)
            {
                config.IsActive = request.IsActive.Value;
            }

            await _context.SaveChangesAsync();

            return Ok(new NotificationConfigDto
            {
                ConfigId = config.ConfigId,
                EventType = config.EventType,
                Channel = config.Channel,
                Template = config.Template,
                IsActive = config.IsActive ?? false,
                CreatedAt = config.CreatedAt
            });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] int limit = 100, [FromQuery] int offset = 0)
        {
            limit = limit <= 0 ? 100 : Math.Min(limit, 200);
            offset = Math.Max(offset, 0);

            var query = _context.Users
                .Include(u => u.Role)
                .AsQueryable();

            var total = await query.CountAsync();
            var items = await query
                .OrderBy(u => u.FullName)
                .Skip(offset)
                .Take(limit)
                .Select(u => new UserDto
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    FullName = u.FullName,
                    Email = u.Email,
                    Phone = u.Phone,
                    RoleId = u.RoleId,
                    RoleCode = u.Role.RoleCode,
                    RoleName = u.Role.RoleName,
                    IsActive = u.IsActive ?? false,
                    LastLoginAt = u.LastLoginAt,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return Ok(new { Total = total, Items = items });
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _context.Roles
                .OrderBy(r => r.RoleName)
                .Select(r => new RoleDto
                {
                    RoleId = r.RoleId,
                    RoleCode = r.RoleCode,
                    RoleName = r.RoleName
                })
                .ToListAsync();

            return Ok(roles);
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username)
                || string.IsNullOrWhiteSpace(request.Password)
                || string.IsNullOrWhiteSpace(request.FullName)
                || string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { Message = "Username, email, full name and password are required." });
            }

            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                return BadRequest(new { Message = "Username already exists." });
            }

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { Message = "Email already exists." });
            }

            var role = await _context.Roles.FindAsync(request.RoleId);
            if (role == null)
            {
                return BadRequest(new { Message = "Role not found." });
            }

            var user = new User
            {
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FullName = request.FullName,
                Email = request.Email,
                Phone = request.Phone,
                RoleId = request.RoleId,
                IsActive = request.IsActive ?? true,
                CreatedAt = DateTime.Now
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            await AddAuditLogAsync(
                action: $"Created user '{user.Username}' ({user.Email}) with role {role.RoleCode}",
                tableName: "Users",
                recordId: user.UserId.ToString());

            return Ok(new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                RoleId = user.RoleId,
                RoleCode = role.RoleCode,
                RoleName = role.RoleName,
                IsActive = user.IsActive ?? true,
                LastLoginAt = user.LastLoginAt,
                CreatedAt = user.CreatedAt
            });
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            if (request.RoleId.HasValue)
            {
                var role = await _context.Roles.FindAsync(request.RoleId.Value);
                if (role == null)
                {
                    return BadRequest(new { Message = "Role not found." });
                }

                user.RoleId = request.RoleId.Value;
            }

            if (request.IsActive.HasValue)
            {
                user.IsActive = request.IsActive.Value;
            }

            await _context.SaveChangesAsync();

            await AddAuditLogAsync(
                action: $"Updated user '{user.Username}' role to {user.Role?.RoleName ?? user.RoleId.ToString()} and status {(user.IsActive == true ? "active" : "inactive")}",
                tableName: "Users",
                recordId: user.UserId.ToString());

            return Ok(new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                RoleId = user.RoleId,
                RoleCode = user.Role?.RoleCode ?? string.Empty,
                RoleName = user.Role?.RoleName ?? string.Empty,
                IsActive = user.IsActive ?? true,
                LastLoginAt = user.LastLoginAt,
                CreatedAt = user.CreatedAt
            });
        }

        private async Task AddAuditLogAsync(string action, string tableName, string recordId)
        {
            var currentUserId = GetCurrentUserId();
            var currentUsername = User.Identity?.Name ?? "System";
            var ipAddress = GetRequestIpAddress();

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = currentUserId > 0 ? currentUserId : null,
                Action = $"{currentUsername}: {action}",
                TableName = tableName,
                RecordId = recordId,
                Ipaddress = ipAddress,
                LoggedAt = DateTime.Now
            });

            await _context.SaveChangesAsync();
        }

        private int? GetCurrentUserId()
        {
            var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(raw, out var userId))
            {
                return userId > 0 ? userId : null;
            }

            return null;
        }

        private string? GetRequestIpAddress()
        {
            var forwarded = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(forwarded))
            {
                return forwarded.Split(',').FirstOrDefault()?.Trim();
            }

            return HttpContext.Connection.RemoteIpAddress?.ToString();
        }
    }

    public class AuditLogDto
    {
        public long LogId { get; set; }
        public int? UserId { get; set; }
        public string UserName { get; set; } = null!;
        public string UserEmail { get; set; } = null!;
        public string? Action { get; set; }
        public string? TableName { get; set; }
        public string? RecordId { get; set; }
        public string? IpAddress { get; set; }
        public DateTime? LoggedAt { get; set; }
    }

    public class NotificationConfigDto
    {
        public int ConfigId { get; set; }
        public string EventType { get; set; } = null!;
        public string Channel { get; set; } = null!;
        public string Template { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class UserDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public int RoleId { get; set; }
        public string RoleCode { get; set; } = null!;
        public string RoleName { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class RoleDto
    {
        public int RoleId { get; set; }
        public string RoleCode { get; set; } = null!;
        public string RoleName { get; set; } = null!;
    }

    public class CreateUserRequest
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public int RoleId { get; set; }
        public bool? IsActive { get; set; }
    }

    public class UpdateUserRequest
    {
        public int? RoleId { get; set; }
        public bool? IsActive { get; set; }
    }

    public class UpdateNotificationConfigRequest
    {
        public string? EventType { get; set; }
        public string? Channel { get; set; }
        public string? Template { get; set; }
        public bool? IsActive { get; set; }
    }
}
