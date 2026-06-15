using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Slaconfig
{
    public int Slaid { get; set; }

    public string PartnerTier { get; set; } = null!;

    public int MaxWaitHours { get; set; }

    public int MaxDockhours { get; set; }

    public decimal? CompensationPct { get; set; }

    public string? Description { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Customer> Customers { get; set; } = new List<Customer>();

    public virtual ICollection<ServiceOrder> ServiceOrders { get; set; } = new List<ServiceOrder>();
}
