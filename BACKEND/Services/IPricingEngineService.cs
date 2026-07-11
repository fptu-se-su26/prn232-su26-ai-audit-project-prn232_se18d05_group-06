using System;
using System.Threading.Tasks;

namespace BACKEND.Services
{
    public class QuoteRequestDto
    {
        public double PickupLat { get; set; }
        public double PickupLng { get; set; }
        public double DeliveryLat { get; set; }
        public double DeliveryLng { get; set; }
        public double WeightKg { get; set; }
        public double Cbm { get; set; }
        public string ServiceType { get; set; } = "TRANSPORT";
    }

    public class QuoteResponseDto
    {
        public double DistanceKm { get; set; }
        public decimal StandardPrice { get; set; }
        public decimal ExpressPrice { get; set; }
        public string StandardTime { get; set; } = string.Empty;
        public string ExpressTime { get; set; } = string.Empty;
    }

    public interface IPricingEngineService
    {
        Task<QuoteResponseDto> CalculateQuoteAsync(QuoteRequestDto request);
    }
}
