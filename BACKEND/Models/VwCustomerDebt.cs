using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class VwCustomerDebt
{
    public string CustomerCode { get; set; } = null!;

    public string CompanyName { get; set; } = null!;

    public string? Tier { get; set; }

    public int? TotalInvoices { get; set; }

    public decimal? TotalBilled { get; set; }

    public decimal? TotalPaid { get; set; }

    public decimal? OutstandingDebt { get; set; }

    public decimal? OverdueDebt { get; set; }

    public DateOnly? LatestDueDate { get; set; }
}
