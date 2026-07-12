namespace BACKEND.DTOs;

public class InventoryComparisonDto
{
    public int SkuId { get; set; }
    public string SkuCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int SystemQty { get; set; }
    public int ActualQty { get; set; }
    public int Difference { get; set; }
    public decimal VariancePct { get; set; }
    public string Status { get; set; } = string.Empty;
    public string ZoneCode { get; set; } = string.Empty;
    public string BinCode { get; set; } = string.Empty;
}

public class InventoryComparisonResponseDto
{
    public List<InventoryComparisonDto> Data { get; set; } = new();
    public int TotalItems { get; set; }
    public int Matched { get; set; }
    public int Mismatches { get; set; }
    public string ZoneCode { get; set; } = string.Empty;
}

public class ReconcileRequestDto
{
    public List<int> InventoryIds { get; set; } = new();
}
