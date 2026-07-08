using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using BACKEND.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var defaultConnection = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration.GetConnectionString("DefaultConnectionString")
    ?? throw new InvalidOperationException("Database connection string is missing. Configure ConnectionStrings:DefaultConnection.");

builder.Services.AddDbContext<SmartLogAiContext>(options =>
    options.UseSqlServer(defaultConnection));

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey is missing");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization();

builder.Services.AddScoped<IOutboundService, OutboundService>();
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<ITrackingService, TrackingService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IGateService, GateService>();
builder.Services.AddScoped<IDriverService, DriverService>();
builder.Services.AddScoped<IBlacklistValidationService, BlacklistValidationService>();
builder.Services.AddScoped<IS3StorageService, S3StorageService>();
builder.Services.AddScoped<IStockAlertService, StockAlertService>();
builder.Services.AddScoped<IOverstayAlertService, OverstayAlertService>();
builder.Services.AddScoped<IFinancialForecastService, FinancialForecastService>();
builder.Services.AddScoped<IFinanceReportService, FinanceReportService>();
builder.Services.AddScoped<IFinanceReconciliationService, FinanceReconciliationService>();
builder.Services.AddScoped<IFinanceReportExportService, FinanceReportExportService>();
builder.Services.AddScoped<IReconciliationService, ReconciliationService>();
// Background workers
// builder.Services.AddHostedService<VehicleCleanupWorker>();
builder.Services.AddHostedService<StockAlertWorker>();
// builder.Services.AddHostedService<OverstayAlertWorker>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Apply pending EF Core migrations at startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SmartLogAiContext>();
// db.Database.Migrate();
}


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartLogAI API v1");
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

