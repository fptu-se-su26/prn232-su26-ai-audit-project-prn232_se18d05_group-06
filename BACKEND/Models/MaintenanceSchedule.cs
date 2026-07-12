using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BACKEND.Models;

public partial class MaintenanceSchedule
{
    [Key]
    public int Id { get; set; }

    public int VehicleId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Type { get; set; } = string.Empty;

    public DateTime DueDate { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "PENDING";

    [MaxLength(500)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    [ForeignKey("VehicleId")]
    public virtual Vehicle? Vehicle { get; set; }
}
