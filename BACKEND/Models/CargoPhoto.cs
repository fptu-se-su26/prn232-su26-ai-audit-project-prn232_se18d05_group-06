using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class CargoPhoto
{
    public int PhotoId { get; set; }

    public int LineId { get; set; }

    public string PhotoUrl { get; set; } = null!;

    public string? PhotoAngle { get; set; }

    public bool? IsDamaged { get; set; }

    public int? TakenBy { get; set; }

    public DateTime? TakenAt { get; set; }

    public virtual InboundOrderLine Line { get; set; } = null!;

    public virtual User? TakenByNavigation { get; set; }
}
