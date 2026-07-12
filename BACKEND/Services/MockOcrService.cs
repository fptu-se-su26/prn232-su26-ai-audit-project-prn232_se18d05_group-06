using BACKEND.DTOs;
using Microsoft.AspNetCore.Http;

namespace BACKEND.Services
{
    public class MockOcrService : IOcrService
    {
        public Task<OcrResultDto> ExtractInboundDocumentAsync(IFormFile file)
        {
            // Tạm thời mock data cho đồ án
            var result = new OcrResultDto
            {
                Confidence = 88.5m,
                RawText = "SKU-ABC001 Nước ép cam ABC 1L Quantity 120 Batch BATCH-ABC-260701 Expiry 2026-12-31",
                Items = new List<OcrExtractedItemDto>
                {
                    new OcrExtractedItemDto
                    {
                        SkuCode = "SKU-ABC001",
                        ProductName = "Nước ép cam ABC 1L",
                        Quantity = 120,
                        BatchNo = "BATCH-ABC-260701",
                        ExpiryDate = new DateTime(2026, 12, 31),
                        Confidence = 88.5m
                    }
                }
            };

            return Task.FromResult(result);
        }
    }
}
