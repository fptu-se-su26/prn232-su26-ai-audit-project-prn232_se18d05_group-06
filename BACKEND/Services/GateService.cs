using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public class GateService : IGateService
    {
        private readonly SmartLogAiContext _context;

        public GateService(SmartLogAiContext context)
        {
            _context = context;
        }

        public async Task<ActiveBookingSummaryDto?> GetActiveBookingAsync(string search)
        {
            if (string.IsNullOrWhiteSpace(search))
            {
                return null;
            }

            var cleanSearch = search.Trim().ToUpper();

            // Try to find the booking by BookingCode or AlprPlate or associated Vehicle TruckPlate
            // Status must be either 'IN_DOCK' or 'CHECKED_IN'
            var booking = await _context.SlotBookings
                .Include(b => b.Vehicle)
                .Include(b => b.Driver)
                .Include(b => b.Customer)
                .Include(b => b.Dock)
                .FirstOrDefaultAsync(b => (b.Status == "IN_DOCK" || b.Status == "CHECKED_IN") &&
                                          (b.BookingCode == cleanSearch ||
                                           b.AlprPlate == cleanSearch ||
                                           (b.Vehicle != null && b.Vehicle.TruckPlate == cleanSearch)));

            if (booking == null)
            {
                return null;
            }

            return new ActiveBookingSummaryDto
            {
                BookingId = booking.BookingId,
                BookingCode = booking.BookingCode,
                AlprPlate = booking.AlprPlate,
                TruckPlate = booking.Vehicle?.TruckPlate ?? booking.AlprPlate ?? "UNKNOWN",
                BookingType = booking.BookingType,
                ScheduledDate = booking.ScheduledDate.ToString("yyyy-MM-dd"),
                ScheduledTime = $"{booking.ScheduledStart:hh\\:mm} - {booking.ScheduledEnd:hh\\:mm}",
                Status = booking.Status ?? "UNKNOWN",
                DockCode = booking.Dock?.DockCode,
                DockName = booking.Dock?.DockName,
                DriverName = booking.Driver?.FullName ?? "N/A",
                CustomerName = booking.Customer?.CompanyName ?? "N/A"
            };
        }

        public async Task<CheckoutResponseDto> ProcessCheckoutAsync(CheckoutRequestDto request, int? operatorId)
        {
            // Find active booking by BookingCode or AlprPlate
            SlotBooking? booking = null;
            var cleanCode = request.BookingCode?.Trim().ToUpper();
            var cleanPlate = request.AlprPlate?.Trim().ToUpper();

            if (!string.IsNullOrWhiteSpace(cleanCode))
            {
                booking = await _context.SlotBookings
                    .Include(b => b.Vehicle)
                    .Include(b => b.Driver)
                    .Include(b => b.Dock)
                    .FirstOrDefaultAsync(b => b.BookingCode == cleanCode && (b.Status == "IN_DOCK" || b.Status == "CHECKED_IN"));
            }

            if (booking == null && !string.IsNullOrWhiteSpace(cleanPlate))
            {
                booking = await _context.SlotBookings
                    .Include(b => b.Vehicle)
                    .Include(b => b.Driver)
                    .Include(b => b.Dock)
                    .FirstOrDefaultAsync(b => (b.AlprPlate == cleanPlate || (b.Vehicle != null && b.Vehicle.TruckPlate == cleanPlate)) && 
                                              (b.Status == "IN_DOCK" || b.Status == "CHECKED_IN"));
            }

            if (booking == null)
            {
                throw new InvalidOperationException("No active (Checked-In or In-Dock) slot booking found for the provided details.");
            }

            // Start Transaction to ensure atomicity
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var checkOutTime = DateTime.UtcNow;

                // 1. Update SlotBookings status to COMPLETED and CheckOutAt
                booking.Status = "COMPLETED";
                booking.CheckOutAt = checkOutTime;

                // 2. Release Dock associated with the booking
                if (booking.DockId.HasValue)
                {
                    var dock = await _context.Docks.FindAsync(booking.DockId.Value);
                    if (dock != null)
                    {
                        dock.Status = "AVAILABLE";
                    }
                }

                // 3. Resolve Vehicle ID
                int? resolvedVehicleId = booking.VehicleId;
                if (!resolvedVehicleId.HasValue)
                {
                    // Fallback lookup by plate in Vehicles table
                    var plateToFind = booking.AlprPlate ?? cleanPlate;
                    if (!string.IsNullOrWhiteSpace(plateToFind))
                    {
                        var normPlate = plateToFind.Trim().ToUpper();
                        var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.TruckPlate == normPlate);
                        if (vehicle != null)
                        {
                            resolvedVehicleId = vehicle.VehicleId;
                        }
                    }
                }

                // 4. Log to GateLogs with EventType = 'CHECKOUT'
                var gateLog = new GateLog
                {
                    BookingId = booking.BookingId,
                    VehicleId = resolvedVehicleId,
                    DriverId = booking.DriverId,
                    EventType = "CHECKOUT",
                    EventAt = checkOutTime,
                    AlprPlate = booking.AlprPlate ?? cleanPlate ?? booking.Vehicle?.TruckPlate,
                    Alprconfidence = booking.Alprconfidence ?? 95.0m,
                    OperatorId = operatorId
                };
                _context.GateLogs.Add(gateLog);

                // 5. Log to VehicleEvents with EventType = 'CheckOut'
                if (resolvedVehicleId.HasValue)
                {
                    var vehicleEvent = new VehicleEvent
                    {
                        VehicleId = resolvedVehicleId.Value,
                        EventType = "CheckOut",
                        EventTime = checkOutTime,
                        Remarks = $"Vehicle successfully checked out at exit gate. Booking: {booking.BookingCode}"
                    };
                    _context.VehicleEvents.Add(vehicleEvent);
                }

                // Save all changes
                await _context.SaveChangesAsync();

                // Commit Transaction
                await transaction.CommitAsync();

                return new CheckoutResponseDto
                {
                    BarrierCommand = "OPEN_EXIT",
                    Message = "Vehicle checkout transaction processed successfully. Exit barrier command issued.",
                    BookingId = booking.BookingId,
                    BookingCode = booking.BookingCode,
                    LicensePlate = booking.Vehicle?.TruckPlate ?? booking.AlprPlate ?? cleanPlate ?? "UNKNOWN",
                    Status = booking.Status,
                    CheckOutAt = checkOutTime,
                    DockId = booking.DockId,
                    DockCode = booking.Dock?.DockCode
                };
            }
            catch (Exception ex)
            {
                // Rollback in case of any failure
                await transaction.RollbackAsync();
                throw new InvalidOperationException($"Failed to process checkout transaction: {ex.Message}", ex);
            }
        }
    }
}
