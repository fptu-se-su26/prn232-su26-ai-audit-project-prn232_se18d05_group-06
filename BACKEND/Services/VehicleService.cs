using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public class VehicleService : IVehicleService
    {
        private readonly SmartLogAiContext _context;

        public VehicleService(SmartLogAiContext context)
        {
            _context = context;
        }

        public async Task<VehicleDto> DetectStrangeVehicleAsync(string licensePlate)
        {
            // Normalize license plate formatting
            var normalizedPlate = licensePlate.Trim().ToUpper();

            // Check if vehicle already exists (whether active/pending)
            var existing = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.TruckPlate == normalizedPlate);

            if (existing != null)
            {
                return MapToDto(existing);
            }

            // Create new pending vehicle with bypass defaults for SQL constraints
            var newVehicle = new Vehicle
            {
                TruckPlate = normalizedPlate,
                VehicleType = "TEMP_ALPR",
                Status = "PENDING",
                InspectionExpiry = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
                NextServiceDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
                MaxWeightTon = 0.0m,
                IsTempProfile = true,
                TempExpiryAt = DateTime.UtcNow.AddDays(7)
            };

            _context.Vehicles.Add(newVehicle);
            await _context.SaveChangesAsync();

            return MapToDto(newVehicle);
        }

        public async Task<List<VehicleDto>> GetPendingVehiclesAsync()
        {
            var pendingVehicles = await _context.Vehicles
                .Where(v => v.Status == "PENDING" && v.VehicleType == "TEMP_ALPR")
                .ToListAsync();

            return pendingVehicles.Select(MapToDto).ToList();
        }

        public async Task<VehicleDto> ApproveVehicleAsync(int id, ApproveVehicleRequestDto dto)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
            {
                throw new KeyNotFoundException($"Vehicle with ID {id} not found.");
            }

            // Overwrite bypass dummy data with actual registered specifications
            vehicle.VehicleType = dto.VehicleModel;
            vehicle.MaxWeightTon = dto.PayloadKg;
            vehicle.InspectionExpiry = DateOnly.FromDateTime(dto.InsuranceExpiry);
            vehicle.NextServiceDate = DateOnly.FromDateTime(dto.RegistrationExpiry);
            vehicle.Status = "AVAILABLE"; // Fully active status
            vehicle.IsTempProfile = false;
            vehicle.TempExpiryAt = null;

            await _context.SaveChangesAsync();

            return MapToDto(vehicle);
        }

        public async Task<bool> RejectVehicleAsync(int id)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
            {
                throw new KeyNotFoundException($"Vehicle with ID {id} not found.");
            }

            _context.Vehicles.Remove(vehicle);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<VehicleDto> UpdateBlacklistStatusAsync(int id, UpdateBlacklistRequestDto dto)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
            {
                throw new KeyNotFoundException($"Vehicle with ID {id} not found.");
            }

            if (dto.IsBlacklisted)
            {
                if (string.IsNullOrWhiteSpace(dto.BlacklistReason))
                {
                    throw new ArgumentException("A reason is required when blacklisting a vehicle.");
                }
                vehicle.IsBlacklisted = true;
                vehicle.BlacklistReason = dto.BlacklistReason.Trim();
                vehicle.Status = "BLACKLISTED";
            }
            else
            {
                vehicle.IsBlacklisted = false;
                vehicle.BlacklistReason = null;
                vehicle.Status = "AVAILABLE";
            }

            await _context.SaveChangesAsync();
            return MapToDto(vehicle);
        }

        private static VehicleDto MapToDto(Vehicle vehicle)
        {
            return new VehicleDto
            {
                VehicleId = vehicle.VehicleId,
                LicensePlate = vehicle.TruckPlate,
                VehicleModel = vehicle.VehicleType ?? string.Empty,
                PayloadKg = vehicle.MaxWeightTon ?? 0.0m,
                VolumeCbm = 0.0m,
                InsuranceExpiry = vehicle.InspectionExpiry?.ToDateTime(TimeOnly.MinValue) ?? DateTime.UtcNow,
                RegistrationExpiry = vehicle.NextServiceDate?.ToDateTime(TimeOnly.MinValue) ?? DateTime.UtcNow,
                FuelConsumptionRate = 0.0m,
                Status = vehicle.Status ?? "AVAILABLE",
                IsBlacklisted = vehicle.IsBlacklisted ?? false,
                BlacklistReason = vehicle.BlacklistReason
            };
        }
    }
}
