using System;

namespace BACKEND.DTOs.CustomerTier;

public class CustomerTierDto
{
    public int CustomerId { get; set; }
    public string CustomerCode { get; set; } = null!;
    public string CompanyName { get; set; } = null!;
    public string? Tier { get; set; }
    public DateOnly? TierUpdatedAt { get; set; }
    public int? TotalOrders12M { get; set; }
    public decimal TotalRevenue12M { get; set; }
}
