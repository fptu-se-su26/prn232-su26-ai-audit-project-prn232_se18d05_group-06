using System.Threading.Tasks;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public interface IGateService
    {
        Task<ActiveBookingSummaryDto?> GetActiveBookingAsync(string search);
        Task<CheckoutResponseDto> ProcessCheckoutAsync(CheckoutRequestDto request, int? operatorId);
        Task<object> ProcessCheckInAsync(GateCheckInRequestDto request, int? operatorId);
    }
}
