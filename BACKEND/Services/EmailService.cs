using System.Net;
using System.Net.Mail;

namespace BACKEND.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var host = _configuration["EmailSettings:SmtpHost"];
            var port = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
            var user = _configuration["EmailSettings:SmtpUser"];
            var pass = _configuration["EmailSettings:SmtpPass"];
            var senderEmail = _configuration["EmailSettings:SenderEmail"];
            var senderName = _configuration["EmailSettings:SenderName"];
            var enableSsl = bool.Parse(_configuration["EmailSettings:EnableSsl"] ?? "true");

            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(pass) || pass == "your_app_password_here")
            {
                _logger.LogWarning("Email sending is skipped because SMTP credentials are not configured correctly in appsettings.json.");
                _logger.LogInformation("SIMULATED EMAIL TO: {To}\nSUBJECT: {Subject}\nBODY: {Body}", toEmail, subject, body);
                return;
            }

            try
            {
                using var client = new SmtpClient(host, port)
                {
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(user, pass),
                    EnableSsl = enableSsl,
                    DeliveryMethod = SmtpDeliveryMethod.Network
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail!, senderName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
                _logger.LogInformation("Email sent successfully to {To}", toEmail);
            }
            catch (SmtpException ex) when (
                ex.Message.Contains("Authentication Required", StringComparison.OrdinalIgnoreCase) ||
                ex.Message.Contains("not authenticated", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning(
                    "Email sending is simulated because SMTP authentication failed for {User}. To send real email, configure an app password or valid SMTP credentials.",
                    user);
                _logger.LogInformation("SIMULATED EMAIL TO: {To}\nSUBJECT: {Subject}\nBODY: {Body}", toEmail, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {To}", toEmail);
                throw;
            }
        }
    }
}
