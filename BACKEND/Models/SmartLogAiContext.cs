using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace BACKEND.Models;

public partial class SmartLogAiContext : DbContext
{
    public SmartLogAiContext()
    {
    }

    public SmartLogAiContext(DbContextOptions<SmartLogAiContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AdjustmentNote> AdjustmentNotes { get; set; }

    public virtual DbSet<Aiparameter> Aiparameters { get; set; }

    public virtual DbSet<ApiintegrationLog> ApiintegrationLogs { get; set; }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }

    public virtual DbSet<BankReconciliation> BankReconciliations { get; set; }

    public virtual DbSet<CargoPhoto> CargoPhotos { get; set; }

    public virtual DbSet<CompanyProfile> CompanyProfiles { get; set; }

    public virtual DbSet<Complaint> Complaints { get; set; }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<DebtTermConfig> DebtTermConfigs { get; set; }

    public virtual DbSet<Dock> Docks { get; set; }

    public virtual DbSet<Driver> Drivers { get; set; }

    public virtual DbSet<ExceptionExpense> ExceptionExpenses { get; set; }

    public virtual DbSet<Faqitem> Faqitems { get; set; }

    public virtual DbSet<GateLog> GateLogs { get; set; }

    public virtual DbSet<InboundOrder> InboundOrders { get; set; }

    public virtual DbSet<InboundOrderLine> InboundOrderLines { get; set; }

    public virtual DbSet<Inventory> Inventories { get; set; }

    public virtual DbSet<Invoice> Invoices { get; set; }

    public virtual DbSet<MasterCategory> MasterCategories { get; set; }

    public virtual DbSet<NotificationConfig> NotificationConfigs { get; set; }

    public virtual DbSet<OperatingExpense> OperatingExpenses { get; set; }

    public virtual DbSet<OrderLine> OrderLines { get; set; }

    public virtual DbSet<OutboundLine> OutboundLines { get; set; }

    public virtual DbSet<OutboundOrder> OutboundOrders { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<PriceConfig> PriceConfigs { get; set; }

    public virtual DbSet<ProductCategory> ProductCategories { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<ServiceCharge> ServiceCharges { get; set; }

    public virtual DbSet<ServiceFeedback> ServiceFeedbacks { get; set; }

    public virtual DbSet<ServiceOrder> ServiceOrders { get; set; }

    public virtual DbSet<Sku> Skus { get; set; }

    public virtual DbSet<Slaconfig> Slaconfigs { get; set; }

    public virtual DbSet<SlotBooking> SlotBookings { get; set; }

    public virtual DbSet<StockAlert> StockAlerts { get; set; }

    public virtual DbSet<StockLedger> StockLedgers { get; set; }

    public virtual DbSet<StockTransfer> StockTransfers { get; set; }

    public virtual DbSet<StockWriteOff> StockWriteOffs { get; set; }

    public virtual DbSet<StocktakeLine> StocktakeLines { get; set; }

    public virtual DbSet<StocktakeOrder> StocktakeOrders { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Vehicle> Vehicles { get; set; }

    public virtual DbSet<VehicleMaintenanceLog> VehicleMaintenanceLogs { get; set; }

    public virtual DbSet<Voucher> Vouchers { get; set; }

    public virtual DbSet<VwCustomerDebt> VwCustomerDebts { get; set; }

    public virtual DbSet<VwDeadAndExpiryStock> VwDeadAndExpiryStocks { get; set; }

    public virtual DbSet<VwInventorySummary> VwInventorySummaries { get; set; }

    public virtual DbSet<VwMonthlyRevenue> VwMonthlyRevenues { get; set; }

    public virtual DbSet<VwVehiclePerformance> VwVehiclePerformances { get; set; }

    public virtual DbSet<VwWarehouseUtilization> VwWarehouseUtilizations { get; set; }

    public virtual DbSet<Warehouse> Warehouses { get; set; }

    public virtual DbSet<WarehouseBin> WarehouseBins { get; set; }

    public virtual DbSet<WarehouseShelf> WarehouseShelves { get; set; }

    public virtual DbSet<WarehouseZone> WarehouseZones { get; set; }

    public virtual DbSet<VehicleEvent> VehicleEvents { get; set; }

    public override int SaveChanges()
    {
        PreventVehicleEventModification();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        PreventVehicleEventModification();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void PreventVehicleEventModification()
    {
        var entries = ChangeTracker.Entries<VehicleEvent>()
            .Where(e => e.State == EntityState.Modified || e.State == EntityState.Deleted);

        if (entries.Any())
        {
            throw new InvalidOperationException("Modifying or deleting VehicleEvents is strictly forbidden to preserve the immutable audit trail.");
        }
    }

    private string GetConnectionString()
    {
        IConfiguration configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", true, true)
            .AddJsonFile("appsettings.Development.json", true, true)
            .Build();
        return configuration["ConnectionStrings:DefaultConnection"] ?? throw new InvalidOperationException("Connection string not found");
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer(GetConnectionString());
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.UseCollation("Vietnamese_CI_AS");

        modelBuilder.Entity<AdjustmentNote>(entity =>
        {
            entity.HasKey(e => e.NoteId).HasName("PK__Adjustme__EACE357F1751D018");

            entity.HasIndex(e => e.NoteCode, "UQ__Adjustme__BAD95CB5D6BBB0B5").IsUnique();

            entity.Property(e => e.NoteId).HasColumnName("NoteID");
            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.InvoiceId).HasColumnName("InvoiceID");
            entity.Property(e => e.NoteCode)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.NoteType)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.Reason).HasMaxLength(500);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("PENDING");

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.AdjustmentNoteApprovedByNavigations)
                .HasForeignKey(d => d.ApprovedBy)
                .HasConstraintName("FK__Adjustmen__Appro__4C364F0E");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.AdjustmentNoteCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Adjustmen__Creat__4D2A7347");

            entity.HasOne(d => d.Customer).WithMany(p => p.AdjustmentNotes)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Adjustmen__Custo__4A4E069C");

            entity.HasOne(d => d.Invoice).WithMany(p => p.AdjustmentNotes)
                .HasForeignKey(d => d.InvoiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Adjustmen__Invoi__4959E263");
        });

        modelBuilder.Entity<Aiparameter>(entity =>
        {
            entity.HasKey(e => e.ParamId).HasName("PK__AIParame__C132B1047102B05A");

            entity.ToTable("AIParameters");

            entity.HasIndex(e => e.ParamKey, "UQ__AIParame__2A9EA4F471822F56").IsUnique();

            entity.Property(e => e.ParamId).HasColumnName("ParamID");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.ParamKey)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.ParamValue).HasMaxLength(500);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.Aiparameters)
                .HasForeignKey(d => d.UpdatedBy)
                .HasConstraintName("FK__AIParamet__Updat__68D28DBC");
        });

        modelBuilder.Entity<ApiintegrationLog>(entity =>
        {
            entity.HasKey(e => e.LogId).HasName("PK__APIInteg__5E5499A8689F7478");

            entity.ToTable("APIIntegrationLogs");

            entity.Property(e => e.LogId).HasColumnName("LogID");
            entity.Property(e => e.Apiname)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("APIName");
            entity.Property(e => e.Endpoint)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.ErrorMessage).HasMaxLength(1000);
            entity.Property(e => e.LoggedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Method)
                .HasMaxLength(10)
                .IsUnicode(false);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.LogId).HasName("PK__AuditLog__5E5499A88551975A");

            entity.ToTable("AuditLog");

            entity.HasIndex(e => new { e.UserId, e.LoggedAt }, "IX_AuditLog_User").IsDescending(false, true);

            entity.Property(e => e.LogId).HasColumnName("LogID");
            entity.Property(e => e.Action)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Ipaddress)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("IPAddress");
            entity.Property(e => e.LoggedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.RecordId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("RecordID");
            entity.Property(e => e.TableName)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.User).WithMany(p => p.AuditLogs)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__AuditLog__UserID__534D60F1");
        });

        modelBuilder.Entity<BankReconciliation>(entity =>
        {
            entity.HasKey(e => e.ReconcileId).HasName("PK__BankReco__1A44C406FA957507");

            entity.HasIndex(e => e.BankTxnRef, "UQ__BankReco__9AF5342B4F71853F").IsUnique();

            entity.Property(e => e.ReconcileId).HasColumnName("ReconcileID");
            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.BankTxnRef)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.ImportedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.MatchedInvoiceId).HasColumnName("MatchedInvoiceID");
            entity.Property(e => e.MatchedPaymentId).HasColumnName("MatchedPaymentID");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("UNMATCHED");

            entity.HasOne(d => d.MatchedInvoice).WithMany(p => p.BankReconciliations)
                .HasForeignKey(d => d.MatchedInvoiceId)
                .HasConstraintName("FK__BankRecon__Match__51EF2864");

            entity.HasOne(d => d.MatchedPayment).WithMany(p => p.BankReconciliations)
                .HasForeignKey(d => d.MatchedPaymentId)
                .HasConstraintName("FK__BankRecon__Match__52E34C9D");
        });

        modelBuilder.Entity<CargoPhoto>(entity =>
        {
            entity.HasKey(e => e.PhotoId).HasName("PK__CargoPho__21B7B582A343BC51");

            entity.Property(e => e.PhotoId).HasColumnName("PhotoID");
            entity.Property(e => e.IsDamaged).HasDefaultValue(false);
            entity.Property(e => e.LineId).HasColumnName("LineID");
            entity.Property(e => e.PhotoAngle)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.PhotoUrl)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("PhotoURL");
            entity.Property(e => e.TakenAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Line).WithMany(p => p.CargoPhotos)
                .HasForeignKey(d => d.LineId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CargoPhot__LineI__395884C4");

            entity.HasOne(d => d.TakenByNavigation).WithMany(p => p.CargoPhotos)
                .HasForeignKey(d => d.TakenBy)
                .HasConstraintName("FK__CargoPhot__Taken__3B40CD36");
        });

        modelBuilder.Entity<CompanyProfile>(entity =>
        {
            entity.HasKey(e => e.CompanyId).HasName("PK__CompanyP__2D971C4CC00106B3");

            entity.ToTable("CompanyProfile");

            entity.HasIndex(e => e.TaxCode, "UQ__CompanyP__12945A28753533DC").IsUnique();

            entity.Property(e => e.CompanyId).HasColumnName("CompanyID");
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.CompanyName).HasMaxLength(200);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.DigitalSignPath)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.LogoUrl)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("Logo_URL");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.TaxCode)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Website)
                .HasMaxLength(200)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Complaint>(entity =>
        {
            entity.HasKey(e => e.ComplaintId).HasName("PK__Complain__740D89AF46E8B5FE");

            entity.HasIndex(e => e.ComplaintCode, "UQ__Complain__8144A1BA72042D61").IsUnique();

            entity.Property(e => e.ComplaintId).HasColumnName("ComplaintID");
            entity.Property(e => e.ComplaintCode)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.ComplaintType)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.ResolutionNote).HasMaxLength(1000);
            entity.Property(e => e.Status)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasDefaultValue("OPEN");

            entity.HasOne(d => d.AssignedToNavigation).WithMany(p => p.Complaints)
                .HasForeignKey(d => d.AssignedTo)
                .HasConstraintName("FK__Complaint__Assig__6B24EA82");

            entity.HasOne(d => d.Customer).WithMany(p => p.Complaints)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Complaint__Custo__693CA210");

            entity.HasOne(d => d.Order).WithMany(p => p.Complaints)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK_Complaint_Order");
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.CustomerId).HasName("PK__Customer__A4AE64B808583DBE");

            entity.HasIndex(e => e.Tier, "IX_Customer_Tier");

            entity.HasIndex(e => e.CustomerCode, "UQ__Customer__066785219AD29F38").IsUnique();

            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.CompanyName).HasMaxLength(200);
            entity.Property(e => e.ContactName).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CustomerCode)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Email)
                .HasMaxLength(150)
                .IsUnicode(false);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Slaid).HasColumnName("SLAID");
            entity.Property(e => e.TaxCode)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Tier)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("BRONZE");
            entity.Property(e => e.TotalOrders12M).HasDefaultValue(0);
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Sla).WithMany(p => p.Customers)
                .HasForeignKey(d => d.Slaid)
                .HasConstraintName("FK__Customers__SLAID__59FA5E80");

            entity.HasOne(d => d.User).WithMany(p => p.Customers)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Customers__UserI__5AEE82B9");
        });

        modelBuilder.Entity<DebtTermConfig>(entity =>
        {
            entity.HasKey(e => e.TermId).HasName("PK__DebtTerm__410A2E45333850B3");

            entity.Property(e => e.TermId).HasColumnName("TermID");
            entity.Property(e => e.CustomerTier)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.ReminderDay1).HasDefaultValue(3);
            entity.Property(e => e.ReminderDay2).HasDefaultValue(1);
        });

        modelBuilder.Entity<Dock>(entity =>
        {
            entity.HasKey(e => e.DockId).HasName("PK__Docks__9D8210D4554052CA");

            entity.HasIndex(e => e.DockCode, "UQ__Docks__7438A825EF84AB85").IsUnique();

            entity.Property(e => e.DockId).HasColumnName("DockID");
            entity.Property(e => e.DockCode)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.DockName).HasMaxLength(100);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.MaxTruckLength).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("AVAILABLE");
            entity.Property(e => e.WarehouseId).HasColumnName("WarehouseID");

            entity.HasOne(d => d.Warehouse).WithMany(p => p.Docks)
                .HasForeignKey(d => d.WarehouseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Docks__Warehouse__07C12930");
        });

        modelBuilder.Entity<Driver>(entity =>
        {
            entity.HasKey(e => e.DriverId).HasName("PK__Drivers__F1B1CD24F28E44A5");

            entity.HasIndex(e => e.DriverCode, "UQ__Drivers__0BF84B47A0DDF429").IsUnique();

            entity.HasIndex(e => e.LicenseNo, "UQ__Drivers__72D7E870E2D423EC").IsUnique();

            entity.Property(e => e.DriverId).HasColumnName("DriverID");
            entity.Property(e => e.BlacklistReason).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.DriverCode)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.FullName).HasMaxLength(200);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.IsBlacklisted).HasDefaultValue(false);
            entity.Property(e => e.LicenseNo)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .IsUnicode(false);
        });

        modelBuilder.Entity<ExceptionExpense>(entity =>
        {
            entity.HasKey(e => e.ExpenseId).HasName("PK__Exceptio__1445CFF3162873CF");

            entity.HasIndex(e => e.ExpenseCode, "UQ__Exceptio__5064CAE1F5BEFCDE").IsUnique();

            entity.Property(e => e.ExpenseId).HasColumnName("ExpenseID");
            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.ExpenseCode)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("PENDING");

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.ExceptionExpenseApprovedByNavigations)
                .HasForeignKey(d => d.ApprovedBy)
                .HasConstraintName("FK__Exception__Appro__5E54FF49");

            entity.HasOne(d => d.RequestedByNavigation).WithMany(p => p.ExceptionExpenseRequestedByNavigations)
                .HasForeignKey(d => d.RequestedBy)
                .HasConstraintName("FK__Exception__Reque__5F492382");
        });

        modelBuilder.Entity<Faqitem>(entity =>
        {
            entity.HasKey(e => e.Faqid).HasName("PK__FAQItems__4B89D1E20435AB80");

            entity.ToTable("FAQItems");

            entity.Property(e => e.Faqid).HasColumnName("FAQID");
            entity.Property(e => e.Answer).HasMaxLength(2000);
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Question).HasMaxLength(500);
            entity.Property(e => e.Tags).HasMaxLength(300);

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Faqitems)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__FAQItems__Create__640DD89F");
        });

        modelBuilder.Entity<GateLog>(entity =>
        {
            entity.HasKey(e => e.GateLogId).HasName("PK__GateLogs__0DDFE410F0D91345");

            entity.HasIndex(e => new { e.VehicleId, e.EventAt }, "IX_GateLog_Vehicle").IsDescending(false, true);

            entity.Property(e => e.GateLogId).HasColumnName("GateLogID");
            entity.Property(e => e.AlprPlate)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("ALPR_Plate");
            entity.Property(e => e.Alprconfidence)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("ALPRConfidence");
            entity.Property(e => e.BookingId).HasColumnName("BookingID");
            entity.Property(e => e.DriverId).HasColumnName("DriverID");
            entity.Property(e => e.EventAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.EventType)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.GateCameraSnap)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.OperatorId).HasColumnName("OperatorID");
            entity.Property(e => e.VehicleId).HasColumnName("VehicleID");

            entity.HasOne(d => d.Booking).WithMany(p => p.GateLogs)
                .HasForeignKey(d => d.BookingId)
                .HasConstraintName("FK__GateLogs__Bookin__2057CCD0");

            entity.HasOne(d => d.Driver).WithMany(p => p.GateLogs)
                .HasForeignKey(d => d.DriverId)
                .HasConstraintName("FK__GateLogs__Driver__22401542");

            entity.HasOne(d => d.Operator).WithMany(p => p.GateLogs)
                .HasForeignKey(d => d.OperatorId)
                .HasConstraintName("FK__GateLogs__Operat__24285DB4");

            entity.HasOne(d => d.Vehicle).WithMany(p => p.GateLogs)
                .HasForeignKey(d => d.VehicleId)
                .HasConstraintName("FK__GateLogs__Vehicl__214BF109");
        });

        modelBuilder.Entity<InboundOrder>(entity =>
        {
            entity.HasKey(e => e.InboundId).HasName("PK__InboundO__B4DB7A95E39B9225");

            entity.HasIndex(e => e.InboundCode, "UQ__InboundO__D6CE9D26E8FF636A").IsUnique();

            entity.Property(e => e.InboundId).HasColumnName("InboundID");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.InboundCode)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.Ocrconfidence)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("OCRConfidence");
            entity.Property(e => e.OcrrawData).HasColumnName("OCRRawData");
            entity.Property(e => e.RequireManual).HasDefaultValue(false);
            entity.Property(e => e.Status)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasDefaultValue("PENDING");
            entity.Property(e => e.WarehouseId).HasColumnName("WarehouseID");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.InboundOrders)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__InboundOr__Creat__2DE6D218");

            entity.HasOne(d => d.Customer).WithMany(p => p.InboundOrders)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__InboundOr__Custo__2A164134");

            entity.HasOne(d => d.Warehouse).WithMany(p => p.InboundOrders)
                .HasForeignKey(d => d.WarehouseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__InboundOr__Wareh__2B0A656D");
        });

        modelBuilder.Entity<InboundOrderLine>(entity =>
        {
            entity.HasKey(e => e.LineId).HasName("PK__InboundO__2EAE64C92F4066DB");

            entity.Property(e => e.LineId).HasColumnName("LineID");
            entity.Property(e => e.AislottedBinId).HasColumnName("AISlottedBinID");
            entity.Property(e => e.BatchNo)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.BinId).HasColumnName("BinID");
            entity.Property(e => e.ConditionStatus)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasDefaultValue("GOOD");
            entity.Property(e => e.InboundId).HasColumnName("InboundID");
            entity.Property(e => e.Note).HasMaxLength(500);
            entity.Property(e => e.ReceivedQty).HasDefaultValue(0);
            entity.Property(e => e.Skuid).HasColumnName("SKUID");

            entity.HasOne(d => d.AislottedBin).WithMany(p => p.InboundOrderLineAislottedBins)
                .HasForeignKey(d => d.AislottedBinId)
                .HasConstraintName("FK__InboundOr__AISlo__3587F3E0");

            entity.HasOne(d => d.Bin).WithMany(p => p.InboundOrderLineBins)
                .HasForeignKey(d => d.BinId)
                .HasConstraintName("FK__InboundOr__BinID__3493CFA7");

            entity.HasOne(d => d.Inbound).WithMany(p => p.InboundOrderLines)
                .HasForeignKey(d => d.InboundId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__InboundOr__Inbou__31B762FC");

            entity.HasOne(d => d.Sku).WithMany(p => p.InboundOrderLines)
                .HasForeignKey(d => d.Skuid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__InboundOr__SKUID__32AB8735");
        });

        modelBuilder.Entity<Inventory>(entity =>
        {
            entity.HasKey(e => e.InventoryId).HasName("PK__Inventor__F5FDE6D31F98832F");

            entity.ToTable("Inventory");

            entity.HasIndex(e => e.BinId, "IX_Inventory_Bin");

            entity.HasIndex(e => e.Skuid, "IX_Inventory_SKU");

            entity.HasIndex(e => new { e.Skuid, e.BinId, e.BatchNo }, "UQ_SKU_Bin").IsUnique();

            entity.Property(e => e.InventoryId).HasColumnName("InventoryID");
            entity.Property(e => e.BatchNo)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.BinId).HasColumnName("BinID");
            entity.Property(e => e.InboundDate).HasDefaultValueSql("(CONVERT([date],getdate()))");
            entity.Property(e => e.Skuid).HasColumnName("SKUID");

            entity.HasOne(d => d.Bin).WithMany(p => p.Inventories)
                .HasForeignKey(d => d.BinId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Inventory__BinID__1EA48E88");

            entity.HasOne(d => d.Sku).WithMany(p => p.Inventories)
                .HasForeignKey(d => d.Skuid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Inventory__SKUID__1DB06A4F");
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.InvoiceId).HasName("PK__Invoices__D796AAD5AA6D2FEB");

            entity.HasIndex(e => new { e.Status, e.DueDate }, "IX_Invoice_Status");

            entity.HasIndex(e => e.InvoiceNo, "UQ__Invoices__D796B227DD50CAAA").IsUnique();

            entity.Property(e => e.InvoiceId).HasColumnName("InvoiceID");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.DigitalSigned).HasDefaultValue(false);
            entity.Property(e => e.DiscountAmt)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.InvoiceNo)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.IssueDate).HasDefaultValueSql("(CONVERT([date],getdate()))");
            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.PaidAmount)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Pdfpath)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("PDFPath");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("PENDING");
            entity.Property(e => e.SubTotal).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TotalAmount)
                .HasComputedColumnSql("(round(([SubTotal]-[DiscountAmt])*((1)+[VATRate]/(100)),(0)))", true)
                .HasColumnType("decimal(30, 8)");
            entity.Property(e => e.Vatamount)
                .HasComputedColumnSql("(round((([SubTotal]-[DiscountAmt])*[VATRate])/(100),(0)))", true)
                .HasColumnType("decimal(29, 8)")
                .HasColumnName("VATAmount");
            entity.Property(e => e.VatinvoiceNo)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("VATInvoiceNo");
            entity.Property(e => e.Vatrate)
                .HasDefaultValue(10.00m)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("VATRate");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Invoices__Create__336AA144");

            entity.HasOne(d => d.Customer).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Invoices__Custom__2CBDA3B5");

            entity.HasOne(d => d.Order).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Invoices__OrderI__2BC97F7C");
        });

        modelBuilder.Entity<MasterCategory>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__MasterCa__19093A2BD202784D");

            entity.ToTable("MasterCategory");

            entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
            entity.Property(e => e.CategoryType)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Code)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.NameEn)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("NameEN");
            entity.Property(e => e.NameVn)
                .HasMaxLength(200)
                .HasColumnName("NameVN");
            entity.Property(e => e.SortOrder).HasDefaultValue(0);
        });

        modelBuilder.Entity<NotificationConfig>(entity =>
        {
            entity.HasKey(e => e.ConfigId).HasName("PK__Notifica__C3BC333C1ACBF3C8");

            entity.Property(e => e.ConfigId).HasColumnName("ConfigID");
            entity.Property(e => e.Channel)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.EventType)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Template).HasMaxLength(2000);
        });


        modelBuilder.Entity<OperatingExpense>(entity =>
        {
            entity.HasKey(e => e.ExpenseId).HasName("PK_OperatingExpenses");
            entity.HasIndex(e => e.ExpenseCode, "UQ_OperatingExpenses_ExpenseCode").IsUnique();
            entity.Property(e => e.ExpenseId).HasColumnName("ExpenseID");
            entity.Property(e => e.ExpenseCode).HasMaxLength(30).IsUnicode(false);
            entity.Property(e => e.ExpenseCategory).HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Status).HasMaxLength(20).IsUnicode(false).HasDefaultValue("APPROVED");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.CreatedByNavigation).WithMany()
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK_OperatingExpenses_CreatedBy");
        });
        modelBuilder.Entity<OrderLine>(entity =>
        {
            entity.HasKey(e => e.LineId).HasName("PK__OrderLin__2EAE64C9F5F9A930");

            entity.Property(e => e.LineId).HasColumnName("LineID");
            entity.Property(e => e.LineTotal).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.ProductDesc).HasMaxLength(300);
            entity.Property(e => e.Skuid).HasColumnName("SKUID");
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.VolumeCbm)
                .HasColumnType("decimal(8, 3)")
                .HasColumnName("VolumeCBM");
            entity.Property(e => e.WeightKg).HasColumnType("decimal(10, 3)");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderLines)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OrderLine__Order__6EC0713C");

            entity.HasOne(d => d.Sku).WithMany(p => p.OrderLines)
                .HasForeignKey(d => d.Skuid)
                .HasConstraintName("FK__OrderLine__SKUID__6FB49575");
        });

        modelBuilder.Entity<OutboundLine>(entity =>
        {
            entity.HasKey(e => e.LineId).HasName("PK__Outbound__2EAE64C94AAD5330");

            entity.Property(e => e.LineId).HasColumnName("LineID");
            entity.Property(e => e.BinId).HasColumnName("BinID");
            entity.Property(e => e.OutboundId).HasColumnName("OutboundID");
            entity.Property(e => e.PickedQty).HasDefaultValue(0);
            entity.Property(e => e.Qrlabel)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("QRLabel");
            entity.Property(e => e.Skuid).HasColumnName("SKUID");

            entity.HasOne(d => d.Bin).WithMany(p => p.OutboundLines)
                .HasForeignKey(d => d.BinId)
                .HasConstraintName("FK__OutboundL__BinID__7D0E9093");

            entity.HasOne(d => d.Outbound).WithMany(p => p.OutboundLines)
                .HasForeignKey(d => d.OutboundId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OutboundL__Outbo__7B264821");

            entity.HasOne(d => d.Sku).WithMany(p => p.OutboundLines)
                .HasForeignKey(d => d.Skuid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OutboundL__SKUID__7C1A6C5A");
        });

        modelBuilder.Entity<OutboundOrder>(entity =>
        {
            entity.HasKey(e => e.OutboundId).HasName("PK__Outbound__35184561590B42C5");

            entity.HasIndex(e => e.OutboundCode, "UQ__Outbound__1E23CBD375391702").IsUnique();

            entity.Property(e => e.OutboundId).HasColumnName("OutboundID");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.LabelPrinted).HasDefaultValue(false);
            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.OutboundCode)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasDefaultValue("PENDING");
            entity.Property(e => e.WarehouseId).HasColumnName("WarehouseID");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.OutboundOrders)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__OutboundO__Creat__7755B73D");

            entity.HasOne(d => d.Order).WithMany(p => p.OutboundOrders)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OutboundO__Order__73852659");

            entity.HasOne(d => d.Warehouse).WithMany(p => p.OutboundOrders)
                .HasForeignKey(d => d.WarehouseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OutboundO__Wareh__74794A92");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payments__9B556A58E62E2FD4");

            entity.HasIndex(e => e.PaymentCode, "UQ__Payments__106D3BA80953A9EB").IsUnique();

            entity.Property(e => e.PaymentId).HasColumnName("PaymentID");
            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.BankTxnRef)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.HashCode)
                .HasMaxLength(256)
                .IsUnicode(false);
            entity.Property(e => e.InvoiceId).HasColumnName("InvoiceID");
            entity.Property(e => e.PaidAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.PaymentCode)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.PaymentMethod)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.ReceiptPath)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("CONFIRMED");

            entity.HasOne(d => d.ConfirmedByNavigation).WithMany(p => p.Payments)
                .HasForeignKey(d => d.ConfirmedBy)
                .HasConstraintName("FK__Payments__Confir__4589517F");

            entity.HasOne(d => d.Customer).WithMany(p => p.Payments)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Payments__Custom__42ACE4D4");

            entity.HasOne(d => d.Invoice).WithMany(p => p.Payments)
                .HasForeignKey(d => d.InvoiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Payments__Invoic__41B8C09B");
        });

        modelBuilder.Entity<PriceConfig>(entity =>
        {
            entity.HasKey(e => e.PriceId).HasName("PK__PriceCon__4957584F90492AAC");

            entity.ToTable("PriceConfig");

            entity.Property(e => e.PriceId).HasColumnName("PriceID");
            entity.Property(e => e.BasePrice).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.ServiceType).HasMaxLength(100);
            entity.Property(e => e.SurchargeType).HasMaxLength(100);
            entity.Property(e => e.SurchargeValue)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Unit)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Zone).HasMaxLength(100);
        });

        modelBuilder.Entity<ProductCategory>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__ProductC__19093A2B2E5608A4");

            entity.HasIndex(e => e.CategoryCode, "UQ__ProductC__371BA955BEBC17C3").IsUnique();

            entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
            entity.Property(e => e.CategoryCode)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.CategoryName).HasMaxLength(200);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.ParentId).HasColumnName("ParentID");

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent)
                .HasForeignKey(d => d.ParentId)
                .HasConstraintName("FK__ProductCa__Paren__0D7A0286");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE3AFE501C1F");

            entity.HasIndex(e => e.RoleCode, "UQ__Roles__D62CB59C6C88479A").IsUnique();

            entity.Property(e => e.RoleId).HasColumnName("RoleID");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.RoleCode)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.RoleName).HasMaxLength(100);
        });

        modelBuilder.Entity<ServiceCharge>(entity =>
        {
            entity.HasKey(e => e.ChargeId).HasName("PK__ServiceC__17FC363B09E8834E");

            entity.HasIndex(e => e.ChargeCode, "UQ__ServiceC__3FFCA5B4F68D5770").IsUnique();

            entity.Property(e => e.ChargeId).HasColumnName("ChargeID");
            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.ChargeCode)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.ChargeType).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.InvoiceId).HasColumnName("InvoiceID");
            entity.Property(e => e.IsAdjustment).HasDefaultValue(false);
            entity.Property(e => e.IsApproved).HasDefaultValue(false);
            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.OriginalChargeId).HasColumnName("OriginalChargeID");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.ServiceCharges)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__ServiceCh__Creat__3CF40B7E");

            entity.HasOne(d => d.Invoice).WithMany(p => p.ServiceCharges)
                .HasForeignKey(d => d.InvoiceId)
                .HasConstraintName("FK__ServiceCh__Invoi__39237A9A");

            entity.HasOne(d => d.Order).WithMany(p => p.ServiceCharges)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__ServiceCh__Order__382F5661");

            entity.HasOne(d => d.OriginalCharge).WithMany(p => p.InverseOriginalCharge)
                .HasForeignKey(d => d.OriginalChargeId)
                .HasConstraintName("FK__ServiceCh__Origi__3BFFE745");
        });

        modelBuilder.Entity<ServiceFeedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__ServiceF__6A4BEDF6CBB00621");

            entity.ToTable("ServiceFeedback");

            entity.Property(e => e.FeedbackId).HasColumnName("FeedbackID");
            entity.Property(e => e.Comment).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.OrderId).HasColumnName("OrderID");

            entity.HasOne(d => d.Customer).WithMany(p => p.ServiceFeedbacks)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ServiceFe__Custo__6EF57B66");

            entity.HasOne(d => d.Order).WithMany(p => p.ServiceFeedbacks)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK_Feedback_Order");
        });

        modelBuilder.Entity<ServiceOrder>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__ServiceO__C3905BAF116DD46C");

            entity.HasIndex(e => new { e.CustomerId, e.CreatedAt }, "IX_ServiceOrder_Cust").IsDescending(false, true);

            entity.HasIndex(e => e.OrderCode, "UQ__ServiceO__999B52292FD2C80F").IsUnique();

            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.DeliveryAddress).HasMaxLength(500);
            entity.Property(e => e.DeliveryLat).HasColumnType("decimal(10, 7)");
            entity.Property(e => e.DeliveryLng).HasColumnType("decimal(10, 7)");
            entity.Property(e => e.DiscountAmount)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.EstimatedCost).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.FinalCost).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.OrderCode)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.PickupAddress).HasMaxLength(500);
            entity.Property(e => e.PickupLat).HasColumnType("decimal(10, 7)");
            entity.Property(e => e.PickupLng).HasColumnType("decimal(10, 7)");
            entity.Property(e => e.Priority)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("NORMAL");
            entity.Property(e => e.PriorityScore).HasDefaultValue(0);
            entity.Property(e => e.ServiceType)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Slaid).HasColumnName("SLAID");
            entity.Property(e => e.Status)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasDefaultValue("DRAFT");
            entity.Property(e => e.TotalCbm)
                .HasColumnType("decimal(10, 3)")
                .HasColumnName("TotalCBM");
            entity.Property(e => e.TotalPallets).HasDefaultValue(0);
            entity.Property(e => e.TotalWeightKg).HasColumnType("decimal(12, 3)");
            entity.Property(e => e.VoucherId).HasColumnName("VoucherID");
            entity.Property(e => e.WarehouseId).HasColumnName("WarehouseID");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.ServiceOrders)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__ServiceOr__Creat__6AEFE058");

            entity.HasOne(d => d.Customer).WithMany(p => p.ServiceOrders)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ServiceOr__Custo__625A9A57");

            entity.HasOne(d => d.Sla).WithMany(p => p.ServiceOrders)
                .HasForeignKey(d => d.Slaid)
                .HasConstraintName("FK__ServiceOr__SLAID__69FBBC1F");

            entity.HasOne(d => d.Voucher).WithMany(p => p.ServiceOrders)
                .HasForeignKey(d => d.VoucherId)
                .HasConstraintName("FK__ServiceOr__Vouch__65370702");

            entity.HasOne(d => d.Warehouse).WithMany(p => p.ServiceOrders)
                .HasForeignKey(d => d.WarehouseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ServiceOr__Wareh__634EBE90");
        });

        modelBuilder.Entity<Sku>(entity =>
        {
            entity.HasKey(e => e.Skuid).HasName("PK__SKUs__9AEA1BAC40ACE245");

            entity.ToTable("SKUs");

            entity.HasIndex(e => e.Skucode, "UQ__SKUs__E6769AAD6517BC26").IsUnique();

            entity.Property(e => e.Skuid).HasColumnName("SKUID");
            entity.Property(e => e.Barcode)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.HeightCm).HasColumnType("decimal(8, 2)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.IsFragile).HasDefaultValue(false);
            entity.Property(e => e.IsHazmat).HasDefaultValue(false);
            entity.Property(e => e.IsHeavy).HasDefaultValue(false);
            entity.Property(e => e.LengthCm).HasColumnType("decimal(8, 2)");
            entity.Property(e => e.ProductName).HasMaxLength(300);
            entity.Property(e => e.Qrcode)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("QRCode");
            entity.Property(e => e.SafetyDebounceH).HasDefaultValue(12);
            entity.Property(e => e.SafetyMinQty).HasDefaultValue(0);
            entity.Property(e => e.Skucode)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("SKUCode");
            entity.Property(e => e.StorageTemp)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.VolumeCbm)
                .HasComputedColumnSql("(round((([LengthCm]*[WidthCm])*[HeightCm])/(1000000.0),(6)))", true)
                .HasColumnType("numeric(36, 15)")
                .HasColumnName("VolumeCBM");
            entity.Property(e => e.WeightKg).HasColumnType("decimal(10, 3)");
            entity.Property(e => e.WidthCm).HasColumnType("decimal(8, 2)");

            entity.HasOne(d => d.Category).WithMany(p => p.Skus)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK__SKUs__CategoryID__123EB7A3");

            entity.HasOne(d => d.Customer).WithMany(p => p.Skus)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK__SKUs__CustomerID__1332DBDC");
        });

        modelBuilder.Entity<Slaconfig>(entity =>
        {
            entity.HasKey(e => e.Slaid).HasName("PK__SLAConfi__2848A229181356FF");

            entity.ToTable("SLAConfig");

            entity.Property(e => e.Slaid).HasColumnName("SLAID");
            entity.Property(e => e.CompensationPct)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(5, 2)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.PartnerTier)
                .HasMaxLength(20)
                .IsUnicode(false);
        });

        modelBuilder.Entity<SlotBooking>(entity =>
        {
            entity.HasKey(e => e.BookingId).HasName("PK__SlotBook__73951ACD04A9DFCA");

            entity.HasIndex(e => new { e.ScheduledDate, e.WarehouseId }, "IX_SlotBooking_Date");

            entity.HasIndex(e => e.BookingCode, "UQ__SlotBook__C6E56BD5968CEB62").IsUnique();

            entity.Property(e => e.BookingId).HasColumnName("BookingID");
            entity.Property(e => e.AlprPlate)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("ALPR_Plate");
            entity.Property(e => e.Alprconfidence)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("ALPRConfidence");
            entity.Property(e => e.BookingCode)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.BookingType)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.DockId).HasColumnName("DockID");
            entity.Property(e => e.DriverId).HasColumnName("DriverID");
            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.OverstayAlert).HasDefaultValue(false);
            entity.Property(e => e.PriorityScore).HasDefaultValue(0);
            entity.Property(e => e.Qrcode)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("QRCode");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("CONFIRMED");
            entity.Property(e => e.VehicleId).HasColumnName("VehicleID");
            entity.Property(e => e.WarehouseId).HasColumnName("WarehouseID");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.SlotBookings)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__SlotBooki__Creat__1C873BEC");

            entity.HasOne(d => d.Customer).WithMany(p => p.SlotBookings)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK__SlotBooki__Custo__15DA3E5D");

            entity.HasOne(d => d.Dock).WithMany(p => p.SlotBookings)
                .HasForeignKey(d => d.DockId)
                .HasConstraintName("FK__SlotBooki__DockI__17C286CF");

            entity.HasOne(d => d.Driver).WithMany(p => p.SlotBookings)
                .HasForeignKey(d => d.DriverId)
                .HasConstraintName("FK__SlotBooki__Drive__14E61A24");

            entity.HasOne(d => d.Order).WithMany(p => p.SlotBookings)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__SlotBooki__Order__18B6AB08");

            entity.HasOne(d => d.Vehicle).WithMany(p => p.SlotBookings)
                .HasForeignKey(d => d.VehicleId)
                .HasConstraintName("FK__SlotBooki__Vehic__13F1F5EB");

            entity.HasOne(d => d.Warehouse).WithMany(p => p.SlotBookings)
                .HasForeignKey(d => d.WarehouseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__SlotBooki__Wareh__16CE6296");
        });

        modelBuilder.Entity<StockAlert>(entity =>
        {
            entity.HasKey(e => e.AlertId).HasName("PK__StockAle__EBB16AED03ECFEA6");

            entity.Property(e => e.AlertId).HasColumnName("AlertID");
            entity.Property(e => e.AlertType)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsResolved).HasDefaultValue(false);
            entity.Property(e => e.Skuid).HasColumnName("SKUID");

            entity.HasOne(d => d.Sku).WithMany(p => p.StockAlerts)
                .HasForeignKey(d => d.Skuid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__StockAler__SKUID__5CA1C101");
        });

        modelBuilder.Entity<StockLedger>(entity =>
        {
            entity.HasKey(e => e.LedgerId).HasName("PK__StockLed__AE70E0AF0B706E50");

            entity.ToTable("StockLedger");

            entity.HasIndex(e => new { e.Skuid, e.CreatedAt }, "IX_StockLedger_SKU").IsDescending(false, true);

            entity.Property(e => e.LedgerId).HasColumnName("LedgerID");
            entity.Property(e => e.BinId).HasColumnName("BinID");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Note).HasMaxLength(500);
            entity.Property(e => e.RefId).HasColumnName("RefID");
            entity.Property(e => e.RefType)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.Skuid).HasColumnName("SKUID");
            entity.Property(e => e.TxnType)
                .HasMaxLength(30)
                .IsUnicode(false);

            entity.HasOne(d => d.Bin).WithMany(p => p.StockLedgers)
                .HasForeignKey(d => d.BinId)
                .HasConstraintName("FK__StockLedg__BinID__245D67DE");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.StockLedgers)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__StockLedg__Creat__25518C17");

            entity.HasOne(d => d.Sku).WithMany(p => p.StockLedgers)
                .HasForeignKey(d => d.Skuid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__StockLedg__SKUID__236943A5");
        });

        modelBuilder.Entity<StockTransfer>(entity =>
        {
            entity.HasKey(e => e.TransferId).HasName("PK__StockTra__95490171E12CED53");

            entity.HasIndex(e => e.TransferCode, "UQ__StockTra__CE99A4C54ECE3D2E").IsUnique();

            entity.Property(e => e.TransferId).HasColumnName("TransferID");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.FromBinId).HasColumnName("FromBinID");
            entity.Property(e => e.Skuid).HasColumnName("SKUID");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("PENDING");
            entity.Property(e => e.ToBinId).HasColumnName("ToBinID");
            entity.Property(e => e.TransferCode)
                .HasMaxLength(30)
                .IsUnicode(false);

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.StockTransfers)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__StockTran__Creat__503BEA1C");

            entity.HasOne(d => d.FromBin).WithMany(p => p.StockTransferFromBins)
                .HasForeignKey(d => d.FromBinId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__StockTran__FromB__4D5F7D71");

            entity.HasOne(d => d.Sku).WithMany(p => p.StockTransfers)
                .HasForeignKey(d => d.Skuid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__StockTran__SKUID__4C6B5938");

            entity.HasOne(d => d.ToBin).WithMany(p => p.StockTransferToBins)
                .HasForeignKey(d => d.ToBinId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__StockTran__ToBin__4E53A1AA");
        });

        modelBuilder.Entity<StockWriteOff>(entity =>
        {
            entity.HasKey(e => e.WriteOffId).HasName("PK__StockWri__63345CCB9B741003");

            entity.HasIndex(e => e.WriteOffCode, "UQ__StockWri__5D8543DDB43D1941").IsUnique();

            entity.Property(e => e.WriteOffId).HasColumnName("WriteOffID");
            entity.Property(e => e.BinId).HasColumnName("BinID");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Reason).HasMaxLength(500);
            entity.Property(e => e.Skuid).HasColumnName("SKUID");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("PENDING");
            entity.Property(e => e.WriteOffCode)
                .HasMaxLength(30)
                .IsUnicode(false);

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.StockWriteOffApprovedByNavigations)
                .HasForeignKey(d => d.ApprovedBy)
                .HasConstraintName("FK__StockWrit__Appro__57DD0BE4");

            entity.HasOne(d => d.Bin).WithMany(p => p.StockWriteOffs)
                .HasForeignKey(d => d.BinId)
                .HasConstraintName("FK__StockWrit__BinID__55F4C372");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.StockWriteOffCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__StockWrit__Creat__58D1301D");

            entity.HasOne(d => d.Sku).WithMany(p => p.StockWriteOffs)
                .HasForeignKey(d => d.Skuid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__StockWrit__SKUID__55009F39");
        });

        modelBuilder.Entity<StocktakeLine>(entity =>
        {
            entity.HasKey(e => e.LineId).HasName("PK__Stocktak__2EAE64C93ADD69C1");

            entity.Property(e => e.LineId).HasColumnName("LineID");
            entity.Property(e => e.BinId).HasColumnName("BinID");
            entity.Property(e => e.Note).HasMaxLength(500);
            entity.Property(e => e.RequireRecount).HasDefaultValue(false);
            entity.Property(e => e.Skuid).HasColumnName("SKUID");
            entity.Property(e => e.StocktakeId).HasColumnName("StocktakeID");
            entity.Property(e => e.Variance).HasComputedColumnSql("([CountedQty]-[SystemQty])", true);
            entity.Property(e => e.VariancePct)
                .HasComputedColumnSql("(case when [SystemQty]=(0) then NULL else CONVERT([decimal](8,2),(([CountedQty]-[SystemQty])*(100.0))/[SystemQty]) end)", true)
                .HasColumnType("decimal(8, 2)");

            entity.HasOne(d => d.Bin).WithMany(p => p.StocktakeLines)
                .HasForeignKey(d => d.BinId)
                .HasConstraintName("FK__Stocktake__BinID__47A6A41B");

            entity.HasOne(d => d.Sku).WithMany(p => p.StocktakeLines)
                .HasForeignKey(d => d.Skuid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Stocktake__SKUID__46B27FE2");

            entity.HasOne(d => d.Stocktake).WithMany(p => p.StocktakeLines)
                .HasForeignKey(d => d.StocktakeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Stocktake__Stock__45BE5BA9");
        });

        modelBuilder.Entity<StocktakeOrder>(entity =>
        {
            entity.HasKey(e => e.StocktakeId).HasName("PK__Stocktak__5874C405D118B2BC");

            entity.HasIndex(e => e.StocktakeCode, "UQ__Stocktak__66FC5709B341915C").IsUnique();

            entity.Property(e => e.StocktakeId).HasColumnName("StocktakeID");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("DRAFT");
            entity.Property(e => e.StocktakeCode)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.VarianceAlert).HasDefaultValue(false);
            entity.Property(e => e.WarehouseId).HasColumnName("WarehouseID");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.StocktakeOrders)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Stocktake__Creat__42E1EEFE");

            entity.HasOne(d => d.Warehouse).WithMany(p => p.StocktakeOrders)
                .HasForeignKey(d => d.WarehouseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Stocktake__Wareh__40058253");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCACA1ED6609");

            entity.HasIndex(e => e.Username, "UQ__Users__536C85E4665A1E59").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Users__A9D105346AB00C68").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Email)
                .HasMaxLength(150)
                .IsUnicode(false);
            entity.Property(e => e.FullName).HasMaxLength(200);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(256)
                .IsUnicode(false);
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.RoleId).HasColumnName("RoleID");
            entity.Property(e => e.Username)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Users__RoleID__4E88ABD4");
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.VehicleId).HasName("PK__Vehicles__476B54B258607EC5");

            entity.HasIndex(e => e.TruckPlate, "IX_Vehicles_Plate");

            entity.HasIndex(e => e.TruckPlate, "UQ__Vehicles__7E7475852470FDF2").IsUnique();

            entity.Property(e => e.VehicleId).HasColumnName("VehicleID");
            entity.Property(e => e.BlacklistReason).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.DefaultDriverId).HasColumnName("DefaultDriverID");
            entity.Property(e => e.GpsdeviceId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("GPSDeviceID");
            entity.Property(e => e.IsBlacklisted).HasDefaultValue(false);
            entity.Property(e => e.IsInternal).HasDefaultValue(false);
            entity.Property(e => e.IsTempProfile).HasDefaultValue(false);
            entity.Property(e => e.MaxWeightTon).HasColumnType("decimal(8, 2)");
            entity.Property(e => e.OwnerName).HasMaxLength(200);
            entity.Property(e => e.OwnerPhone)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("ACTIVE");
            entity.Property(e => e.TrailerPlate)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.TruckPlate)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.VehicleType)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Vehicles)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Vehicles__Create__0F2D40CE");

            entity.HasOne(d => d.DefaultDriver).WithMany(p => p.Vehicles)
                .HasForeignKey(d => d.DefaultDriverId)
                .HasConstraintName("FK__Vehicles__Defaul__0B5CAFEA");
        });

        modelBuilder.Entity<VehicleMaintenanceLog>(entity =>
        {
            entity.HasKey(e => e.MaintenanceId).HasName("PK__VehicleM__E60542B5662CA286");

            entity.Property(e => e.MaintenanceId).HasColumnName("MaintenanceID");
            entity.Property(e => e.CostAmount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.MaintenanceType)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Note).HasMaxLength(500);
            entity.Property(e => e.ServiceCenter).HasMaxLength(200);
            entity.Property(e => e.VehicleId).HasColumnName("VehicleID");

            entity.HasOne(d => d.Vehicle).WithMany(p => p.VehicleMaintenanceLogs)
                .HasForeignKey(d => d.VehicleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VehicleMa__Vehic__2704CA5F");
        });

        modelBuilder.Entity<Voucher>(entity =>
        {
            entity.HasKey(e => e.VoucherId).HasName("PK__Vouchers__3AEE79C137A00021");

            entity.HasIndex(e => e.VoucherCode, "UQ__Vouchers__7F0ABCA973C3C967").IsUnique();

            entity.Property(e => e.VoucherId).HasColumnName("VoucherID");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.CustomerTier)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.DiscountAmount)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.DiscountPct)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(5, 2)");
            entity.Property(e => e.IsUsed).HasDefaultValue(false);
            entity.Property(e => e.MinOrderValue)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.VoucherCode)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.Customer).WithMany(p => p.Vouchers)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK__Vouchers__Custom__60A75C0F");
        });

        modelBuilder.Entity<VwCustomerDebt>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_CustomerDebt");

            entity.Property(e => e.CompanyName).HasMaxLength(200);
            entity.Property(e => e.CustomerCode)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.OutstandingDebt).HasColumnType("decimal(38, 8)");
            entity.Property(e => e.OverdueDebt).HasColumnType("decimal(38, 8)");
            entity.Property(e => e.Tier)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.TotalBilled).HasColumnType("decimal(38, 8)");
            entity.Property(e => e.TotalPaid).HasColumnType("decimal(38, 2)");
        });

        modelBuilder.Entity<VwDeadAndExpiryStock>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_DeadAndExpiryStock");

            entity.Property(e => e.AlertType)
                .HasMaxLength(11)
                .IsUnicode(false);
            entity.Property(e => e.BinCode)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.CustomerName).HasMaxLength(200);
            entity.Property(e => e.ProductName).HasMaxLength(300);
            entity.Property(e => e.Skucode)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("SKUCode");
        });

        modelBuilder.Entity<VwInventorySummary>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_InventorySummary");

            entity.Property(e => e.CategoryName).HasMaxLength(200);
            entity.Property(e => e.CustomerName).HasMaxLength(200);
            entity.Property(e => e.ProductName).HasMaxLength(300);
            entity.Property(e => e.Skucode)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("SKUCode");
        });

        modelBuilder.Entity<VwMonthlyRevenue>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_MonthlyRevenue");

            entity.Property(e => e.CollectedAmount).HasColumnType("decimal(38, 2)");
            entity.Property(e => e.GrossRevenue).HasColumnType("decimal(38, 8)");
            entity.Property(e => e.NetRevenue).HasColumnType("decimal(38, 2)");
            entity.Property(e => e.OutstandingAmount).HasColumnType("decimal(38, 8)");
            entity.Property(e => e.TotalVat)
                .HasColumnType("decimal(38, 8)")
                .HasColumnName("TotalVAT");
        });

        modelBuilder.Entity<VwVehiclePerformance>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_VehiclePerformance");

            entity.Property(e => e.DefaultDriver).HasMaxLength(200);
            entity.Property(e => e.TruckPlate)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.VehicleType)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<VwWarehouseUtilization>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_WarehouseUtilization");

            entity.Property(e => e.WarehouseCode)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.WarehouseName).HasMaxLength(200);
            entity.Property(e => e.ZoneCode)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.ZoneName).HasMaxLength(100);
            entity.Property(e => e.ZoneType)
                .HasMaxLength(30)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Warehouse>(entity =>
        {
            entity.HasKey(e => e.WarehouseId).HasName("PK__Warehous__2608AFD9CC97172D");

            entity.HasIndex(e => e.WarehouseCode, "UQ__Warehous__1686A0569F2F8A8B").IsUnique();

            entity.Property(e => e.WarehouseId).HasColumnName("WarehouseID");
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.TotalCapacity).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.WarehouseCode)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.WarehouseName).HasMaxLength(200);
        });

        modelBuilder.Entity<WarehouseBin>(entity =>
        {
            entity.HasKey(e => e.BinId).HasName("PK__Warehous__4BFF5A4E1D1FFFDA");

            entity.HasIndex(e => e.BinCode, "UQ__Warehous__6343424506A26A7C").IsUnique();

            entity.Property(e => e.BinId).HasColumnName("BinID");
            entity.Property(e => e.BinCode)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.BinType)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.CapacityCbm)
                .HasColumnType("decimal(8, 3)")
                .HasColumnName("CapacityCBM");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.IsOccupied).HasDefaultValue(false);
            entity.Property(e => e.MaxWeightKg).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.ShelfId).HasColumnName("ShelfID");

            entity.HasOne(d => d.Shelf).WithMany(p => p.WarehouseBins)
                .HasForeignKey(d => d.ShelfId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Warehouse__Shelf__02084FDA");
        });

        modelBuilder.Entity<WarehouseShelf>(entity =>
        {
            entity.HasKey(e => e.ShelfId).HasName("PK__Warehous__DBD04F2766ED28D6");

            entity.Property(e => e.ShelfId).HasColumnName("ShelfID");
            entity.Property(e => e.FloorLevel).HasDefaultValue((byte)1);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.MaxWeightKg).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.ShelfCode)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.ZoneId).HasColumnName("ZoneID");

            entity.HasOne(d => d.Zone).WithMany(p => p.WarehouseShelves)
                .HasForeignKey(d => d.ZoneId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Warehouse__ZoneI__7C4F7684");
        });

        modelBuilder.Entity<WarehouseZone>(entity =>
        {
            entity.HasKey(e => e.ZoneId).HasName("PK__Warehous__601667955288468D");

            entity.Property(e => e.ZoneId).HasColumnName("ZoneID");
            entity.Property(e => e.Capacity).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.WarehouseId).HasColumnName("WarehouseID");
            entity.Property(e => e.ZoneCode)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.ZoneName).HasMaxLength(100);
            entity.Property(e => e.ZoneType)
                .HasMaxLength(30)
                .IsUnicode(false);

            entity.HasOne(d => d.Warehouse).WithMany(p => p.WarehouseZones)
                .HasForeignKey(d => d.WarehouseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Warehouse__Wareh__787EE5A0");
        });

        modelBuilder.Entity<VehicleEvent>(entity =>
        {
            entity.HasKey(e => e.EventId).HasName("PK__VehicleEvents__EventID");

            entity.ToTable("VehicleEvents");

            entity.Property(e => e.EventId).HasColumnName("EventID");
            entity.Property(e => e.VehicleId).HasColumnName("VehicleID");
            entity.Property(e => e.EventType)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.EventTime)
                .HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Remarks).HasMaxLength(500);

            entity.HasOne(d => d.Vehicle).WithMany(p => p.VehicleEvents)
                .HasForeignKey(d => d.VehicleId)
                .HasConstraintName("FK__VehicleEvents__Vehicles");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
