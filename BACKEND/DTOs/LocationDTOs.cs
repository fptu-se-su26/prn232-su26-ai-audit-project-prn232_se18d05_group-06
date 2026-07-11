using System.ComponentModel.DataAnnotations;

namespace BACKEND.DTOs
{
    public class LocationSuggestionDto
    {
        public string PlaceId { get; set; } = string.Empty;
        public string MainText { get; set; } = string.Empty;
        public string FullAddress { get; set; } = string.Empty;
        public decimal? Lat { get; set; }
        public decimal? Lng { get; set; }
        public string Source { get; set; } = string.Empty;
    }

    public class LocationSuggestionQuery
    {
        [Required]
        public string Keyword { get; set; } = string.Empty;
        
        public string? Type { get; set; }
    }

    public class CreateServiceOrderRequest
    {
        [Required]
        public int WarehouseID { get; set; }
        
        [Required]
        public string ServiceType { get; set; } = string.Empty;

        public string? PickupAddress { get; set; }
        public decimal? PickupLat { get; set; }
        public decimal? PickupLng { get; set; }

        public string? DeliveryAddress { get; set; }
        public decimal? DeliveryLat { get; set; }
        public decimal? DeliveryLng { get; set; }

        public decimal? TotalWeightKg { get; set; }
        public decimal? TotalCBM { get; set; }
        public int TotalPallets { get; set; }
        public string? DeliverySpeed { get; set; }
        public decimal? EstimatedCost { get; set; }
    }
}
