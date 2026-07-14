using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace BACKEND.DTOs;

public class CreateMaintenanceScheduleDto
{
    [Required]
    public int VehicleId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Type { get; set; } = string.Empty;

    [Required]
    public DateTime DueDate { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class UpdateMaintenanceScheduleDto
{
    [MaxLength(100)]
    public string? Type { get; set; }

    public DateTime? DueDate { get; set; }

    [MaxLength(20)]
    public string? Status { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class CreateInspectionRecordDto
{
    [Required]
    public int VehicleId { get; set; }

    [Required]
    public DateTime InspectionDate { get; set; }

    public DateTime? ExpiryDate { get; set; }

    [Required]
    [MaxLength(20)]
    public string Result { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? InspectorName { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public IFormFile? Document { get; set; }
}
