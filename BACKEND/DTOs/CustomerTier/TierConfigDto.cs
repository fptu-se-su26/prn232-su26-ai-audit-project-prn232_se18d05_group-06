using System;

namespace BACKEND.DTOs.CustomerTier;

public class TierConfigDto
{
    public int TierId { get; set; }
    public string TierName { get; set; } = null!;
    public string TierCode { get; set; } = null!;
    public int MinOrders { get; set; }
    public decimal MinRevenue { get; set; }
    public decimal DiscountPercent { get; set; }
    public bool IsActive { get; set; }
}
