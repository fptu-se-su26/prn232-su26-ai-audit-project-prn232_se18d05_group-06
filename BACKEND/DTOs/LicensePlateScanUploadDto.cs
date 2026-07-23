namespace BACKEND.DTOs;

/// <summary>
/// Wrapper for the license plate scan multipart upload. Using a DTO wrapper
/// avoids Swashbuckle 10.x failing on actions with mixed IFormFile + primitive
/// [FromForm] parameters.
/// </summary>
public class LicensePlateScanUploadDto
{
    public Microsoft.AspNetCore.Http.IFormFile? ImageFile { get; set; }
    public string? EventType { get; set; }
}