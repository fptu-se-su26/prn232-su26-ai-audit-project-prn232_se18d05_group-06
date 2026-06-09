namespace BACKEND.DTOs
{
    public class PickingListItemDto
    {
        public string ProductSku { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int QuantityToPick { get; set; }
        public string ZoneName { get; set; } = string.Empty;
        public string BinName { get; set; } = string.Empty;
    }
}
