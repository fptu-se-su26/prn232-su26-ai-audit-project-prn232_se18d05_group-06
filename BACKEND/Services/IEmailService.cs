using System;
using System.Threading.Tasks;

namespace BACKEND.Services
{
    public interface IEmailService
    {
        Task SendBookingConfirmationEmailAsync(
            string recipientEmail, 
            string bookingId, 
            string licensePlate, 
            string dockName, 
            string warehouseName, 
            DateTime startTime, 
            DateTime endTime, 
            string qrCodeBase64);

        Task SendEmailAsync(string toEmail, string subject, string body);

        Task SendEmailWithAttachmentAsync(string toEmail, string subject, string body, byte[] attachmentBytes, string attachmentName);
    }
}
