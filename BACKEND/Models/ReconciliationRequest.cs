using Microsoft.AspNetCore.Http;

namespace BACKEND.Models
{
    public class ReconciliationRequest
    {
        public IFormFile? ActualCountFile { get; set; }   // Excel upload
        public int? WarehouseId { get; set; }            // optional filter
        public decimal ThresholdPercentage { get; set; } = 0.10m; // default 10%
    }
}
