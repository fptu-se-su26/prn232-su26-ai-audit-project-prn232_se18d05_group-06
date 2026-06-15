using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Dock
{
    public int DockId { get; set; }

    public int WarehouseId { get; set; }

    public string DockCode { get; set; } = null!;

    public string? DockName { get; set; }

    public string? Status { get; set; }

    public decimal? MaxTruckLength { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<SlotBooking> SlotBookings { get; set; } = new List<SlotBooking>();

    public virtual Warehouse Warehouse { get; set; } = null!;
}
