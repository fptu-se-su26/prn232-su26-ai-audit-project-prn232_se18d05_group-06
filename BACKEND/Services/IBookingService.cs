using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public interface IBookingService
    {
        Task<List<WarehouseDto>> GetWarehousesAsync();
        Task<List<AvailableSlotsResponseDto>> GetAvailableSlotsAsync(int warehouseId, DateTime date);
        Task<BookingResponseDto> CreateBookingAsync(CreateBookingRequestDto dto);
    }
}
