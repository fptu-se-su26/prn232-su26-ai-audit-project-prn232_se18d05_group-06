namespace BACKEND.DTOs
{
    public class DiscrepancyDto
    {
        public int SkuId { get; set; }
        public string SkuCode { get; set; }
        public int SystemQty { get; set; }
        public int ActualQty { get; set; }
        public decimal DiffPercent { get; set; }
    }
}
