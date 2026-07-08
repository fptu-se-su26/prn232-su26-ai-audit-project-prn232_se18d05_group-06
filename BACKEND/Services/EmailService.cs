using System;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

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

        public async Task SendBookingConfirmationEmailAsync(
            string recipientEmail, 
            string bookingId, 
            string licensePlate, 
            string dockName, 
            string warehouseName, 
            DateTime startTime, 
            DateTime endTime, 
            string qrCodeBase64)
        {
            var formattedDate = startTime.ToString("dd/MM/yyyy");
            var formattedStartTime = startTime.ToString("HH:mm");
            var formattedEndTime = endTime.ToString("HH:mm");

            // Build premium HTML content
            var emailHtmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8' />
    <title>Xác nhận đặt lịch cửa kho - SmartLog AI</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 20px;
            color: #1f2937;
        }}
        .card {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
        }}
        .header {{
            background: linear-gradient(135deg, #004ac6 0%, #005e6e 100%);
            padding: 30px;
            text-align: center;
            color: #ffffff;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.025em;
        }}
        .header p {{
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }}
        .content {{
            padding: 30px;
        }}
        .booking-id-box {{
            background-color: #eff6ff;
            border: 1px dashed #bfdbfe;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            margin-bottom: 25px;
        }}
        .booking-id-label {{
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #1e40af;
            font-weight: 600;
        }}
        .booking-id-value {{
            font-size: 28px;
            font-weight: 800;
            color: #1d4ed8;
            margin-top: 5px;
        }}
        .detail-table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }}
        .detail-table td {{
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
        }}
        .detail-table td.label {{
            font-weight: 600;
            color: #6b7280;
            width: 40%;
            font-size: 14px;
        }}
        .detail-table td.value {{
            color: #111827;
            font-weight: 700;
            font-size: 14px;
            text-align: right;
        }}
        .qr-section {{
            text-align: center;
            padding: 20px;
            background-color: #fafafa;
            border-radius: 12px;
            border: 1px solid #f0f0f0;
        }}
        .qr-section p {{
            margin: 0 0 15px 0;
            font-size: 13px;
            color: #4b5563;
            font-weight: 500;
        }}
        .qr-image {{
            display: inline-block;
            padding: 10px;
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
        }}
        .footer {{
            padding: 20px 30px;
            background-color: #f9fafb;
            border-top: 1px solid #f3f4f6;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
        }}
    </style>
</head>
<body>
    <div class='card'>
        <div class='header'>
            <h1>Xác Nhận Đặt Lịch Cửa Kho</h1>
            <p>SmartLog AI Command Center</p>
        </div>
        <div class='content'>
            <div class='booking-id-box'>
                <div class='booking-id-label'>Mã Đặt Lịch (Booking ID)</div>
                <div class='booking-id-value'>{bookingId}</div>
            </div>

            <table class='detail-table'>
                <tr>
                    <td class='label'>Kho Hàng</td>
                    <td class='value'>{warehouseName}</td>
                </tr>
                <tr>
                    <td class='label'>Cửa Kho (Dock)</td>
                    <td class='value'>{dockName}</td>
                </tr>
                <tr>
                    <td class='label'>Biển Số Xe</td>
                    <td class='value'>{licensePlate}</td>
                </tr>
                <tr>
                    <td class='label'>Ngày Thực Hiện</td>
                    <td class='value'>{formattedDate}</td>
                </tr>
                <tr>
                    <td class='label'>Khung Giờ</td>
                    <td class='value'>{formattedStartTime} - {formattedEndTime}</td>
                </tr>
            </table>

            <div class='qr-section'>
                <p>Quét mã QR dưới đây khi đến trạm bảo vệ để làm thủ tục vào kho:</p>
                <div class='qr-image'>
                    <img src='data:image/png;base64,{qrCodeBase64}' width='180' height='180' alt='Booking QR Code' />
                </div>
            </div>
        </div>
        <div class='footer'>
            Hệ thống quản lý vận tải thông minh SmartLog AI &copy; 2026. Mọi quyền được bảo lưu.
        </div>
    </div>
</body>
</html>
";

            // Attempt to send email via SMTP
            var smtpHost = _configuration["SmtpSettings:Server"];
            var smtpPortString = _configuration["SmtpSettings:Port"];
            var smtpUser = _configuration["SmtpSettings:Username"];
            var smtpPass = _configuration["SmtpSettings:Password"];
            var senderEmail = _configuration["SmtpSettings:SenderEmail"] ?? "noreply@smartlog.vn";
            var senderName = _configuration["SmtpSettings:SenderName"] ?? "SmartLog AI System";

            bool emailSentSuccessfully = false;

            if (!string.IsNullOrEmpty(smtpHost) && !string.IsNullOrEmpty(smtpUser))
            {
                try
                {
                    int smtpPort = int.TryParse(smtpPortString, out int port) ? port : 587;
                    bool enableSsl = bool.TryParse(_configuration["SmtpSettings:EnableSsl"], out bool ssl) ? ssl : true;

                    using (var client = new SmtpClient(smtpHost, smtpPort))
                    {
                        client.UseDefaultCredentials = false;
                        client.Credentials = new NetworkCredential(smtpUser, smtpPass);
                        client.EnableSsl = enableSsl;

                        var mailMessage = new MailMessage
                        {
                            From = new MailAddress(senderEmail, senderName),
                            Subject = $"[SmartLog AI] Xác nhận đặt lịch cửa kho - Mã: {bookingId}",
                            Body = emailHtmlBody,
                            IsBodyHtml = true
                        };
                        mailMessage.To.Add(recipientEmail);

                        await client.SendMailAsync(mailMessage);
                        _logger.LogInformation($"Successfully sent booking confirmation email for {bookingId} to {recipientEmail} via SMTP.");
                        emailSentSuccessfully = true;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Failed to send email via SMTP for booking {bookingId}. Falling back to local file logging.");
                }
            }

            // Fallback: Write HTML email content to local directory BACKEND/SentEmails
            if (!emailSentSuccessfully)
            {
                try
                {
                    var projectRoot = AppDomain.CurrentDomain.BaseDirectory;
                    
                    if (projectRoot.Contains("bin"))
                    {
                        var binIndex = projectRoot.IndexOf("bin", StringComparison.OrdinalIgnoreCase);
                        projectRoot = projectRoot.Substring(0, binIndex);
                    }

                    var sentEmailsFolder = Path.Combine(projectRoot, "SentEmails");
                    if (!Directory.Exists(sentEmailsFolder))
                    {
                        Directory.CreateDirectory(sentEmailsFolder);
                    }

                    var safeBookingId = bookingId.Replace(":", "-").Replace("\\", "-").Replace("/", "-");
                    var filePath = Path.Combine(sentEmailsFolder, $"booking-{safeBookingId}.html");

                    await File.WriteAllTextAsync(filePath, emailHtmlBody);
                    _logger.LogInformation($"[FALLBACK] Email logged to local file: {filePath}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to write email backup file locally.");
                }
            }
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
