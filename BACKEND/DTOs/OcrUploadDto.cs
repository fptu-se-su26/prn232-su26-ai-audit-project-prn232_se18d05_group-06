namespace BACKEND.DTOs;

/// <summary>
/// Wrapper for the OCR multipart upload. Using a wrapper DTO instead of mixing
/// [FromForm] IFormFile with primitive [FromForm] parameters avoids Swashbuckle's
/// "Error reading parameter(s) for action ... as [FromForm] attribute used with
/// IFormFile" failure on .NET 9 with Swashbuckle.AspNetCore 10.x.
/// </summary>
public class OcrUploadDto
{
    public Microsoft.AspNetCore.Http.IFormFile? File { get; set; }
    public int WarehouseId { get; set; }
    public int CustomerId { get; set; }
}