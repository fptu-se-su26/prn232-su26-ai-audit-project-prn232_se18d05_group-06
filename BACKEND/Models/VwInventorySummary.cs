using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class VwInventorySummary
{
    public string Skucode { get; set; } = null!;

    public string ProductName { get; set; } = null!;

    public string CustomerName { get; set; } = null!;

    public string? CategoryName { get; set; }

    public int? TotalQty { get; set; }

    public int? SafetyMinQty { get; set; }

    public int IsLowStock { get; set; }

    public DateOnly? NearestExpiry { get; set; }

    public DateOnly? OldestInbound { get; set; }

    public int? DaysInStock { get; set; }
}
