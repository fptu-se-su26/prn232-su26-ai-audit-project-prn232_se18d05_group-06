using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BACKEND.DTOs;
using BACKEND.Services;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // GET: api/bookings/warehouses
        [HttpGet("warehouses")]
        public async Task<ActionResult<List<WarehouseDto>>> GetWarehouses()
        {
            try
            {
                var warehouses = await _bookingService.GetWarehousesAsync();
                return Ok(warehouses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        // GET: api/bookings/available-slots
        [HttpGet("available-slots")]
        public async Task<ActionResult<List<AvailableSlotsResponseDto>>> GetAvailableSlots([FromQuery] int warehouseId, [FromQuery] string date)
        {
            if (warehouseId <= 0)
            {
                return BadRequest("WarehouseId không hợp lệ.");
            }

            if (!DateTime.TryParse(date, out DateTime parsedDate))
            {
                return BadRequest("Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD.");
            }

            try
            {
                var slots = await _bookingService.GetAvailableSlotsAsync(warehouseId, parsedDate);
                return Ok(slots);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        // POST: api/bookings/create
        [HttpPost("create")]
        public async Task<ActionResult<BookingResponseDto>> CreateBooking([FromBody] CreateBookingRequestDto request)
        {
            if (request == null)
            {
                return BadRequest("Dữ liệu yêu cầu trống.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var response = await _bookingService.CreateBookingAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                // Return Bad Request for validation errors like double bookings
                if (ex.Message.Contains("hết hạn đăng kiểm"))
                {
                    return BadRequest(ex.Message);
                }

                if (ex.Message.Contains("Trùng lịch") || ex.Message.Contains("không tồn tại"))
                {
                    return BadRequest(ex.Message);
                }
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }

        // GET: api/bookings/dispatcher-orders
        [HttpGet("dispatcher-orders")]
        public async Task<ActionResult<List<DispatcherOrderDto>>> GetDispatcherOrders()
        {
            try
            {
                var orders = await _bookingService.GetDispatcherOrdersAsync();
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }
    }
}
