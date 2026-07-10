using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace BACKEND.Services
{
    public class InvoiceOcrResultDto
    {
        public string SenderPhone { get; set; } = string.Empty;
        public string ReceiverPhone { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        public string ReceiverName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty; // Receiver address (legacy name)
        public decimal? ReceiverLat { get; set; }
        public decimal? ReceiverLng { get; set; }
        public string SenderAddress { get; set; } = string.Empty;
        public decimal? SenderLat { get; set; }
        public decimal? SenderLng { get; set; }
        public double WeightKg { get; set; }
        
        public string ItemName { get; set; } = string.Empty;
        public double? ItemValue { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string DeliverySpeed { get; set; } = string.Empty;
        
        public string RawText { get; set; } = string.Empty;
        public bool IsInvoice { get; set; } = true;
        public string Message { get; set; } = string.Empty;
    }

    public interface IInvoiceOcrService
    {
        Task<InvoiceOcrResultDto> ScanInvoiceAsync(IFormFile imageFile);
    }
}
