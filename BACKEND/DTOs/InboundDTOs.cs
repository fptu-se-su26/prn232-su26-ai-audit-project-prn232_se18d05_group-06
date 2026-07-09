namespace BACKEND.DTOs
{
    public class InboundOrderDto
    {
        public int InboundId { get; set; }
        public string InboundCode { get; set; } = null!;
        public string? CustomerName { get; set; }
        public string? WarehouseName { get; set; }
        public string? Status { get; set; }
        public DateOnly? ActualDate { get; set; }
        public List<InboundLineDto> Lines { get; set; } = new();
    }

    public class InboundLineDto
    {
        public int LineId { get; set; }
        public string? Skucode { get; set; }
        public string? ProductName { get; set; }
        public int ExpectedQty { get; set; }
        public int? ReceivedQty { get; set; }
        public string? ConditionStatus { get; set; }
        public string? BinCode { get; set; }
        public string? AiSlottedBinCode { get; set; }
        public int PhotoCount { get; set; }

        // UC002: damaged packages must have at least 2 photos.
        public bool RequiresMinPhotos { get; set; }
        public int MinPhotos { get; set; }

        public List<CargoPhotoDto> Photos { get; set; } = new();
    }

    public class CargoPhotoDto
    {
        public int PhotoId { get; set; }
        public string PhotoUrl { get; set; } = null!;
        public string? PhotoAngle { get; set; }
        public bool IsDamaged { get; set; }
        public DateTime? TakenAt { get; set; }
    }
}
