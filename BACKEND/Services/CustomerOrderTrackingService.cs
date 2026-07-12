using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Services
{
    public class CustomerOrderTrackingService : ICustomerOrderTrackingService
    {
        private readonly SmartLogAiContext _context;

        public CustomerOrderTrackingService(SmartLogAiContext context)
        {
            _context = context;
        }

        public async Task<List<CustomerOrderSummaryDto>> GetCustomerOrdersAsync(int currentUserId)
        {
            var customer = await GetActiveCustomerAsync(currentUserId);

            return await _context.ServiceOrders
                .AsNoTracking()
                .Where(o => o.CustomerId == customer.CustomerId)
                .OrderByDescending(o => o.CreatedAt ?? DateTime.MinValue)
                .ThenByDescending(o => o.OrderId)
                .Select(o => new CustomerOrderSummaryDto
                {
                    OrderId = o.OrderId,
                    OrderCode = o.OrderCode,
                    ServiceType = o.ServiceType,
                    CurrentStatus = o.Status ?? "UNKNOWN",
                    CurrentDisplayStatus = GetStatusDisplay(o.Status),
                    PickupAddress = o.PickupAddress,
                    DeliveryAddress = o.DeliveryAddress,
                    Destination = string.IsNullOrWhiteSpace(o.DeliveryAddress) ? o.Warehouse.WarehouseName : o.DeliveryAddress,
                    WarehouseName = o.Warehouse.WarehouseName,
                    CreatedAt = o.CreatedAt,
                    DeliveredAt = o.DeliveredAt,
                    FinalCost = o.FinalCost,
                    HasInvoice = o.Invoices.Any(),
                    InvoiceId = o.Invoices.OrderByDescending(i => i.InvoiceId).Select(i => (int?)i.InvoiceId).FirstOrDefault(),
                    InvoiceNo = o.Invoices.OrderByDescending(i => i.InvoiceId).Select(i => i.InvoiceNo).FirstOrDefault(),
                    InvoiceStatus = o.Invoices.OrderByDescending(i => i.InvoiceId).Select(i => i.Status).FirstOrDefault(),
                    InvoicePdfPath = o.Invoices.OrderByDescending(i => i.InvoiceId).Select(i => i.Pdfpath).FirstOrDefault(),
                    HasFeedback = o.ServiceFeedbacks.Any(f => f.CustomerId == customer.CustomerId)
                })
                .ToListAsync();
        }

        public async Task<CustomerOrderTrackingResponse> GetOrderTrackingAsync(int orderId, int currentUserId)
        {
            var customer = await GetActiveCustomerAsync(currentUserId);

            var order = await _context.ServiceOrders
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
            {
                throw new KeyNotFoundException($"Order {orderId} was not found.");
            }

            if (order.CustomerId != customer.CustomerId)
            {
                throw new UnauthorizedAccessException("This order does not belong to the current customer.");
            }

            var bookings = await _context.SlotBookings
                .AsNoTracking()
                .Where(b => b.OrderId == order.OrderId)
                .OrderBy(b => b.ScheduledDate)
                .ThenBy(b => b.ScheduledStart)
                .ToListAsync();

            var bookingIds = bookings.Select(b => b.BookingId).ToList();

            var gateLogs = bookingIds.Count == 0
                ? new List<GateLog>()
                : await _context.GateLogs
                    .AsNoTracking()
                    .Where(g => g.BookingId.HasValue && bookingIds.Contains(g.BookingId.Value))
                    .OrderBy(g => g.EventAt)
                    .ToListAsync();

            var outboundOrders = await _context.OutboundOrders
                .AsNoTracking()
                .Where(o => o.OrderId == order.OrderId)
                .OrderBy(o => o.CreatedAt)
                .ToListAsync();

            var dockSessions = bookingIds.Count == 0
                ? new List<VehicleDockSession>()
                : await _context.VehicleDockSessions
                    .AsNoTracking()
                    .Where(s => s.BookingId.HasValue && bookingIds.Contains(s.BookingId.Value))
                    .OrderBy(s => s.DockStartTime)
                    .ToListAsync();

            var timeline = BuildTimeline(order, bookings, gateLogs, outboundOrders, dockSessions);
            MarkCurrentStep(timeline, IsStatus(order.Status, "CANCELLED"));

            return new CustomerOrderTrackingResponse
            {
                OrderId = order.OrderId,
                OrderCode = order.OrderCode,
                ServiceType = order.ServiceType,
                CurrentStatus = order.Status ?? "UNKNOWN",
                CurrentDisplayStatus = GetCurrentDisplayStatus(order, timeline),
                IsCancelled = IsStatus(order.Status, "CANCELLED"),
                Timeline = timeline
            };
        }

        private static List<OrderTrackingStepDto> BuildTimeline(
            ServiceOrder order,
            List<SlotBooking> bookings,
            List<GateLog> gateLogs,
            List<OutboundOrder> outboundOrders,
            List<VehicleDockSession> dockSessions)
        {
            var validBookings = bookings
                .Where(b => IsAnyStatus(b.Status, "CONFIRMED", "CHECKED_IN", "IN_DOCK", "COMPLETED"))
                .ToList();

            var firstValidBooking = validBookings
                .OrderBy(b => b.ScheduledDate)
                .ThenBy(b => b.ScheduledStart)
                .FirstOrDefault();

            var checkInLog = gateLogs
                .Where(g => IsStatus(g.EventType, "CHECKIN"))
                .OrderBy(g => g.EventAt)
                .FirstOrDefault();

            var checkOutLog = gateLogs
                .Where(g => IsStatus(g.EventType, "CHECKOUT"))
                .OrderBy(g => g.EventAt)
                .FirstOrDefault();

            var processingOutbound = outboundOrders
                .Where(o => IsAnyStatus(o.Status, "PICKING", "PACKED"))
                .OrderBy(o => o.CreatedAt)
                .FirstOrDefault();

            var dispatchedOutbound = outboundOrders
                .Where(o => IsStatus(o.Status, "DISPATCHED"))
                .OrderByDescending(o => o.CompletedAt ?? o.CreatedAt ?? DateTime.MinValue)
                .FirstOrDefault();

            var activeDockSession = dockSessions
                .Where(s => IsAnyStatus(s.CurrentStatus, "LOADING", "UNLOADING", "DOCUMENT_CHECKING", "WAITING_AT_DOCK"))
                .OrderBy(s => s.DockStartTime)
                .FirstOrDefault();

            var checkedInBooking = bookings
                .Where(b => b.CheckInAt.HasValue || IsAnyStatus(b.Status, "CHECKED_IN", "IN_DOCK", "COMPLETED"))
                .OrderBy(b => b.CheckInAt ?? ScheduledDateTime(b) ?? DateTime.MaxValue)
                .FirstOrDefault();

            var hasProcessing = IsAnyStatus(order.Status, "PICKING", "IN_STORAGE")
                || processingOutbound != null
                || activeDockSession != null;

            var hasDispatched = IsStatus(order.Status, "DISPATCHED")
                || dispatchedOutbound != null
                || checkOutLog != null;

            return new List<OrderTrackingStepDto>
            {
                new()
                {
                    Step = 1,
                    Code = "ORDER_CREATED",
                    Title = "Đã tạo đơn",
                    Description = "Đơn hàng của bạn đã được tạo trên hệ thống.",
                    Time = order.CreatedAt,
                    IsCompleted = order.CreatedAt.HasValue
                },
                new()
                {
                    Step = 2,
                    Code = "VEHICLE_BOOKED",
                    Title = "Đã đặt lịch xe",
                    Description = "Xe đã được lên lịch vào kho.",
                    Time = firstValidBooking == null ? null : ScheduledDateTime(firstValidBooking),
                    IsCompleted = firstValidBooking != null
                },
                new()
                {
                    Step = 3,
                    Code = "CHECKED_IN_WAREHOUSE",
                    Title = "Đã vào kho",
                    Description = "Xe đã check-in tại cổng kho.",
                    Time = checkInLog?.EventAt ?? checkedInBooking?.CheckInAt,
                    IsCompleted = checkInLog != null || checkedInBooking != null
                },
                new()
                {
                    Step = 4,
                    Code = "PROCESSING",
                    Title = "Đang xử lý",
                    Description = "Đơn hàng đang được kho xử lý.",
                    Time = hasProcessing
                        ? processingOutbound?.CreatedAt ?? activeDockSession?.DockStartTime ?? order.ConfirmedAt
                        : null,
                    IsCompleted = hasProcessing
                },
                new()
                {
                    Step = 5,
                    Code = "DISPATCHED",
                    Title = "Đã xuất kho",
                    Description = "Hàng đã được xuất khỏi kho.",
                    Time = checkOutLog?.EventAt ?? dispatchedOutbound?.CompletedAt,
                    IsCompleted = hasDispatched
                },
                new()
                {
                    Step = 6,
                    Code = "COMPLETED",
                    Title = "Hoàn thành",
                    Description = "Đơn hàng đã hoàn tất.",
                    Time = order.DeliveredAt,
                    IsCompleted = IsStatus(order.Status, "DELIVERED")
                }
            };
        }

        private static void MarkCurrentStep(List<OrderTrackingStepDto> timeline, bool isCancelled)
        {
            foreach (var step in timeline)
            {
                step.IsCurrent = false;
            }

            if (isCancelled)
            {
                return;
            }

            var current = timeline
                .Where(s => s.IsCompleted)
                .OrderByDescending(s => s.Step)
                .FirstOrDefault()
                ?? timeline.FirstOrDefault();

            if (current != null)
            {
                current.IsCurrent = true;
            }
        }

        private static string GetCurrentDisplayStatus(ServiceOrder order, List<OrderTrackingStepDto> timeline)
        {
            if (IsStatus(order.Status, "CANCELLED"))
            {
                return "Đã hủy";
            }

            var current = timeline.FirstOrDefault(s => s.IsCurrent);
            return current?.Title ?? "Chưa có tiến trình";
        }

        private async Task<Customer> GetActiveCustomerAsync(int currentUserId)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.UserId == currentUserId && c.IsActive != false);

            if (customer != null)
            {
                return customer;
            }

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == currentUserId && u.IsActive != false);

            if (user == null || !(IsStatus(user.Role?.RoleCode, "CUSTOMER") || user.RoleId == 4))
            {
                throw new UnauthorizedAccessException("Current user is not linked to an active customer profile.");
            }

            customer = new Customer
            {
                CustomerCode = $"CUST{user.UserId:D8}",
                CompanyName = string.IsNullOrWhiteSpace(user.FullName) ? user.Username : user.FullName,
                ContactName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Tier = "BRONZE",
                TotalOrders12M = 0,
                UserId = user.UserId,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return customer;
        }

        private static string GetStatusDisplay(string? status)
        {
            if (IsStatus(status, "CANCELLED")) return "Đã hủy";
            if (IsStatus(status, "DELIVERED")) return "Hoàn thành";
            if (IsStatus(status, "DISPATCHED")) return "Đang vận chuyển";
            if (IsAnyStatus(status, "PICKING", "IN_STORAGE")) return "Đang xử lý";
            if (IsStatus(status, "CONFIRMED")) return "Đã xác nhận";
            if (IsAnyStatus(status, "PENDING", "CREATED", "PENDING_PAYMENT")) return "Đã tạo đơn";

            return string.IsNullOrWhiteSpace(status) ? "Chưa có trạng thái" : status;
        }

        private static DateTime? ScheduledDateTime(SlotBooking booking)
        {
            return booking.ScheduledDate.ToDateTime(booking.ScheduledStart);
        }

        private static bool IsStatus(string? value, string expected)
        {
            return string.Equals(value?.Trim(), expected, StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsAnyStatus(string? value, params string[] expected)
        {
            return expected.Any(status => IsStatus(value, status));
        }
    }
}