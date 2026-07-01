using Microsoft.EntityFrameworkCore;

namespace BACKEND.Models;

public partial class SmartLogAiContext
{
    public virtual DbSet<VehicleDockSession> VehicleDockSessions { get; set; }

    public virtual DbSet<OverstayAlert> OverstayAlerts { get; set; }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<VehicleDockSession>(entity =>
        {
            entity.HasKey(e => e.SessionId);
            entity.HasIndex(e => new { e.DockId, e.DockStartTime });
            entity.HasIndex(e => new { e.CurrentStatus, e.DockEndTime });

            entity.Property(e => e.SessionId).HasColumnName("SessionID");
            entity.Property(e => e.VehicleId).HasColumnName("VehicleID");
            entity.Property(e => e.BookingId).HasColumnName("BookingID");
            entity.Property(e => e.DockId).HasColumnName("DockID");
            entity.Property(e => e.CurrentStatus).HasMaxLength(30).IsUnicode(false);
            entity.Property(e => e.ServiceType).HasMaxLength(30).IsUnicode(false);
            entity.Property(e => e.CargoType).HasMaxLength(50).IsUnicode(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Vehicle).WithMany()
                .HasForeignKey(d => d.VehicleId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.Booking).WithMany()
                .HasForeignKey(d => d.BookingId);

            entity.HasOne(d => d.Dock).WithMany()
                .HasForeignKey(d => d.DockId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<OverstayAlert>(entity =>
        {
            entity.HasKey(e => e.AlertId);
            entity.HasIndex(e => new { e.AlertStatus, e.AlertLevel });
            entity.HasIndex(e => e.VehicleDockSessionId);

            entity.Property(e => e.AlertId).HasColumnName("AlertID");
            entity.Property(e => e.VehicleDockSessionId).HasColumnName("VehicleDockSessionID");
            entity.Property(e => e.VehicleId).HasColumnName("VehicleID");
            entity.Property(e => e.DockId).HasColumnName("DockID");
            entity.Property(e => e.AlertLevel).HasMaxLength(30).IsUnicode(false);
            entity.Property(e => e.AlertStatus).HasMaxLength(30).IsUnicode(false).HasDefaultValue("OPEN");
            entity.Property(e => e.AlertMessage).HasMaxLength(500);
            entity.Property(e => e.Reason).HasMaxLength(500);
            entity.Property(e => e.ActionTaken).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.VehicleDockSession).WithMany(p => p.OverstayAlerts)
                .HasForeignKey(d => d.VehicleDockSessionId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.Vehicle).WithMany()
                .HasForeignKey(d => d.VehicleId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.Dock).WithMany()
                .HasForeignKey(d => d.DockId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.ResolvedByNavigation).WithMany()
                .HasForeignKey(d => d.ResolvedBy);
        });
    }
}
