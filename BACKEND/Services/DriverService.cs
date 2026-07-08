using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public class DriverService : IDriverService
    {
        private readonly SmartLogAiContext _context;

        public DriverService(SmartLogAiContext context)
        {
            _context = context;
        }

        public async Task<List<DriverDto>> GetDriversAsync()
        {
            var drivers = await _context.Drivers.ToListAsync();
            return drivers.Select(MapToDto).ToList();
        }

        public async Task<DriverDto> UpdateBlacklistStatusAsync(int id, UpdateBlacklistRequestDto dto)
        {
            var driver = await _context.Drivers.FindAsync(id);
            if (driver == null)
            {
                throw new KeyNotFoundException($"Driver with ID {id} not found.");
            }

            if (dto.IsBlacklisted)
            {
                if (string.IsNullOrWhiteSpace(dto.BlacklistReason))
                {
                    throw new ArgumentException("A reason is required when blacklisting a driver.");
                }
                driver.IsBlacklisted = true;
                driver.BlacklistReason = dto.BlacklistReason.Trim();
            }
            else
            {
                driver.IsBlacklisted = false;
                driver.BlacklistReason = null;
            }

            await _context.SaveChangesAsync();
            return MapToDto(driver);
        }

        private static DriverDto MapToDto(Driver driver)
        {
            return new DriverDto
            {
                DriverId = driver.DriverId,
                DriverCode = driver.DriverCode,
                FullName = driver.FullName,
                Phone = driver.Phone,
                LicenseNo = driver.LicenseNo,
                LicenseExpiry = driver.LicenseExpiry?.ToDateTime(TimeOnly.MinValue),
                IsBlacklisted = driver.IsBlacklisted ?? false,
                BlacklistReason = driver.BlacklistReason,
                IsActive = driver.IsActive ?? true
            };
        }
    }
}
