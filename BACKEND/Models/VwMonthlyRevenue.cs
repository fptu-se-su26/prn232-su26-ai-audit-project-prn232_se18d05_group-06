using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class VwMonthlyRevenue
{
    public int? RevenueYear { get; set; }

    public int? RevenueMonth { get; set; }

    public int? TotalInvoices { get; set; }

    public decimal? NetRevenue { get; set; }

    public decimal? TotalVat { get; set; }

    public decimal? GrossRevenue { get; set; }

    public decimal? CollectedAmount { get; set; }

    public decimal? OutstandingAmount { get; set; }
}
