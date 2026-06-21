using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public class TrackingService : ITrackingService
    {
        private readonly SmartLogAiContext _context;

        public TrackingService(SmartLogAiContext context)
        {
            _context = context;
        }

        public async Task<VehicleEventDto> LogEventAsync(CreateVehicleEventDto dto)
        {
            var vehicle = await _context.Vehicles.FindAsync(dto.VehicleId);
            if (vehicle == null)
            {
                throw new KeyNotFoundException($"Vehicle with ID {dto.VehicleId} not found.");
            }

            var allowedTypes = new[] { "CheckIn", "CheckOut", "Load", "Unload" };
            if (!allowedTypes.Contains(dto.EventType))
            {
                throw new ArgumentException($"Invalid EventType. Allowed types are: {string.Join(", ", allowedTypes)}");
            }

            var newEvent = new VehicleEvent
            {
                VehicleId = dto.VehicleId,
                EventType = dto.EventType,
                EventTime = DateTime.Now, // Match local SQL GETDATE()
                Remarks = dto.Remarks
            };

            _context.VehicleEvents.Add(newEvent);
            await _context.SaveChangesAsync();

            return new VehicleEventDto
            {
                EventId = newEvent.EventId,
                VehicleId = newEvent.VehicleId,
                EventType = newEvent.EventType,
                EventTime = newEvent.EventTime,
                Remarks = newEvent.Remarks
            };
        }

        public async Task<List<VehicleEventDto>> GetHistoryAsync(int vehicleId)
        {
            var vehicleExists = await _context.Vehicles.AnyAsync(v => v.VehicleId == vehicleId);
            if (!vehicleExists)
            {
                throw new KeyNotFoundException($"Vehicle with ID {vehicleId} not found.");
            }

            return await _context.VehicleEvents
                .Where(e => e.VehicleId == vehicleId)
                .OrderBy(e => e.EventTime)
                .Select(e => new VehicleEventDto
                {
                    EventId = e.EventId,
                    VehicleId = e.VehicleId,
                    EventType = e.EventType,
                    EventTime = e.EventTime,
                    Remarks = e.Remarks
                })
                .ToListAsync();
        }

        public async Task<TripCountDto> GetTripCountAsync(int vehicleId)
        {
            var vehicle = await _context.Vehicles.FindAsync(vehicleId);
            if (vehicle == null)
            {
                throw new KeyNotFoundException($"Vehicle with ID {vehicleId} not found.");
            }

            var events = await _context.VehicleEvents
                .Where(e => e.VehicleId == vehicleId)
                .OrderBy(e => e.EventTime)
                .ToListAsync();

            int completedTrips = 0;
            bool hasCheckIn = false;

            foreach (var ev in events)
            {
                if (ev.EventType.Equals("CheckIn", StringComparison.OrdinalIgnoreCase))
                {
                    hasCheckIn = true;
                }
                else if (ev.EventType.Equals("CheckOut", StringComparison.OrdinalIgnoreCase) && hasCheckIn)
                {
                    completedTrips++;
                    hasCheckIn = false;
                }
            }

            return new TripCountDto
            {
                VehicleId = vehicleId,
                TruckPlate = vehicle.TruckPlate,
                CompletedTripCount = completedTrips
            };
        }

        public async Task<List<VehicleDto>> GetVehiclesAsync()
        {
            return await _context.Vehicles
                .Select(v => new VehicleDto
                {
                    VehicleId = v.VehicleId,
                    LicensePlate = v.TruckPlate,
                    VehicleModel = v.VehicleType ?? string.Empty,
                    Status = v.Status ?? "AVAILABLE"
                })
                .ToListAsync();
        }

    }
}
