using Microsoft.EntityFrameworkCore;

namespace BACKEND.Models
{
    public class SmartLogDbContext : DbContext
    {
        public SmartLogDbContext(DbContextOptions<SmartLogDbContext> options) : base(options)
        {
        }

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<WarehouseStock> WarehouseStocks { get; set; }
        public DbSet<WarehouseLocation> WarehouseLocations { get; set; }
        public DbSet<Waybill> Waybills { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<ReceiptOrder> ReceiptOrders { get; set; }
        public DbSet<Dock> Docks { get; set; }
        public DbSet<SlotBooking> SlotBookings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Vehicle
            modelBuilder.Entity<Vehicle>(entity =>
            {
                entity.ToTable("Vehicles");
                entity.HasKey(e => e.VehicleId);
                entity.Property(e => e.VehicleId).HasColumnName("VehicleID");
                entity.HasIndex(e => e.LicensePlate).IsUnique();
                entity.Property(e => e.LicensePlate).HasColumnName("TruckPlate").HasMaxLength(20).IsUnicode(false);
                entity.Property(e => e.VehicleModel).HasColumnName("VehicleType").HasMaxLength(50).IsUnicode(true);
                entity.Property(e => e.PayloadKg).HasColumnName("MaxWeightTon").HasColumnType("decimal(8,2)");
                entity.Ignore(e => e.VolumeCbm);
                entity.Ignore(e => e.FuelConsumptionRate);
                entity.Property(e => e.Status).HasMaxLength(20).IsUnicode(false).HasDefaultValue("ACTIVE");
                entity.Property(e => e.InsuranceExpiry).HasColumnName("InspectionExpiry").HasColumnType("date");
                entity.Property(e => e.RegistrationExpiry).HasColumnName("NextServiceDate").HasColumnType("date");
                entity.Property(e => e.IsTempProfile).HasColumnName("IsTempProfile");
                entity.Property(e => e.TempExpiryAt).HasColumnName("TempExpiryAt");
            });

            // Configure Order
            modelBuilder.Entity<Order>(entity =>
            {
                entity.ToTable("Orders");
                entity.HasKey(e => e.OrderId);
                entity.Property(e => e.PickupLatitude).HasColumnType("decimal(9,6)");
                entity.Property(e => e.PickupLongitude).HasColumnType("decimal(9,6)");
                entity.Property(e => e.DeliveryLatitude).HasColumnType("decimal(9,6)");
                entity.Property(e => e.DeliveryLongitude).HasColumnType("decimal(9,6)");
                entity.Property(e => e.TotalWeight).HasColumnType("decimal(10,2)");
                entity.Property(e => e.ShippingFee).HasColumnType("decimal(18,2)");
                entity.Property(e => e.FinalAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.CodAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.OrderStatus).HasMaxLength(30).IsUnicode(false);
            });

            // Configure OrderDetail
            modelBuilder.Entity<OrderDetail>(entity =>
            {
                entity.ToTable("OrderDetails");
                entity.HasKey(e => e.OrderDetailId);

                entity.HasOne(d => d.Order)
                    .WithMany(p => p.OrderDetails)
                    .HasForeignKey(d => d.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.Product)
                    .WithMany(p => p.OrderDetails)
                    .HasForeignKey(d => d.ProductId);
            });

            // Configure Product
            modelBuilder.Entity<Product>(entity =>
            {
                entity.ToTable("Products");
                entity.HasKey(e => e.ProductId);
                entity.Property(e => e.Sku).HasMaxLength(50).IsUnicode(false);
                entity.Property(e => e.Barcode).HasMaxLength(50).IsUnicode(false);
                entity.Property(e => e.QrCode).HasMaxLength(100).IsUnicode(false);
                entity.Property(e => e.Weight).HasColumnType("decimal(10,2)");
                entity.Property(e => e.Volume).HasColumnType("decimal(10,2)");
            });

            // Configure WarehouseLocation
            modelBuilder.Entity<WarehouseLocation>(entity =>
            {
                entity.ToTable("WarehouseLocations");
                entity.HasKey(e => e.LocationId);
                entity.Property(e => e.Aisle).HasMaxLength(10).IsUnicode(false);
                entity.Property(e => e.Shelf).HasMaxLength(10).IsUnicode(false);
                entity.Property(e => e.Row).HasMaxLength(10).IsUnicode(false);
                entity.Property(e => e.MaxVolume).HasColumnType("decimal(10,2)");
                entity.Property(e => e.MaxWeight).HasColumnType("decimal(10,2)");
            });

            // Configure WarehouseStock
            modelBuilder.Entity<WarehouseStock>(entity =>
            {
                entity.ToTable("WarehouseStocks");
                entity.HasKey(e => new { e.WarehouseId, e.ProductId, e.LocationId });

                entity.HasOne(d => d.Product)
                    .WithMany(p => p.WarehouseStocks)
                    .HasForeignKey(d => d.ProductId);

                entity.HasOne(d => d.WarehouseLocation)
                    .WithMany(p => p.WarehouseStocks)
                    .HasForeignKey(d => d.LocationId);
            });

            // Configure Waybill
            modelBuilder.Entity<Waybill>(entity =>
            {
                entity.ToTable("Waybills");
                entity.HasKey(e => e.WaybillId);
                entity.Property(e => e.WaybillCode).HasMaxLength(50).IsUnicode(false);
                entity.Property(e => e.Status).HasMaxLength(20).IsUnicode(false);

                entity.HasOne(d => d.Order)
                    .WithMany(p => p.Waybills)
                    .HasForeignKey(d => d.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Warehouse
            modelBuilder.Entity<Warehouse>(entity =>
            {
                entity.ToTable("Warehouses");
                entity.HasKey(e => e.WarehouseId);
                entity.Property(e => e.WarehouseName).HasMaxLength(100).IsUnicode(true);
                entity.Property(e => e.Address).HasMaxLength(255).IsUnicode(true);
                entity.Ignore(e => e.ContactNumber);
            });

            // Configure ReceiptOrder
            modelBuilder.Entity<ReceiptOrder>(entity =>
            {
                entity.ToTable("ReceiptOrders");
                entity.HasKey(e => e.ReceiptId);
                entity.Property(e => e.InvoiceNo).HasMaxLength(50).IsUnicode(false);
                entity.Property(e => e.Status).HasMaxLength(20).IsUnicode(false).HasDefaultValue("PENDING");
            });

            // Configure Dock
            modelBuilder.Entity<Dock>(entity =>
            {
                entity.ToTable("Docks");
                entity.HasKey(e => e.DockId);
                entity.Property(e => e.DockId).HasColumnName("DockID");
                entity.Property(e => e.WarehouseId).HasColumnName("WarehouseID");
                entity.Property(e => e.DockCode).HasMaxLength(20).IsUnicode(false);
                entity.Property(e => e.DockName).HasMaxLength(100).IsUnicode(true);
                entity.Property(e => e.Status).HasMaxLength(20).IsUnicode(false).HasDefaultValue("AVAILABLE");
                entity.Property(e => e.MaxTruckLength).HasColumnType("decimal(5,2)");
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                entity.HasOne(d => d.Warehouse)
                    .WithMany()
                    .HasForeignKey(d => d.WarehouseId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure SlotBooking
            modelBuilder.Entity<SlotBooking>(entity =>
            {
                entity.ToTable("SlotBookings");
                entity.HasKey(e => e.BookingId);
                entity.Property(e => e.BookingId).HasColumnName("BookingID");
                entity.Property(e => e.BookingCode).HasMaxLength(30).IsUnicode(false);
                entity.Property(e => e.QRCode).HasColumnName("QRCode").HasMaxLength(500).IsUnicode(false);
                entity.Property(e => e.VehicleId).HasColumnName("VehicleID");
                entity.Property(e => e.WarehouseId).HasColumnName("WarehouseID");
                entity.Property(e => e.DockId).HasColumnName("DockID");
                entity.Property(e => e.OrderId).HasColumnName("OrderID");
                entity.Property(e => e.DriverId).HasColumnName("DriverID");
                entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
                entity.Property(e => e.CreatedBy).HasColumnName("CreatedBy");

                entity.Property(e => e.BookingType).HasMaxLength(20).IsUnicode(false);
                entity.Property(e => e.ScheduledDate).HasColumnType("date");
                entity.Property(e => e.ScheduledStart).HasColumnType("time");
                entity.Property(e => e.ScheduledEnd).HasColumnType("time");
                entity.Property(e => e.Status).HasMaxLength(20).IsUnicode(false).HasDefaultValue("CONFIRMED");
                entity.Property(e => e.CheckInAt).HasColumnType("datetime2");
                entity.Property(e => e.CheckOutAt).HasColumnType("datetime2");
                entity.Property(e => e.OverstayAlert).HasDefaultValue(false);
                entity.Property(e => e.AlprPlate).HasColumnName("ALPR_Plate").HasMaxLength(20).IsUnicode(false);
                entity.Property(e => e.AlprConfidence).HasColumnName("ALPRConfidence").HasColumnType("decimal(5,2)");
                entity.Property(e => e.PriorityScore).HasDefaultValue(0);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                entity.HasOne(d => d.Vehicle)
                    .WithMany()
                    .HasForeignKey(d => d.VehicleId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(d => d.Warehouse)
                    .WithMany()
                    .HasForeignKey(d => d.WarehouseId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.Dock)
                    .WithMany(p => p.SlotBookings)
                    .HasForeignKey(d => d.DockId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(d => d.Order)
                    .WithMany()
                    .HasForeignKey(d => d.OrderId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
