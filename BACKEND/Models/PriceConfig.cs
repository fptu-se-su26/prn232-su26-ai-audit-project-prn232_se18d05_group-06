using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class PriceConfig
{
    public int PriceId { get; set; }

    public string ServiceType { get; set; } = null!;

    public string? Zone { get; set; }

    public decimal BasePrice { get; set; }

    public string? Unit { get; set; }

    public string? SurchargeType { get; set; }

    public decimal? SurchargeValue { get; set; }

    public DateOnly EffectiveFrom { get; set; }

    public DateOnly? EffectiveTo { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }
}
