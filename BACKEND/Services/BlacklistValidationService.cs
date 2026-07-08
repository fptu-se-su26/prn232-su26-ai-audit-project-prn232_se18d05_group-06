using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public class BlacklistValidationService : IBlacklistValidationService
    {
        private readonly SmartLogAiContext _context;

        public BlacklistValidationService(SmartLogAiContext context)
        {
            _context = context;
        }

        public async Task<GateAccessDeniedResponseDto?> CheckBlacklistAsync(int? vehicleId, int? driverId)
        {
            Vehicle? vehicle = null;
            Driver? driver = null;

            if (vehicleId.HasValue)
            {
                vehicle = await _context.Vehicles.FindAsync(vehicleId.Value);
            }

            if (driverId.HasValue)
            {
                driver = await _context.Drivers.FindAsync(driverId.Value);
            }

            bool vehicleBlocked = vehicle?.IsBlacklisted == true;
            bool driverBlocked = driver?.IsBlacklisted == true;

            if (!vehicleBlocked && !driverBlocked)
            {
                return null;
            }

            var response = new GateAccessDeniedResponseDto
            {
                AccessDenied = true,
                AlertType = "BLACKLIST_DETECTED",
                AlarmLevel = "CRITICAL",
                LicensePlate = vehicle?.TruckPlate ?? "UNKNOWN",
                DriverName = driver?.FullName ?? "UNKNOWN"
            };

            if (vehicleBlocked && driverBlocked)
            {
                response.BlockedEntity = "Both";
                response.Reason = $"Vehicle blocked: {vehicle?.BlacklistReason ?? "No reason specified"}. Driver blocked: {driver?.BlacklistReason ?? "No reason specified"}.";
            }
            else if (vehicleBlocked)
            {
                response.BlockedEntity = "Vehicle";
                response.Reason = vehicle?.BlacklistReason ?? "No reason specified";
            }
            else
            {
                response.BlockedEntity = "Driver";
                response.Reason = driver?.BlacklistReason ?? "No reason specified";
            }

            return response;
        }
    }
}
