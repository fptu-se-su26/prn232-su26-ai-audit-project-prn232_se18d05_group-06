namespace BACKEND.DTOs
{
    public class CustomerOrderSummaryDto
    {
        public int OrderId { get; set; }
        public string OrderCode { get; set; } = null!;
        public string ServiceType { get; set; } = null!;
        public string CurrentStatus { get; set; } = null!;
        public string CurrentDisplayStatus { get; set; } = null!;
        public string? PickupAddress { get; set; }
        public string? DeliveryAddress { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public decimal? FinalCost { get; set; }
    }

    public class CustomerOrderTrackingResponse
    {
        public int OrderId { get; set; }
        public string OrderCode { get; set; } = null!;
        public string ServiceType { get; set; } = null!;
        public string CurrentStatus { get; set; } = null!;
        public string CurrentDisplayStatus { get; set; } = null!;
        public bool IsCancelled { get; set; }
        public List<OrderTrackingStepDto> Timeline { get; set; } = new();
    }

    public class OrderTrackingStepDto
    {
        public int Step { get; set; }
        public string Code { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime? Time { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsCurrent { get; set; }
    }
}
