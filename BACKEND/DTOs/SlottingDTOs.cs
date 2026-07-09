namespace BACKEND.DTOs
{
    public class SlottingSuggestionDto
    {
        public int Rank { get; set; }
        public int BinId { get; set; }
        public string BinCode { get; set; } = null!;
        public string? BinType { get; set; }
        public string? ShelfCode { get; set; }
        public byte? FloorLevel { get; set; }
        public string? ZoneCode { get; set; }
        public string? ZoneName { get; set; }
        public string? ZoneType { get; set; }
        public decimal CapacityCbm { get; set; }
        public decimal MaxWeightKg { get; set; }
        public decimal CurrentVolumeCbm { get; set; }
        public decimal CurrentWeightKg { get; set; }
        public decimal RequiredVolumeCbm { get; set; }
        public decimal RequiredWeightKg { get; set; }
        public decimal RemainingVolumeCbm { get; set; }
        public decimal RemainingWeightKg { get; set; }
        public int Score { get; set; }
        public string MovementClass { get; set; } = "SLOW";
        public List<string> Reasons { get; set; } = new();
    }

    public class SlottingSuggestionResponseDto
    {
        public int LineId { get; set; }
        public int InboundId { get; set; }
        public int WarehouseId { get; set; }
        public string? SkuCode { get; set; }
        public string? ProductName { get; set; }
        public int QuantityToSlot { get; set; }
        public string StatusCode { get; set; } = "SLOTTING_RECOMMENDED";
        public string Message { get; set; } = null!;
        public List<SlottingSuggestionDto> Suggestions { get; set; } = new();
    }

    public class ConfirmSlottingRequestDto
    {
        public int BinId { get; set; }
        public bool IsAiSuggestion { get; set; } = true;
    }

    public class ConfirmSlottingResponseDto
    {
        public int LineId { get; set; }
        public int BinId { get; set; }
        public string BinCode { get; set; } = null!;
        public string StatusCode { get; set; } = "SLOTTING_CONFIRMED";
        public string Message { get; set; } = null!;
    }
}
