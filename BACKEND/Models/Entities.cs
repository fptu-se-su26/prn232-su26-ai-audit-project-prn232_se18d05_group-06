using System;
using System.Collections.Generic;

namespace BACKEND.Models
{
    public class Order
    {
        public int OrderId { get; set; }
        public int? CustomerId { get; set; }
        public DateTime? OrderDate { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string SenderPhone { get; set; } = string.Empty;
        public string PickupAddress { get; set; } = string.Empty;
        public decimal? PickupLatitude { get; set; }
        public decimal? PickupLongitude { get; set; }
        public string ReceiverName { get; set; } = string.Empty;
        public string ReceiverPhone { get; set; } = string.Empty;
        public string DeliveryAddress { get; set; } = string.Empty;
        public decimal? DeliveryLatitude { get; set; }
        public decimal? DeliveryLongitude { get; set; }
        public decimal TotalWeight { get; set; }
        public decimal ShippingFee { get; set; }
        public int? VoucherId { get; set; }
        public decimal FinalAmount { get; set; }
        public decimal CodAmount { get; set; }
        public int? PartnerId { get; set; }
        public string OrderStatus { get; set; } = "DRAFT";

        // Navigation properties
        public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
        public virtual ICollection<Waybill> Waybills { get; set; } = new List<Waybill>();
    }

    public class OrderDetail
    {
        public int OrderDetailId { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }

        // Navigation properties
        public virtual Order? Order { get; set; }
        public virtual Product? Product { get; set; }
    }

    public class Product
    {
        public int ProductId { get; set; }
        public string Sku { get; set; } = string.Empty;
        public string? Barcode { get; set; }
        public string? QrCode { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int? CategoryId { get; set; }
        public decimal Weight { get; set; }
        public decimal Volume { get; set; }
        public int SafetyThreshold { get; set; } = 10;
        public bool? IsFragile { get; set; }
        public bool? IsHeavy { get; set; }
        public DateTime? CreatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
        public virtual ICollection<WarehouseStock> WarehouseStocks { get; set; } = new List<WarehouseStock>();
    }

    public class WarehouseStock
    {
        public int WarehouseId { get; set; }
        public int ProductId { get; set; }
        public int LocationId { get; set; }
        public int Quantity { get; set; }

        // Navigation properties
        public virtual Product? Product { get; set; }
        public virtual WarehouseLocation? WarehouseLocation { get; set; }
    }

    public class WarehouseLocation
    {
        public int LocationId { get; set; }
        public int? WarehouseId { get; set; }
        public string Aisle { get; set; } = string.Empty;
        public string Shelf { get; set; } = string.Empty;
        public string Row { get; set; } = string.Empty;
        public decimal MaxVolume { get; set; }
        public decimal MaxWeight { get; set; }
        public bool? IsOccupied { get; set; }

        // Navigation properties
        public virtual ICollection<WarehouseStock> WarehouseStocks { get; set; } = new List<WarehouseStock>();
    }

    public class Waybill
    {
        public int WaybillId { get; set; }
        public string WaybillCode { get; set; } = string.Empty;
        public int OrderId { get; set; }
        public string QrCodeBase64 { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "SUCCESS";

        // Navigation properties
        public virtual Order? Order { get; set; }
    }

    public class Vehicle
    {
        public int VehicleId { get; set; }
        public string LicensePlate { get; set; } = string.Empty;
        public string VehicleModel { get; set; } = string.Empty;
        public decimal PayloadKg { get; set; }
        public decimal VolumeCbm { get; set; }
        public DateTime InsuranceExpiry { get; set; }
        public DateTime RegistrationExpiry { get; set; }
        public decimal FuelConsumptionRate { get; set; }
        public string Status { get; set; } = "AVAILABLE";
        public bool IsTempProfile { get; set; } = false;
        public DateTime? TempExpiryAt { get; set; }
    }

    public class Warehouse
    {
        public int WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? ContactNumber { get; set; }
    }

    public class ReceiptOrder
    {
        public int ReceiptId { get; set; }
        public int? WarehouseId { get; set; }
        public string? InvoiceNo { get; set; }
        public string? OcrRawText { get; set; }
        public DateTime ReceiptDate { get; set; }
        public int? CreatedBy { get; set; }
        public string Status { get; set; } = "PENDING";
    }

    public class Dock
    {
        public int DockId { get; set; }
        public int WarehouseId { get; set; }
        public string DockCode { get; set; } = string.Empty;
        public string? DockName { get; set; }
        public string Status { get; set; } = "AVAILABLE";
        public decimal? MaxTruckLength { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual Warehouse? Warehouse { get; set; }
        public virtual ICollection<SlotBooking> SlotBookings { get; set; } = new List<SlotBooking>();
    }

    public class SlotBooking
    {
        public int BookingId { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public string? QRCode { get; set; }
        public int? VehicleId { get; set; }
        public int? DriverId { get; set; }
        public int? CustomerId { get; set; }
        public int WarehouseId { get; set; }
        public int? DockId { get; set; }
        public int? OrderId { get; set; }
        public string BookingType { get; set; } = "INBOUND";
        public DateTime ScheduledDate { get; set; }
        public TimeSpan ScheduledStart { get; set; }
        public TimeSpan ScheduledEnd { get; set; }
        public string Status { get; set; } = "CONFIRMED";
        public DateTime? CheckInAt { get; set; }
        public DateTime? CheckOutAt { get; set; }
        public bool? OverstayAlert { get; set; }
        public string? AlprPlate { get; set; }
        public decimal? AlprConfidence { get; set; }
        public int? PriorityScore { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Vehicle? Vehicle { get; set; }
        public virtual Warehouse? Warehouse { get; set; }
        public virtual Dock? Dock { get; set; }
        public virtual Order? Order { get; set; }
    }
}
