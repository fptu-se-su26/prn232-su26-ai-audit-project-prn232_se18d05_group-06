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

        public async Task<List<DispatcherVehicleDto>> GetDispatcherVehiclesAsync(
            string? search,
            string? vehicleType,
            string? status,
            bool? isInternal,
            bool? expiringSoon,
            bool? blacklisted)
        {
            var query = _context.Vehicles
                .Include(v => v.DefaultDriver)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var keyword = NormalizePlate(search);
                query = query.Where(v =>
                    v.TruckPlate.ToUpper().Contains(keyword) ||
                    (v.TrailerPlate != null && v.TrailerPlate.ToUpper().Contains(keyword)));
            }

            if (!string.IsNullOrWhiteSpace(vehicleType))
            {
                query = query.Where(v => v.VehicleType == vehicleType.Trim());
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalizedStatus = NormalizeStatus(status);
                query = query.Where(v => v.Status == normalizedStatus);
            }

            if (isInternal.HasValue)
            {
                query = query.Where(v => (v.IsInternal ?? false) == isInternal.Value);
            }

            if (blacklisted.HasValue)
            {
                query = query.Where(v => (v.IsBlacklisted ?? false) == blacklisted.Value);
            }

            if (expiringSoon == true)
            {
                var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
                var threshold = today.AddDays(30);
                query = query.Where(v => v.InspectionExpiry.HasValue &&
                                         v.InspectionExpiry.Value >= today &&
                                         v.InspectionExpiry.Value <= threshold);
            }

            var vehicles = await query
                .OrderByDescending(v => v.CreatedAt)
                .ThenBy(v => v.TruckPlate)
                .ToListAsync();

            return vehicles.Select(MapToDispatcherDto).ToList();
        }

        public async Task<DispatcherVehicleDto> GetDispatcherVehicleAsync(int id)
        {
            var vehicle = await _context.Vehicles
                .Include(v => v.DefaultDriver)
                .FirstOrDefaultAsync(v => v.VehicleId == id);

            if (vehicle == null)
            {
                throw new KeyNotFoundException($"Vehicle with ID {id} not found.");
            }

            return MapToDispatcherDto(vehicle);
        }

        public async Task<DispatcherVehicleDto> CreateDispatcherVehicleAsync(UpsertDispatcherVehicleRequestDto dto)
        {
            ValidateDispatcherVehicleRequest(dto);

            var truckPlate = NormalizePlate(dto.TruckPlate);
            var trailerPlate = NormalizeNullablePlate(dto.TrailerPlate);

            await EnsurePlateIsUniqueAsync(truckPlate, trailerPlate, null);

            if (dto.DefaultDriverId.HasValue)
            {
                await EnsureDriverCanBeAssignedAsync(dto.DefaultDriverId.Value);
            }

            var vehicle = new Vehicle
            {
                TruckPlate = truckPlate,
                TrailerPlate = trailerPlate,
                VehicleType = dto.VehicleType.Trim(),
                MaxWeightTon = dto.MaxWeightTon,
                OwnerName = dto.OwnerName.Trim(),
                OwnerPhone = NormalizeOptionalText(dto.OwnerPhone),
                IsInternal = dto.IsInternal,
                DefaultDriverId = dto.DefaultDriverId,
                InspectionExpiry = ToDateOnly(dto.InspectionExpiry),
                NextServiceDate = ToDateOnly(dto.NextServiceDate),
                GpsdeviceId = NormalizeOptionalText(dto.GpsDeviceId),
                IsBlacklisted = false,
                Status = NormalizeStatus(dto.Status),
                IsTempProfile = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            return await GetDispatcherVehicleAsync(vehicle.VehicleId);
        }

        public async Task<DispatcherVehicleDto> UpdateDispatcherVehicleAsync(int id, UpsertDispatcherVehicleRequestDto dto)
        {
            ValidateDispatcherVehicleRequest(dto);

            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
            {
                throw new KeyNotFoundException($"Vehicle with ID {id} not found.");
            }

            var truckPlate = NormalizePlate(dto.TruckPlate);
            var trailerPlate = NormalizeNullablePlate(dto.TrailerPlate);

            await EnsurePlateIsUniqueAsync(truckPlate, trailerPlate, id);

            if (dto.DefaultDriverId.HasValue)
            {
                await EnsureDriverCanBeAssignedAsync(dto.DefaultDriverId.Value);
            }

            vehicle.TruckPlate = truckPlate;
            vehicle.TrailerPlate = trailerPlate;
            vehicle.VehicleType = dto.VehicleType.Trim();
            vehicle.MaxWeightTon = dto.MaxWeightTon;
            vehicle.OwnerName = dto.OwnerName.Trim();
            vehicle.OwnerPhone = NormalizeOptionalText(dto.OwnerPhone);
            vehicle.IsInternal = dto.IsInternal;
            vehicle.DefaultDriverId = dto.DefaultDriverId;
            vehicle.InspectionExpiry = ToDateOnly(dto.InspectionExpiry);
            vehicle.NextServiceDate = ToDateOnly(dto.NextServiceDate);
            vehicle.GpsdeviceId = NormalizeOptionalText(dto.GpsDeviceId);
            vehicle.Status = NormalizeStatus(dto.Status);

            if (vehicle.Status != "BLACKLISTED" && vehicle.IsBlacklisted == true)
            {
                vehicle.IsBlacklisted = false;
                vehicle.BlacklistReason = null;
            }

            await _context.SaveChangesAsync();

            return await GetDispatcherVehicleAsync(id);
        }

        public async Task DeactivateDispatcherVehicleAsync(int id)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
            {
                throw new KeyNotFoundException($"Vehicle with ID {id} not found.");
            }

            vehicle.Status = "INACTIVE";
            await _context.SaveChangesAsync();
        }

        public async Task BlacklistDispatcherVehicleAsync(int id, BlacklistVehicleRequestDto dto)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
            {
                throw new KeyNotFoundException($"Vehicle with ID {id} not found.");
            }

            if (dto == null || string.IsNullOrWhiteSpace(dto.Reason))
            {
                throw new ArgumentException("Blacklist reason is required.");
            }

            vehicle.IsBlacklisted = true;
            vehicle.Status = "BLACKLISTED";
            vehicle.BlacklistReason = dto.Reason.Trim();

            await _context.SaveChangesAsync();
        }

        public async Task<DispatcherVehicleDto> AssignDispatcherVehicleDriverAsync(int id, AssignVehicleDriverRequestDto dto)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
            {
                throw new KeyNotFoundException($"Vehicle with ID {id} not found.");
            }

            if (vehicle.IsBlacklisted == true || !IsActiveStatus(vehicle.Status))
            {
                throw new ArgumentException("Vehicle is inactive, blacklisted, or unavailable for driver assignment.");
            }

            await EnsureDriverCanBeAssignedAsync(dto.DriverId);

            vehicle.DefaultDriverId = dto.DriverId;
            await _context.SaveChangesAsync();

            return await GetDispatcherVehicleAsync(id);
        }

        private async Task EnsurePlateIsUniqueAsync(string truckPlate, string? trailerPlate, int? excludingVehicleId)
        {
            var plates = new[] { truckPlate, trailerPlate }
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .Select(p => p!)
                .ToList();

            if (plates.Count != plates.Distinct().Count())
            {
                throw new ArgumentException("Truck plate and trailer plate must be different.");
            }

            var exists = await _context.Vehicles.AnyAsync(v =>
                (!excludingVehicleId.HasValue || v.VehicleId != excludingVehicleId.Value) &&
                (plates.Contains(v.TruckPlate.ToUpper()) ||
                 (v.TrailerPlate != null && plates.Contains(v.TrailerPlate.ToUpper()))));

            if (exists)
            {
                throw new ArgumentException("Vehicle or trailer plate already exists in the system.");
            }
        }

        private async Task EnsureDriverCanBeAssignedAsync(int driverId)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
            var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.DriverId == driverId);

            if (driver == null ||
                driver.IsActive != true ||
                driver.IsBlacklisted == true ||
                (driver.LicenseExpiry.HasValue && driver.LicenseExpiry.Value < today))
            {
                throw new ArgumentException("Driver is invalid, inactive, blacklisted, or has an expired license.");
            }
        }

        private static void ValidateDispatcherVehicleRequest(UpsertDispatcherVehicleRequestDto dto)
        {
            if (dto == null)
            {
                throw new ArgumentException("Vehicle request is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.TruckPlate))
            {
                throw new ArgumentException("Truck plate is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.VehicleType))
            {
                throw new ArgumentException("Vehicle type is required.");
            }

            if (dto.MaxWeightTon <= 0)
            {
                throw new ArgumentException("Max weight must be greater than zero.");
            }

            if (string.IsNullOrWhiteSpace(dto.OwnerName))
            {
                throw new ArgumentException("Owner name is required.");
            }
        }

        private static DispatcherVehicleDto MapToDispatcherDto(Vehicle vehicle)
        {
            var status = vehicle.Status ?? "ACTIVE";

            return new DispatcherVehicleDto
            {
                VehicleId = vehicle.VehicleId,
                TruckPlate = vehicle.TruckPlate,
                TrailerPlate = vehicle.TrailerPlate,
                VehicleType = vehicle.VehicleType ?? string.Empty,
                MaxWeightTon = vehicle.MaxWeightTon ?? 0.0m,
                OwnerName = vehicle.OwnerName ?? string.Empty,
                OwnerPhone = vehicle.OwnerPhone,
                IsInternal = vehicle.IsInternal ?? false,
                DefaultDriverId = vehicle.DefaultDriverId,
                DefaultDriverName = vehicle.DefaultDriver?.FullName,
                DefaultDriverCode = vehicle.DefaultDriver?.DriverCode,
                InspectionExpiry = vehicle.InspectionExpiry?.ToDateTime(TimeOnly.MinValue),
                NextServiceDate = vehicle.NextServiceDate?.ToDateTime(TimeOnly.MinValue),
                GpsDeviceId = vehicle.GpsdeviceId,
                IsBlacklisted = vehicle.IsBlacklisted ?? false,
                BlacklistReason = vehicle.BlacklistReason,
                Status = status,
                IsActive = IsActiveStatus(status) && vehicle.IsBlacklisted != true,
                CreatedAt = vehicle.CreatedAt
            };
        }

        private static DateOnly? ToDateOnly(DateTime? value)
        {
            return value.HasValue ? DateOnly.FromDateTime(value.Value) : null;
        }

        private static string NormalizePlate(string plate)
        {
            return plate.Trim().ToUpperInvariant();
        }

        private static string? NormalizeNullablePlate(string? plate)
        {
            return string.IsNullOrWhiteSpace(plate) ? null : NormalizePlate(plate);
        }

        private static string? NormalizeOptionalText(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        private static string NormalizeStatus(string? status)
        {
            var normalized = string.IsNullOrWhiteSpace(status)
                ? "ACTIVE"
                : status.Trim().ToUpperInvariant();

            var allowed = new HashSet<string> { "ACTIVE", "PENDING_APPROVAL", "BLACKLISTED", "INACTIVE", "MAINTENANCE", "PENDING", "AVAILABLE" };
            if (!allowed.Contains(normalized))
            {
                throw new ArgumentException("Vehicle status is invalid.");
            }

            return normalized;
        }

        private static bool IsActiveStatus(string? status)
        {
            return string.Equals(status, "ACTIVE", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(status, "AVAILABLE", StringComparison.OrdinalIgnoreCase);
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

        public async Task<DashboardDataDto> GetDashboardDataAsync()
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
            var in30Days = today.AddDays(30);

            var activeVehicles = await _context.Vehicles
                .Where(v => v.Status == "ACTIVE" || v.Status == "AVAILABLE")
                .CountAsync();

            var maintenanceAlerts = await _context.MaintenanceSchedules
                .Where(m => m.Status == "PENDING" && m.DueDate <= DateTime.UtcNow.AddDays(7))
                .CountAsync();

            var expiringInspections = await _context.Vehicles
                .Where(v => v.InspectionExpiry.HasValue
                         && v.InspectionExpiry.Value >= today
                         && v.InspectionExpiry.Value <= in30Days)
                .CountAsync();

            var priorityVehicles = await _context.Vehicles
                .Include(v => v.DefaultDriver)
                .Where(v => v.Status == "ACTIVE" || v.Status == "AVAILABLE" || v.IsBlacklisted == true || v.Status == "PENDING")
                .OrderBy(v => v.InspectionExpiry)
                .Take(5)
                .Select(v => new DashboardVehicleDto
                {
                    VehicleId = v.VehicleId,
                    TruckPlate = v.TruckPlate,
                    VehicleType = v.VehicleType,
                    Status = v.Status ?? "ACTIVE",
                    InspectionExpiry = v.InspectionExpiry.HasValue ? v.InspectionExpiry.Value.ToString("yyyy-MM-dd") : null,
                    NextServiceDate = v.NextServiceDate.HasValue ? v.NextServiceDate.Value.ToString("yyyy-MM-dd") : null,
                    IsBlacklisted = v.IsBlacklisted ?? false,
                    DriverName = v.DefaultDriver != null ? v.DefaultDriver.FullName : null
                })
                .ToListAsync();

            var drivers = await _context.Drivers
                .Where(d => d.IsActive == true)
                .OrderBy(d => d.FullName)
                .Take(10)
                .Select(d => new DashboardDriverDto
                {
                    DriverId = d.DriverId,
                    DriverCode = d.DriverCode,
                    FullName = d.FullName,
                    Phone = d.Phone,
                    LicenseNo = d.LicenseNo,
                    LicenseExpiry = d.LicenseExpiry.HasValue ? d.LicenseExpiry.Value.ToString("yyyy-MM-dd") : null,
                    IsActive = d.IsActive ?? false,
                    IsBlacklisted = d.IsBlacklisted ?? false
                })
                .ToListAsync();

            return new DashboardDataDto
            {
                Kpi = new DashboardKpiDto
                {
                    TotalActiveVehicles = activeVehicles,
                    MaintenanceAlerts = maintenanceAlerts,
                    ExpiringInspections = expiringInspections,
                    FuelEfficiency = 2.4m
                },
                PriorityVehicles = priorityVehicles,
                Drivers = drivers
            };
        }
    }
}
