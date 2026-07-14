using BACKEND.DTOs;
using Microsoft.AspNetCore.Http;

namespace BACKEND.Services
{
    public interface IOcrService
    {
        Task<OcrResultDto> ExtractInboundDocumentAsync(IFormFile file);
    }
}
