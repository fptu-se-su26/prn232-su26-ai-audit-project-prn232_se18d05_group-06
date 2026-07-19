using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class ServiceOrder
{
    public int OrderId { get; set; }

    public string OrderCode { get; set; } = null!;

    public int CustomerId { get; set; }

    public int WarehouseId { get; set; }

    public string ServiceType { get; set; } = null!;

    public string? PickupAddress { get; set; }

    public string? DeliveryAddress { get; set; }

    public decimal? PickupLat { get; set; }

    public decimal? PickupLng { get; set; }

    public decimal? DeliveryLat { get; set; }

    public decimal? DeliveryLng { get; set; }

    public decimal? TotalWeightKg { get; set; }

    public decimal? TotalCbm { get; set; }

    public int? TotalPallets { get; set; }

    public decimal? EstimatedCost { get; set; }

    public int? VoucherId { get; set; }

    public decimal? DiscountAmount { get; set; }

    public decimal? FinalCost { get; set; }

    public string? Status { get; set; }

    public string? Priority { get; set; }

    public int? PriorityScore { get; set; }

    public int? Slaid { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? ConfirmedAt { get; set; }

    public DateTime? DeliveredAt { get; set; }

    public virtual ICollection<Complaint> Complaints { get; set; } = new List<Complaint>();

    public virtual User? CreatedByNavigation { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    public virtual ICollection<OrderLine> OrderLines { get; set; } = new List<OrderLine>();

    public virtual ICollection<OutboundOrder> OutboundOrders { get; set; } = new List<OutboundOrder>();

    public virtual ICollection<ServiceCharge> ServiceCharges { get; set; } = new List<ServiceCharge>();

    public virtual ICollection<ServiceFeedback> ServiceFeedbacks { get; set; } = new List<ServiceFeedback>();

    public virtual Slaconfig? Sla { get; set; }

    public virtual ICollection<SlotBooking> SlotBookings { get; set; } = new List<SlotBooking>();

    public virtual Voucher? Voucher { get; set; }

    public virtual Warehouse Warehouse { get; set; } = null!;

    public virtual ICollection<Waybill> Waybills { get; set; } = new List<Waybill>();
}
