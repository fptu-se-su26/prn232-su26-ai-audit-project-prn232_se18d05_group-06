using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;
using QRCoder;

namespace BACKEND.Services
{
    public class BookingService : IBookingService
    {
        private readonly SmartLogAiContext _context;
        private readonly IEmailService _emailService;

        public BookingService(SmartLogAiContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        private async Task EnsureDocksSeededAsync()
        {
            var hasDocks = await _context.Docks.AnyAsync();
            if (!hasDocks)
            {
                var warehouses = await _context.Warehouses.ToListAsync();
                if (warehouses.Count == 0)
                {
                    // Add default warehouses if none exist to prevent foreign key errors
                    var wh1 = new Warehouse { WarehouseCode = "WH01", WarehouseName = "Kho Tổng Miền Bắc (Hà Nội)", Address = "Khu Công Nghiệp Quang Minh, Mê Linh, Hà Nội" };
                    var wh2 = new Warehouse { WarehouseCode = "WH02", WarehouseName = "Kho Trung Chuyển (HCM)", Address = "Khu Công Nghiệp Tân Bình, Tân Phú, TP. Hồ Chí Minh" };
                    _context.Warehouses.AddRange(wh1, wh2);
                    await _context.SaveChangesAsync();
                    warehouses = await _context.Warehouses.ToListAsync();
                }

                var defaultDocks = new List<Dock>();
                foreach (var wh in warehouses)
                {
                    // Add 3 docks for warehouse 1, 2 docks for others
                    int dockCount = (wh.WarehouseId == warehouses[0].WarehouseId) ? 3 : 2;
                    for (int i = 1; i <= dockCount; i++)
                    {
                        defaultDocks.Add(new Dock
                        {
                            WarehouseId = wh.WarehouseId,
                            DockCode = $"DOCK-WH{wh.WarehouseId}-0{i}",
                            DockName = $"Cửa kho 0{i}",
                            Status = "AVAILABLE",
                            MaxTruckLength = 15.00m,
                            IsActive = true
                        });
                    }
                }

                _context.Docks.AddRange(defaultDocks);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<WarehouseDto>> GetWarehousesAsync()
        {
            await EnsureDocksSeededAsync();
            return await _context.Warehouses
                .Select(w => new WarehouseDto
                {
                    WarehouseId = w.WarehouseId,
                    WarehouseName = w.WarehouseName,
                    Address = w.Address
                })
                .ToListAsync();
        }

        public async Task<List<AvailableSlotsResponseDto>> GetAvailableSlotsAsync(int warehouseId, DateTime date)
        {
            await EnsureDocksSeededAsync();

            // 1. Get all active docks for this warehouse
            var docks = await _context.Docks
                .Where(d => d.WarehouseId == warehouseId && d.IsActive == true)
                .ToListAsync();

            // 2. Get all slot bookings for this warehouse on the specified date
            var targetDate = DateOnly.FromDateTime(date);
            var bookings = await _context.SlotBookings
                .Include(sb => sb.Vehicle)
                .Where(sb => sb.WarehouseId == warehouseId && sb.ScheduledDate == targetDate && sb.Status != "CANCELLED")
                .ToListAsync();

            // Predefined 2-hour slots
            var predefinedSlots = new List<(string Range, string Start, string End)>
            {
                ("08:00 - 10:00", "08:00", "10:00"),
                ("10:00 - 12:00", "10:00", "12:00"),
                ("13:00 - 15:00", "13:00", "15:00"),
                ("15:00 - 17:00", "15:00", "17:00"),
                ("17:00 - 19:00", "17:00", "19:00")
            };

            var result = new List<AvailableSlotsResponseDto>();

            foreach (var dock in docks)
            {
                var dockDto = new AvailableSlotsResponseDto
                {
                    DockName = dock.DockCode, // Using DockCode as the display identifier
                    Slots = new List<SlotInfo>()
                };

                foreach (var slot in predefinedSlots)
                {
                    var slotStart = TimeOnly.Parse(slot.Start);
                    var slotEnd = TimeOnly.Parse(slot.End);

                    // Overlap check on same dock
                    var matchingBooking = bookings.FirstOrDefault(b =>
                        b.DockId == dock.DockId &&
                        b.ScheduledStart < slotEnd &&
                        b.ScheduledEnd > slotStart);

                    var isAvailable = matchingBooking == null;
                    var bookedPlate = matchingBooking?.Vehicle?.TruckPlate;

                    dockDto.Slots.Add(new SlotInfo
                    {
                        TimeRange = slot.Range,
                        StartTime = slot.Start,
                        EndTime = slot.End,
                        IsAvailable = isAvailable,
                        BookedLicensePlate = bookedPlate
                    });
                }

                result.Add(dockDto);
            }

            return result;
        }

        public async Task<BookingResponseDto> CreateBookingAsync(CreateBookingRequestDto dto)
        {
            await EnsureDocksSeededAsync();

            // 1. Validate warehouse
            var warehouse = await _context.Warehouses.FindAsync(dto.WarehouseId);
            if (warehouse == null)
            {
                throw new Exception($"Không tìm thấy kho hàng có ID: {dto.WarehouseId}");
            }

            // 2. Validate dock existence using DockCode
            var dock = await _context.Docks
                .FirstOrDefaultAsync(d => d.WarehouseId == dto.WarehouseId && d.DockCode == dto.DockName && d.IsActive == true);
            if (dock == null)
            {
                throw new Exception($"Cửa kho '{dto.DockName}' không tồn tại hoặc không khả dụng ở kho này.");
            }

            // 3. Parse start and end offsets
            var startOffset = TimeOnly.Parse(dto.StartTime);
            var endOffset = TimeOnly.Parse(dto.EndTime);
            var bookingDateOnly = DateOnly.FromDateTime(dto.BookingDate);
            var startDateTime = dto.BookingDate.Date + startOffset.ToTimeSpan();
            var endDateTime = dto.BookingDate.Date + endOffset.ToTimeSpan();

            // 4. Check for double booking (overlapping slots on the same dock)
            var conflict = await _context.SlotBookings
                .AnyAsync(sb => sb.WarehouseId == dto.WarehouseId &&
                                sb.DockId == dock.DockId &&
                                sb.ScheduledDate == bookingDateOnly &&
                                sb.Status != "CANCELLED" &&
                                sb.ScheduledStart < endOffset &&
                                sb.ScheduledEnd > startOffset);

            if (conflict)
            {
                throw new Exception($"Trùng lịch: Cửa kho '{dto.DockName}' đã được đặt cho khung giờ {dto.StartTime} - {dto.EndTime} vào ngày {dto.BookingDate:dd/MM/yyyy}.");
            }

            // 5. Find or create the vehicle based on LicensePlate (maps to TruckPlate column)
            var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.TruckPlate == dto.LicensePlate);
            if (vehicle == null)
            {
                vehicle = new Vehicle
                {
                    TruckPlate = dto.LicensePlate,
                    VehicleType = "TEMP_ALPR",
                    MaxWeightTon = 0.0m,
                    InspectionExpiry = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
                    NextServiceDate = DateOnly.FromDateTime(DateTime.UtcNow),
                    Status = "PENDING",
                    IsTempProfile = true,
                    TempExpiryAt = DateTime.UtcNow.AddDays(7)
                };
                _context.Vehicles.Add(vehicle);
                await _context.SaveChangesAsync();
            }

            // 6. Generate Booking ID (BookingCode)
            var bookingCode = $"SLOT-WH{dto.WarehouseId}-{new Random().Next(100000, 999999)}";

            // 7. Construct QR Code Content (within VARCHAR(500) limit)
            var qrContent = $"BookingCode: {bookingCode}\nWarehouse: {warehouse.WarehouseName}\nDock: {dock.DockCode}\nVehicle: {dto.LicensePlate}\nTime: {dto.StartTime}-{dto.EndTime} on {dto.BookingDate:dd/MM/yyyy}";

            // Generate QR Code image Base64 using QRCoder PngByteQRCode
            string qrCodeBase64 = string.Empty;
            using (var qrGenerator = new QRCodeGenerator())
            {
                var qrCodeData = qrGenerator.CreateQrCode(qrContent, QRCodeGenerator.ECCLevel.Q);
                using (var qrCode = new PngByteQRCode(qrCodeData))
                {
                    byte[] qrCodeBytes = qrCode.GetGraphic(20);
                    qrCodeBase64 = Convert.ToBase64String(qrCodeBytes);
                }
            }

            // 8. Create the SlotBooking record
            var slotBooking = new SlotBooking
            {
                BookingCode = bookingCode,
                Qrcode = qrContent, // Fits safely inside VARCHAR(500) limit
                VehicleId = vehicle.VehicleId,
                WarehouseId = dto.WarehouseId,
                DockId = dock.DockId,
                BookingType = "INBOUND",
                ScheduledDate = bookingDateOnly,
                ScheduledStart = startOffset,
                ScheduledEnd = endOffset,
                Status = "CONFIRMED",
                CreatedAt = DateTime.UtcNow
            };

            _context.SlotBookings.Add(slotBooking);
            await _context.SaveChangesAsync();

            // 9. Dispatch confirmation email
            await _emailService.SendBookingConfirmationEmailAsync(
                dto.DriverEmail,
                bookingCode,
                dto.LicensePlate,
                dock.DockCode,
                warehouse.WarehouseName,
                startDateTime,
                endDateTime,
                qrCodeBase64
            );

            return new BookingResponseDto
            {
                ReceiptId = slotBooking.BookingId,
                BookingId = bookingCode,
                WarehouseId = dto.WarehouseId,
                WarehouseName = warehouse.WarehouseName,
                DockName = dock.DockCode,
                StartTime = startDateTime,
                EndTime = endDateTime,
                LicensePlate = dto.LicensePlate,
                DriverEmail = dto.DriverEmail,
                Status = "CONFIRMED",
                QrCodeBase64 = qrCodeBase64
            };
        }
    }
}
