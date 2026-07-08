using System.ComponentModel.DataAnnotations;

namespace BACKEND.DTOs
{
    public class CheckoutRequestDto
    {
        public string? AlprPlate { get; set; }
        public string? BookingCode { get; set; }
    }
}
