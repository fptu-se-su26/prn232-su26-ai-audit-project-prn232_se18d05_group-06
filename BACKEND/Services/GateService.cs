using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using BACKEND.Models;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public class GateService : IGateService
    {
        private readonly SmartLogAiContext _context;
        private readonly IBlacklistValidationService _blacklistValidationService;
        private readonly IInvoiceService _invoiceService;
        private readonly ILogger<GateService> _logger;

        public GateService(
            SmartLogAiContext context,
            IBlacklistValidationService blacklistValidationService,
            IInvoiceService invoiceService,
            ILogger<GateService> logger)
        {
            _context = context;
            _blacklistValidationService = blacklistValidationService;
            _invoiceService = invoiceService;
            _logger = logger;
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
                .FirstOrDefaultAsync(b => (b.Status == "IN_DOCK" || b.Status == "CHECKED_IN" || b.Status == "CONFIRMED") &&
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

            CheckoutResponseDto? result = null;
            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var checkOutTime = DateTime.UtcNow;

                    booking.Status = "COMPLETED";
                    booking.CheckOutAt = checkOutTime;

                    if (booking.DockId.HasValue)
                    {
                        var dock = await _context.Docks.FindAsync(booking.DockId.Value);
                        if (dock != null) dock.Status = "AVAILABLE";
                    }

                    int? resolvedVehicleId = booking.VehicleId;
                    if (!resolvedVehicleId.HasValue)
                    {
                        var plateToFind = booking.AlprPlate ?? cleanPlate;
                        if (!string.IsNullOrWhiteSpace(plateToFind))
                        {
                            var normPlate = plateToFind.Trim().ToUpper();
                            var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.TruckPlate == normPlate);
                            if (vehicle != null) resolvedVehicleId = vehicle.VehicleId;
                        }
                    }

                    _context.GateLogs.Add(new GateLog
                    {
                        BookingId = booking.BookingId,
                        VehicleId = resolvedVehicleId,
                        DriverId = booking.DriverId,
                        EventType = "CHECKOUT",
                        EventAt = checkOutTime,
                        AlprPlate = booking.AlprPlate ?? cleanPlate ?? booking.Vehicle?.TruckPlate,
                        Alprconfidence = booking.Alprconfidence ?? 95.0m,
                        OperatorId = operatorId
                    });

                    if (resolvedVehicleId.HasValue)
                    {
                        _context.VehicleEvents.Add(new VehicleEvent
                        {
                            VehicleId = resolvedVehicleId.Value,
                            EventType = "CheckOut",
                            EventTime = checkOutTime,
                            Remarks = $"Vehicle successfully checked out at exit gate. Booking: {booking.BookingCode}"
                        });
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    result = new CheckoutResponseDto
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
                    await transaction.RollbackAsync();
                    throw new InvalidOperationException($"Failed to process checkout transaction: {ex.Message}", ex);
                }
            });

            return result!;
        }

        public async Task<object> ProcessCheckInAsync(GateCheckInRequestDto request, int? operatorId)
        {
            SlotBooking? booking = null;
            var cleanCode = request.BookingCode?.Trim().ToUpper();
            var cleanPlate = request.AlprPlate?.Trim().ToUpper();

            if (!string.IsNullOrWhiteSpace(cleanCode))
            {
                booking = await _context.SlotBookings
                    .Include(b => b.Vehicle)
                    .Include(b => b.Driver)
                    .Include(b => b.Dock)
                    .FirstOrDefaultAsync(b => b.BookingCode == cleanCode && b.Status == "CONFIRMED");
            }

            if (booking == null && !string.IsNullOrWhiteSpace(cleanPlate))
            {
                booking = await _context.SlotBookings
                    .Include(b => b.Vehicle)
                    .Include(b => b.Driver)
                    .Include(b => b.Dock)
                    .FirstOrDefaultAsync(b => (b.AlprPlate == cleanPlate || (b.Vehicle != null && b.Vehicle.TruckPlate == cleanPlate)) && 
                                              b.Status == "CONFIRMED");
            }

            if (booking == null)
            {
                // Create Ad-hoc booking
                booking = new SlotBooking
                {
                    BookingCode = "AH-" + DateTime.UtcNow.ToString("yyyyMMddHHmmss"),
                    WarehouseId = 1, // default
                    BookingType = "INBOUND",
                    ScheduledDate = DateOnly.FromDateTime(DateTime.UtcNow),
                    ScheduledStart = TimeOnly.FromDateTime(DateTime.UtcNow),
                    ScheduledEnd = TimeOnly.FromDateTime(DateTime.UtcNow.AddHours(2)),
                    Status = "CONFIRMED",
                    AlprPlate = cleanPlate ?? "UNKNOWN",
                    CreatedAt = DateTime.UtcNow
                };
                _context.SlotBookings.Add(booking);
                await _context.SaveChangesAsync();
            }

            var checkInVehicle = await ResolveVehicleAsync(booking, cleanPlate);
            if (IsInspectionExpired(checkInVehicle))
            {
                return CreateInspectionExpiredDenial(checkInVehicle, booking.Vehicle?.TruckPlate ?? booking.AlprPlate ?? cleanPlate);
            }

            // Perform blacklist validation before any transaction or state updates
            var blacklistDenied = await _blacklistValidationService.CheckBlacklistAsync(booking.VehicleId, booking.DriverId);
            if (blacklistDenied != null)
            {
                return blacklistDenied;
            }

            object? checkInResult = null;
            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var checkInTime = DateTime.UtcNow;

                    booking.Status = "CHECKED_IN";
                    booking.CheckInAt = checkInTime;

                    int? resolvedVehicleId = booking.VehicleId;
                    if (!resolvedVehicleId.HasValue)
                    {
                        var plateToFind = booking.AlprPlate ?? cleanPlate;
                        if (!string.IsNullOrWhiteSpace(plateToFind))
                        {
                            var normPlate = plateToFind.Trim().ToUpper();
                            var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.TruckPlate == normPlate);
                            if (vehicle != null) resolvedVehicleId = vehicle.VehicleId;
                        }
                    }

                    _context.GateLogs.Add(new GateLog
                    {
                        BookingId = booking.BookingId,
                        VehicleId = resolvedVehicleId,
                        DriverId = booking.DriverId,
                        EventType = "CHECKIN",
                        EventAt = checkInTime,
                        AlprPlate = booking.AlprPlate ?? cleanPlate ?? booking.Vehicle?.TruckPlate,
                        Alprconfidence = booking.Alprconfidence ?? 95.0m,
                        OperatorId = operatorId
                    });

                    if (resolvedVehicleId.HasValue)
                    {
                        _context.VehicleEvents.Add(new VehicleEvent
                        {
                            VehicleId = resolvedVehicleId.Value,
                            EventType = "CheckIn",
                            EventTime = checkInTime,
                            Remarks = $"Vehicle successfully checked in at entry gate. Booking: {booking.BookingCode}"
                        });
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    checkInResult = new GateCheckInResponseDto
                    {
                        BarrierCommand = "OPEN_ENTRY",
                        Message = "Vehicle check-in transaction processed successfully. Entry barrier command issued.",
                        BookingId = booking.BookingId,
                        BookingCode = booking.BookingCode,
                        LicensePlate = booking.Vehicle?.TruckPlate ?? booking.AlprPlate ?? cleanPlate ?? "UNKNOWN",
                        Status = booking.Status,
                        CheckInAt = checkInTime,
                        DockId = booking.DockId,
                        DockCode = booking.Dock?.DockCode
                    };
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    throw new InvalidOperationException($"Failed to process check-in transaction: {ex.Message}", ex);
                }
            });

            return checkInResult!;
        }

        private string NormalizePlate(string plate)
        {
            if (string.IsNullOrWhiteSpace(plate)) return string.Empty;
            return plate.Trim().ToUpper().Replace("-", "").Replace(".", "").Replace(" ", "");
        }

        public async Task<GateCheckResultDto> CheckVehiclePlateAsync(GateCheckPlateRequestDto request, int? operatorId)
        {
            var normalizedPlate = NormalizePlate(request.DetectedPlate);

            var vehicle = await _context.Vehicles
                .FirstOrDefaultAsync(v =>
                    (v.TruckPlate != null && v.TruckPlate.Replace("-", "").Replace(".", "").Replace(" ", "").ToUpper() == normalizedPlate) ||
                    (v.TrailerPlate != null && v.TrailerPlate.Replace("-", "").Replace(".", "").Replace(" ", "").ToUpper() == normalizedPlate));

            if (vehicle == null)
            {
                return new GateCheckResultDto
                {
                    IsAllowed = false,
                    Status = "REJECTED_UNKNOWN_VEHICLE",
                    Message = "Xe chưa được đăng ký trong hệ thống. Không được phép vào cổng."
                };
            }

            if (vehicle.Status == "INACTIVE")
            {
                return new GateCheckResultDto
                {
                    IsAllowed = false,
                    Status = "REJECTED_INACTIVE_VEHICLE",
                    Message = "Xe đã bị vô hiệu hóa trong hệ thống."
                };
            }

            if (vehicle.IsBlacklisted == true || vehicle.Status == "BLACKLISTED")
            {
                return new GateCheckResultDto
                {
                    IsAllowed = false,
                    Status = "REJECTED_BLACKLISTED",
                    Message = "Xe đang nằm trong danh sách hạn chế. Không được phép vào cổng."
                };
            }

            if (IsInspectionExpired(vehicle))
            {
                return new GateCheckResultDto
                {
                    IsAllowed = false,
                    Status = "REJECTED_INSPECTION_EXPIRED",
                    Message = "Xe đã hết hạn đăng kiểm. Không được phép check-in."
                };
            }

            if (vehicle.Status != "ACTIVE")
            {
                return new GateCheckResultDto
                {
                    IsAllowed = false,
                    Status = "REJECTED_PENDING_APPROVAL",
                    Message = "Xe chưa được phê duyệt. Vui lòng liên hệ điều phối viên."
                };
            }

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var booking = await _context.SlotBookings
                .FirstOrDefaultAsync(b =>
                    b.VehicleId == vehicle.VehicleId &&
                    b.WarehouseId == request.WarehouseId &&
                    b.ScheduledDate == today &&
                    b.Status == "CONFIRMED");

            if (booking == null)
            {
                return new GateCheckResultDto
                {
                    IsAllowed = false,
                    Status = "REJECTED_NO_BOOKING",
                    Message = "Xe đã đăng ký nhưng chưa có lịch vào kho hôm nay."
                };
            }

            booking.Status = "CHECKED_IN";
            booking.CheckInAt = DateTime.UtcNow;
            booking.AlprPlate = normalizedPlate;
            booking.Alprconfidence = request.AlprConfidence;

            _context.GateLogs.Add(new GateLog
            {
                BookingId = booking.BookingId,
                VehicleId = vehicle.VehicleId,
                DriverId = booking.DriverId,
                EventType = "CHECKIN",
                EventAt = DateTime.UtcNow,
                GateCameraSnap = request.GateCameraSnap,
                AlprPlate = normalizedPlate,
                Alprconfidence = request.AlprConfidence,
                OperatorId = operatorId
            });

            await _context.SaveChangesAsync();

            return new GateCheckResultDto
            {
                IsAllowed = true,
                Status = "CHECKIN_APPROVED",
                Message = "Xe hợp lệ. Cho phép check-in.",
                VehicleId = vehicle.VehicleId,
                BookingId = booking.BookingId,
                TruckPlate = vehicle.TruckPlate
            };
        }

        private async Task<Vehicle?> ResolveVehicleAsync(SlotBooking booking, string? cleanPlate)
        {
            if (booking.Vehicle != null)
            {
                return booking.Vehicle;
            }

            if (booking.VehicleId.HasValue)
            {
                return await _context.Vehicles.FindAsync(booking.VehicleId.Value);
            }

            var plateToFind = booking.AlprPlate ?? cleanPlate;
            if (string.IsNullOrWhiteSpace(plateToFind))
            {
                return null;
            }

            var normalizedPlate = NormalizePlate(plateToFind);
            return await _context.Vehicles.FirstOrDefaultAsync(v =>
                v.TruckPlate != null &&
                v.TruckPlate.Replace("-", "").Replace(".", "").Replace(" ", "").ToUpper() == normalizedPlate);
        }

        private static bool IsInspectionExpired(Vehicle? vehicle)
        {
            if (vehicle?.InspectionExpiry == null)
            {
                return false;
            }

            var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
            return vehicle.InspectionExpiry.Value < today;
        }

        private static GateAccessDeniedResponseDto CreateInspectionExpiredDenial(Vehicle? vehicle, string? fallbackPlate)
        {
            return new GateAccessDeniedResponseDto
            {
                AlertType = "INSPECTION_EXPIRED",
                AlarmLevel = "CRITICAL",
                BlockedEntity = "Vehicle",
                Reason = "Xe đã hết hạn đăng kiểm. Không được phép check-in.",
                LicensePlate = vehicle?.TruckPlate ?? fallbackPlate ?? string.Empty
            };
        }
    }
}
