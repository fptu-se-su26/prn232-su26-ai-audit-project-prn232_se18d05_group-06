using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BACKEND.Models;

public partial class InspectionRecord
{
    [Key]
    public int Id { get; set; }

    public int VehicleId { get; set; }

    public DateTime InspectionDate { get; set; }

    public DateTime? ExpiryDate { get; set; }

    [MaxLength(20)]
    public string Result { get; set; } // PASS, FAIL

    [MaxLength(100)]
    public string InspectorName { get; set; }

    [MaxLength(500)]
    public string Notes { get; set; }

    [MaxLength(500)]
    public string? DocumentUrl { get; set; }

    [ForeignKey("VehicleId")]
    public virtual Vehicle Vehicle { get; set; }
}
