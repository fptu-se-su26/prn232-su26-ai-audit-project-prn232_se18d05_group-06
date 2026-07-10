using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;

namespace BACKEND.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly SmartLogAiContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(SmartLogAiContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                return BadRequest(new { Message = "Username already exists" });
            }

            var defaultRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleCode == "CUSTOMER" || r.RoleName == "Customer");
            if (defaultRole == null)
            {
                // Create a default role if not exists
                defaultRole = new Role { RoleCode = "CUSTOMER", RoleName = "Customer", IsActive = true };
                _context.Roles.Add(defaultRole);
                await _context.SaveChangesAsync();
            }

            var user = new User
            {
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FullName = request.FullName,
                Email = request.Email,
                Phone = request.Phone,
                RoleId = defaultRole.RoleId,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            await EnsureCustomerProfileAsync(user);

            return Ok(new { Message = "User registered successfully" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Built-in admin account configured in appsettings.json (AdminAccount section).
            // Lets an Admin sign in without needing a seeded database record.
            var adminSettings = _configuration.GetSection("AdminAccount");
            var adminUsername = adminSettings["Username"];
            var adminEmailConfig = adminSettings["Email"] ?? "admin@smartlogai.com";
            var adminPassword = adminSettings["Password"];
            var matchesAdminLogin = request.Username == adminUsername
                || string.Equals(request.Username, adminEmailConfig, StringComparison.OrdinalIgnoreCase);
            if (!string.IsNullOrEmpty(adminUsername)
                && matchesAdminLogin
                && request.Password == adminPassword)
            {
                var adminRole = adminSettings["Role"] ?? "ADMIN";
                var adminEmail = adminEmailConfig;
                var adminFullName = adminSettings["FullName"] ?? "System Administrator";

                var adminToken = GenerateJwtToken(0, adminUsername, adminEmail, adminRole);

                return Ok(new AuthResponse
                {
                    Token = adminToken,
                    Username = adminUsername,
                    Email = adminEmail,
                    FullName = adminFullName,
                    Role = adminRole
                });
            }

            var user = await _context.Users.Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { Message = "Invalid username or password" });
            }

            if (user.IsActive == false)
            {
                return Unauthorized(new { Message = "Account is disabled" });
            }

            var token = GenerateJwtToken(user);

            user.LastLoginAt = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new AuthResponse
            {
                Token = token,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.RoleCode
            });
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(request.TokenId, new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _configuration["GoogleAuth:ClientId"] }
                });

                // Check if user exists by email
                var user = await _context.Users.Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Email == payload.Email);

                if (user == null)
                {
                    // Create new user if they don't exist
                    var defaultRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleCode == "CUSTOMER" || r.RoleName == "Customer");
                    if (defaultRole == null)
                    {
                        defaultRole = new Role { RoleCode = "CUSTOMER", RoleName = "Customer", IsActive = true };
                        _context.Roles.Add(defaultRole);
                        await _context.SaveChangesAsync();
                    }

                    user = new User
                    {
                        // Use email prefix as username, append random if needed, but let's keep it simple
                        Username = payload.Email,
                        // Dummy strong password for google users
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                        FullName = payload.Name,
                        Email = payload.Email,
                        RoleId = defaultRole.RoleId,
                        IsActive = true,
                        CreatedAt = DateTime.Now
                    };

                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                    await EnsureCustomerProfileAsync(user);
                }

                if (user.IsActive == false)
                {
                    return Unauthorized(new { Message = "Account is disabled" });
                }

                var token = GenerateJwtToken(user);
                user.LastLoginAt = DateTime.Now;
                await _context.SaveChangesAsync();

                return Ok(new AuthResponse
                {
                    Token = token,
                    Username = user.Username,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role?.RoleCode ?? "CUSTOMER"
                });
            }
            catch (InvalidJwtException)
            {
                return Unauthorized(new { Message = "Invalid Google Token" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error: " + ex.Message });
            }
        }

        private string GenerateJwtToken(User user)
        {
            return GenerateJwtToken(user.UserId, user.Username, user.Email, user.Role.RoleCode);
        }

        private async Task EnsureCustomerProfileAsync(User user)
        {
            var exists = await _context.Customers.AnyAsync(c => c.UserId == user.UserId);
            if (exists)
            {
                return;
            }

            var customer = new Customer
            {
                CustomerCode = $"CUST{user.UserId:D8}",
                CompanyName = string.IsNullOrWhiteSpace(user.FullName) ? user.Username : user.FullName,
                ContactName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Tier = "BRONZE",
                TotalOrders12M = 0,
                UserId = user.UserId,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
        }

        private string GenerateJwtToken(int userId, string username, string email, string roleCode)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"] ?? "");

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, roleCode)
            };

            var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(Convert.ToDouble(jwtSettings["ExpiryInMinutes"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
