using MediatR;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Features.Auth.Commands.ForgetPassword;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Settings;
using CleanArchitecture.Infrastructure.Contexts;
using CleanArchitecture.Infrastructure.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Infrastructure.Handlers
{
    public class ForgetPasswordCommandHandler : IRequestHandler<ForgetPasswordCommand, bool>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailService _emailService;
        private readonly ApplicationDbContext _dbContext;
        private readonly PasswordResetSettings _resetSettings;
        private readonly ILogger<ForgetPasswordCommandHandler> _logger;
        private readonly string _frontendUrl;

        public ForgetPasswordCommandHandler(
            UserManager<ApplicationUser> userManager,
            IEmailService emailService,
            ApplicationDbContext dbContext,
            IOptions<PasswordResetSettings> resetSettings,
            IConfiguration configuration,
            ILogger<ForgetPasswordCommandHandler> logger)
        {
            _userManager   = userManager;
            _emailService  = emailService;
            _dbContext     = dbContext;
            _resetSettings = resetSettings.Value;
            _frontendUrl   = configuration["FrontendURL"] ?? "http://localhost:3000";
            _logger        = logger;
        }

        public async Task<bool> Handle(ForgetPasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                _logger.LogWarning("Forgot-password requested for unknown email (suppressed): {Email}", request.Email);
                return true; 
            }

            try
            {
                var rawTokenBytes = new byte[32];
                using (var rng = RandomNumberGenerator.Create())
                {
                    rng.GetBytes(rawTokenBytes);
                }
                var rawToken = Convert.ToBase64String(rawTokenBytes);

                var hashedToken = HashToken(rawToken);

                var expiryDate = DateTime.UtcNow.AddMinutes(_resetSettings.TokenExpirationMinutes);
                var tokenRecord = new PasswordResetToken
                {
                    HashedToken = hashedToken,
                    UserId      = user.Id,
                    ExpiryDate  = expiryDate,
                    IsUsed      = false,
                    CreatedAt   = DateTime.UtcNow
                };
                _dbContext.PasswordResetTokens.Add(tokenRecord);
                await _dbContext.SaveChangesAsync(cancellationToken);

                var encodedToken = Uri.EscapeDataString(rawToken);
                var encodedEmail = Uri.EscapeDataString(user.Email);
                var resetLink = $"{_frontendUrl}/reset-password?email={encodedEmail}&token={encodedToken}";

                await _emailService.SendAsync(new CleanArchitecture.Core.DTOs.Email.EmailRequest
                {
                    To      = user.Email,
                    Subject = "Reset Your Eco-Wings Password",
                    Body    = BuildHtmlEmailBody(user.FirstName ?? user.UserName, resetLink, _resetSettings.TokenExpirationMinutes)
                });

                _logger.LogInformation(
                    "Password reset email dispatched to {Email}. Token expires at {Expiry} UTC.",
                    user.Email, expiryDate);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing forgot-password for {Email}.", request.Email);
                return true;
            }
        }

        public static string HashToken(string rawToken)
        {
            var bytes = Encoding.UTF8.GetBytes(rawToken);
            var hash  = SHA256.HashData(bytes);
            return Convert.ToHexString(hash).ToLowerInvariant();
        }

        private static string BuildHtmlEmailBody(string displayName, string resetLink, int expiryMinutes)
        {
            return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"" />
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0""/>
  <title>Reset Your Password</title>
</head>
<body style=""margin:0;padding:0;background-color:#f4f7f9;font-family:'Segoe UI',Arial,sans-serif;"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#f4f7f9;padding:40px 0;"">
    <tr>
      <td align=""center"">
        <table width=""600"" cellpadding=""0"" cellspacing=""0""
               style=""background:#ffffff;border-radius:12px;overflow:hidden;
                       box-shadow:0 4px 24px rgba(0,0,0,0.08);"">

          <!-- Header -->
          <tr>
            <td style=""background:linear-gradient(135deg,#1a6b3c 0%,#25a65e 100%);
                        padding:36px 40px;text-align:center;"">
              <h1 style=""margin:0;color:#ffffff;font-size:28px;font-weight:700;
                          letter-spacing:-0.5px;"">🌿 Eco-Wings</h1>
              <p style=""margin:8px 0 0;color:#c8f0da;font-size:14px;"">
                Sustainable Travel, Reimagined
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style=""padding:40px 40px 32px;"">
              <h2 style=""margin:0 0 16px;color:#1a1a2e;font-size:22px;font-weight:600;"">
                Password Reset Request
              </h2>
              <p style=""margin:0 0 12px;color:#4a5568;font-size:15px;line-height:1.6;"">
                Hi <strong>{displayName}</strong>,
              </p>
              <p style=""margin:0 0 28px;color:#4a5568;font-size:15px;line-height:1.6;"">
                We received a request to reset the password for your Eco-Wings account.
                Click the button below to choose a new password. This link will expire in
                <strong>{expiryMinutes} minutes</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding=""0"" cellspacing=""0"" style=""margin:0 auto 28px;"">
                <tr>
                  <td style=""background:linear-gradient(135deg,#1a6b3c 0%,#25a65e 100%);
                              border-radius:8px;"">
                    <a href=""{resetLink}""
                       style=""display:inline-block;padding:14px 36px;color:#ffffff;
                               font-size:16px;font-weight:600;text-decoration:none;
                               letter-spacing:0.3px;"">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style=""margin:0 0 8px;color:#718096;font-size:13px;line-height:1.5;"">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style=""margin:0 0 28px;word-break:break-all;"">
                <a href=""{resetLink}"" style=""color:#25a65e;font-size:13px;"">{resetLink}</a>
              </p>

              <!-- Warning box -->
              <div style=""background:#fff8e1;border-left:4px solid #f6c90e;
                           border-radius:4px;padding:14px 18px;margin-bottom:24px;"">
                <p style=""margin:0;color:#856404;font-size:13px;line-height:1.5;"">
                  ⚠️ If you didn't request a password reset, you can safely ignore this
                  email. Your password will remain unchanged.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style=""background:#f8fafc;padding:24px 40px;border-top:1px solid #e8ecf0;
                        text-align:center;"">
              <p style=""margin:0;color:#a0aec0;font-size:12px;line-height:1.6;"">
                © {DateTime.UtcNow.Year} Eco-Wings · Sustainable Aviation Platform<br/>
                This is an automated message — please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>";
        }
    }
}
