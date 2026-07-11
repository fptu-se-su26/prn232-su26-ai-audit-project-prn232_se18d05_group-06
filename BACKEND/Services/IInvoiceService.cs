using System.Collections.Generic;
using System.Threading.Tasks;
using BACKEND.Models;

namespace BACKEND.Services
{
    public interface IInvoiceService
    {
        Task<Invoice> GenerateInvoiceFromOrderAsync(int orderId);
        Task<List<ServiceOrder>> GetCompletedOrdersWithoutInvoiceAsync();
        Task<List<Invoice>> GetInvoicesAsync(string? status, string? search, int? customerId = null);
        Task<Invoice?> GetInvoiceByIdAsync(int invoiceId);
        Task<bool> SendInvoiceEmailAsync(int invoiceId);
        Task<bool> SendPaymentConfirmationEmailAsync(int invoiceId, int? paymentId = null);
        Task<Invoice> RegenerateInvoicePdfAsync(int invoiceId);
        Task<Invoice> UpdateInvoiceStatusAsync(int invoiceId, string status);
    }
}
