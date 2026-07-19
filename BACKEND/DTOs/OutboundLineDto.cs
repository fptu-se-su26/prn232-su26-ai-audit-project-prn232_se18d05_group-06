namespace BACKEND.DTOs
{
    public class OutboundLineDto
    {
        public int LineId { get; set; }
        public int Skuid { get; set; }
        public string SkuCode { get; set; } = string.Empty;
        public string SkuName { get; set; } = string.Empty;
        public int? BinId { get; set; }
        public string BinCode { get; set; } = string.Empty;
        public string ZoneName { get; set; } = string.Empty;
        public int RequiredQty { get; set; }
        public int PickedQty { get; set; }
        public int RemainingQty => System.Math.Max(0, RequiredQty - PickedQty);
        public string PickingStatus => PickedQty >= RequiredQty ? "COMPLETED" : (PickedQty > 0 ? "PICKING" : "PENDING");
        public string QrLabel { get; set; } = string.Empty;
    }
}
