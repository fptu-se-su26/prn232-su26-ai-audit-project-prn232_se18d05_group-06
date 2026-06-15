using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class ServiceCharge
{
    public int ChargeId { get; set; }

    public string ChargeCode { get; set; } = null!;

    public int? OrderId { get; set; }

    public int? InvoiceId { get; set; }

    public string ChargeType { get; set; } = null!;

    public string? Description { get; set; }

    public decimal Amount { get; set; }

    public bool? IsApproved { get; set; }

    public bool? IsAdjustment { get; set; }

    public int? OriginalChargeId { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual ICollection<ServiceCharge> InverseOriginalCharge { get; set; } = new List<ServiceCharge>();

    public virtual Invoice? Invoice { get; set; }

    public virtual ServiceOrder? Order { get; set; }

    public virtual ServiceCharge? OriginalCharge { get; set; }
}
