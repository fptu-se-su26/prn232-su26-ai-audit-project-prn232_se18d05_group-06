using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Voucher
{
    public int VoucherId { get; set; }

    public string VoucherCode { get; set; } = null!;

    public string? CustomerTier { get; set; }

    public int? CustomerId { get; set; }

    public decimal? DiscountPct { get; set; }

    public decimal? DiscountAmount { get; set; }

    public decimal? MinOrderValue { get; set; }

    public DateOnly ValidFrom { get; set; }

    public DateOnly ValidTo { get; set; }

    public bool? IsUsed { get; set; }

    public DateTime? UsedAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Customer? Customer { get; set; }

    public virtual ICollection<ServiceOrder> ServiceOrders { get; set; } = new List<ServiceOrder>();
}
