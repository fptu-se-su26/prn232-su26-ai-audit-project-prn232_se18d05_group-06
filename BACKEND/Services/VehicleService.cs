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
        private readonly SmartLogDbContext _context;

        public VehicleService(SmartLogDbContext context)
        {
            _context = context;
        }

        public async Task<VehicleDto> DetectStrangeVehicleAsync(string licensePlate)
        {
            // Normalize license plate formatting if needed
            var normalizedPlate = licensePlate.Trim().ToUpper();

            // Check if vehicle already exists (whether active/pending)
            var existing = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.LicensePlate == normalizedPlate);

            if (existing != null)
            {
                return MapToDto(existing);
            }

            // Create new pending vehicle with bypass defaults for SQL constraints
            var newVehicle = new Vehicle
            {
                LicensePlate = normalizedPlate,
                VehicleModel = "TEMP_ALPR",
                Status = "PENDING",
                InsuranceExpiry = DateTime.UtcNow.AddDays(7),
                RegistrationExpiry = DateTime.UtcNow,
                PayloadKg = 0.0m,
                VolumeCbm = 0.0m,
                FuelConsumptionRate = 0.0m,
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
                .Where(v => v.Status == "PENDING" && v.VehicleModel == "TEMP_ALPR")
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
            vehicle.VehicleModel = dto.VehicleModel;
            vehicle.PayloadKg = dto.PayloadKg;
            vehicle.VolumeCbm = dto.VolumeCbm;
            vehicle.InsuranceExpiry = dto.InsuranceExpiry;
            vehicle.RegistrationExpiry = dto.RegistrationExpiry;
            vehicle.FuelConsumptionRate = dto.FuelConsumptionRate;
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

        private static VehicleDto MapToDto(Vehicle vehicle)
        {
            return new VehicleDto
            {
                VehicleId = vehicle.VehicleId,
                LicensePlate = vehicle.LicensePlate,
                VehicleModel = vehicle.VehicleModel,
                PayloadKg = vehicle.PayloadKg,
                VolumeCbm = vehicle.VolumeCbm,
                InsuranceExpiry = vehicle.InsuranceExpiry,
                RegistrationExpiry = vehicle.RegistrationExpiry,
                FuelConsumptionRate = vehicle.FuelConsumptionRate,
                Status = vehicle.Status
            };
        }
    }
}
