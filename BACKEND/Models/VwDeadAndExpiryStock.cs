using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class VwDeadAndExpiryStock
{
    public string Skucode { get; set; } = null!;

    public string ProductName { get; set; } = null!;

    public string CustomerName { get; set; } = null!;

    public string BinCode { get; set; } = null!;

    public int Quantity { get; set; }

    public DateOnly? ExpiryDate { get; set; }

    public DateOnly? InboundDate { get; set; }

    public int? DaysStored { get; set; }

    public int? DaysToExpiry { get; set; }

    public string AlertType { get; set; } = null!;
}
