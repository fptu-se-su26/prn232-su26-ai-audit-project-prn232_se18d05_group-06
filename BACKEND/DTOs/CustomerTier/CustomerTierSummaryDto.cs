using System;

namespace BACKEND.DTOs.CustomerTier;

public class CustomerTierSummaryDto
{
    public string TierCode { get; set; } = null!;
    public string TierName { get; set; } = null!;
    public int CustomerCount { get; set; }
    public decimal DiscountPercent { get; set; }
}
