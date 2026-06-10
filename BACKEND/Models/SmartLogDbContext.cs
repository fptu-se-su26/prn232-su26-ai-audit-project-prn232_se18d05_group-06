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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Vehicle
            modelBuilder.Entity<Vehicle>(entity =>
            {
                entity.ToTable("Vehicles");
                entity.HasKey(e => e.VehicleId);
                entity.HasIndex(e => e.LicensePlate).IsUnique();
                entity.Property(e => e.LicensePlate).HasMaxLength(20).IsUnicode(false);
                entity.Property(e => e.VehicleModel).HasMaxLength(50).IsUnicode(true);
                entity.Property(e => e.PayloadKg).HasColumnType("decimal(10,2)");
                entity.Property(e => e.VolumeCbm).HasColumnType("decimal(10,2)");
                entity.Property(e => e.FuelConsumptionRate).HasColumnType("decimal(5,2)");
                entity.Property(e => e.Status).HasMaxLength(20).IsUnicode(false).HasDefaultValue("AVAILABLE");
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
        }
    }
}
