namespace BACKEND.DTOs;

/// <summary>
/// Wrapper for the cargo photo upload. Uses a single DTO instead of mixing
/// [FromForm] IFormFile with primitive [FromForm] parameters so Swashbuckle 10.x
/// can generate the operation without raising
/// "[FromForm] attribute used with IFormFile".
/// </summary>
public class CargoPhotoUploadDto
{
    public Microsoft.AspNetCore.Http.IFormFile? File { get; set; }
    public string? PhotoAngle { get; set; }
    public bool IsDamaged { get; set; }
    public int? TakenBy { get; set; }
}