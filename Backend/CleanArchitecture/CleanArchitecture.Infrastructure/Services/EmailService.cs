using CleanArchitecture.Core.DTOs.Email;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Settings;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Threading.Tasks;


namespace CleanArchitecture.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        public MailSettings _mailSettings { get; }
        public ILogger<EmailService> _logger { get; }

        public EmailService(IOptions<MailSettings> mailSettings, ILogger<EmailService> logger)
        {
            _mailSettings = mailSettings.Value;
            _logger = logger;
            
            // Check for environment variables
            var envHost = Environment.GetEnvironmentVariable("SMTP_HOST");
            var envPort = Environment.GetEnvironmentVariable("SMTP_PORT");
            var envUser = Environment.GetEnvironmentVariable("SMTP_USER");
            var envPass = Environment.GetEnvironmentVariable("SMTP_PASS");
            var envFrom = Environment.GetEnvironmentVariable("SMTP_FROM");
            
            // Override with environment variables if they exist
            if (!string.IsNullOrEmpty(envHost)) _mailSettings.SmtpHost = envHost;
            if (!string.IsNullOrEmpty(envPort) && int.TryParse(envPort, out int port)) _mailSettings.SmtpPort = port;
            if (!string.IsNullOrEmpty(envUser)) _mailSettings.SmtpUser = envUser;
            if (!string.IsNullOrEmpty(envPass)) _mailSettings.SmtpPass = envPass;
            if (!string.IsNullOrEmpty(envFrom)) _mailSettings.EmailFrom = envFrom;
            
            // Log mail settings (excluding password)
            _logger.LogInformation($"Email Service initialized with: Host={_mailSettings.SmtpHost}, Port={_mailSettings.SmtpPort}, User={_mailSettings.SmtpUser}, From={_mailSettings.EmailFrom}");
        }

        public async Task SendAsync(EmailRequest request)
        {
            try
            {
                _logger.LogInformation($"Preparing to send email to {request.To} with subject '{request.Subject}'");
                
                // create message
                var email = new MimeMessage();
                email.Sender = MailboxAddress.Parse(request.From ?? _mailSettings.EmailFrom);
                email.To.Add(MailboxAddress.Parse(request.To));
                email.Subject = request.Subject;
                var builder = new BodyBuilder();
                builder.HtmlBody = request.Body;
                email.Body = builder.ToMessageBody();
                
                _logger.LogInformation($"Connecting to SMTP server {_mailSettings.SmtpHost}:{_mailSettings.SmtpPort}");
                
                using var smtp = new SmtpClient();
                smtp.ServerCertificateValidationCallback = (s, c, h, e) => true; // For testing only - not for production
                
                await smtp.ConnectAsync(_mailSettings.SmtpHost, _mailSettings.SmtpPort, SecureSocketOptions.StartTls);
                
                _logger.LogInformation($"Authenticating with username {_mailSettings.SmtpUser}");
                await smtp.AuthenticateAsync(_mailSettings.SmtpUser, _mailSettings.SmtpPass);
                
                _logger.LogInformation("Sending email...");
                await smtp.SendAsync(email);
                
                _logger.LogInformation("Email sent successfully");
                await smtp.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Email sending failed: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                
                if (ex.InnerException != null)
                {
                    _logger.LogError($"Inner exception: {ex.InnerException.Message}");
                }
                
                throw new ApiException($"Email sending failed: {ex.Message}");
            }
        }
    }
}
