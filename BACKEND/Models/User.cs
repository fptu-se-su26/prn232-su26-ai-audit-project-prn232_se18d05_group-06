using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Username { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Phone { get; set; }

    public int RoleId { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? LastLoginAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<AdjustmentNote> AdjustmentNoteApprovedByNavigations { get; set; } = new List<AdjustmentNote>();

    public virtual ICollection<AdjustmentNote> AdjustmentNoteCreatedByNavigations { get; set; } = new List<AdjustmentNote>();

    public virtual ICollection<Aiparameter> Aiparameters { get; set; } = new List<Aiparameter>();

    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    public virtual ICollection<CargoPhoto> CargoPhotos { get; set; } = new List<CargoPhoto>();

    public virtual ICollection<Complaint> Complaints { get; set; } = new List<Complaint>();

    public virtual ICollection<Customer> Customers { get; set; } = new List<Customer>();

    public virtual ICollection<ExceptionExpense> ExceptionExpenseApprovedByNavigations { get; set; } = new List<ExceptionExpense>();

    public virtual ICollection<ExceptionExpense> ExceptionExpenseRequestedByNavigations { get; set; } = new List<ExceptionExpense>();

    public virtual ICollection<Faqitem> Faqitems { get; set; } = new List<Faqitem>();

    public virtual ICollection<GateLog> GateLogs { get; set; } = new List<GateLog>();

    public virtual ICollection<InboundOrder> InboundOrders { get; set; } = new List<InboundOrder>();

    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    public virtual ICollection<OutboundOrder> OutboundOrders { get; set; } = new List<OutboundOrder>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual Role Role { get; set; } = null!;

    public virtual ICollection<ServiceCharge> ServiceCharges { get; set; } = new List<ServiceCharge>();

    public virtual ICollection<ServiceOrder> ServiceOrders { get; set; } = new List<ServiceOrder>();

    public virtual ICollection<SlotBooking> SlotBookings { get; set; } = new List<SlotBooking>();

    public virtual ICollection<StockLedger> StockLedgers { get; set; } = new List<StockLedger>();

    public virtual ICollection<StockTransfer> StockTransfers { get; set; } = new List<StockTransfer>();

    public virtual ICollection<StockWriteOff> StockWriteOffApprovedByNavigations { get; set; } = new List<StockWriteOff>();

    public virtual ICollection<StockWriteOff> StockWriteOffCreatedByNavigations { get; set; } = new List<StockWriteOff>();

    public virtual ICollection<StocktakeOrder> StocktakeOrders { get; set; } = new List<StocktakeOrder>();

    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
