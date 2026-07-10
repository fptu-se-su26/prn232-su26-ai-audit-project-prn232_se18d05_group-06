using System;
using System.Threading.Tasks;

namespace BACKEND.Services
{
    public class PricingEngineService : IPricingEngineService
    {
        public Task<QuoteResponseDto> CalculateQuoteAsync(QuoteRequestDto request)
        {
            // 1. Calculate distance (Haversine formula)
            double distanceKm = CalculateHaversineDistance(request.PickupLat, request.PickupLng, request.DeliveryLat, request.DeliveryLng);
            
            // If same location or missing, minimum distance 1km
            if (distanceKm < 1) distanceKm = 1;

            // 2. Base calculation
            // Base fare: 15,000 VND
            // Per Km: 5,500 VND
            // Per Kg: 3,000 VND
            // CBM factor: If CBM > 0, we can also factor it (1 CBM ~ 250kg volumetric)
            
            double volumetricWeight = request.Cbm * 250;
            double chargeWeight = Math.Max(request.WeightKg, volumetricWeight);

            decimal baseFare = 15000m;
            decimal distanceFare = (decimal)(distanceKm * 5500);
            decimal weightFare = (decimal)(chargeWeight * 3000);

            decimal totalStandard = baseFare + distanceFare + weightFare;
            
            // Round to nearest 1000
            totalStandard = Math.Round(totalStandard / 1000m) * 1000m;
            decimal totalExpress = Math.Round((totalStandard * 1.5m) / 1000m) * 1000m;

            return Task.FromResult(new QuoteResponseDto
            {
                DistanceKm = Math.Round(distanceKm, 1),
                StandardPrice = totalStandard,
                ExpressPrice = totalExpress,
                StandardTime = distanceKm < 50 ? "Trong ngày" : "2-3 ngày",
                ExpressTime = distanceKm < 50 ? "2-4 giờ" : "Trong ngày"
            });
        }

        private double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            if (lat1 == 0 || lon1 == 0 || lat2 == 0 || lon2 == 0) return 0;

            var R = 6371d; // Earth radius in km
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);
            
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) * 
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            var d = R * c; // Distance in km
            return d;
        }

        private double ToRadians(double angle)
        {
            return Math.PI * angle / 180.0;
        }
    }
}
