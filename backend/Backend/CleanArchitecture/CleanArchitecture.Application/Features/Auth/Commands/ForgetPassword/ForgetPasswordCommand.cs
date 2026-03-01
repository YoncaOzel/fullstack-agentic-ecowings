using MediatR;
using CleanArchitecture.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading;
using System.Threading.Tasks;
using CleanArchitecture.Core.DTOs.Email;
using Microsoft.Extensions.Logging;

namespace CleanArchitecture.Core.Features.Auth.Commands.ForgetPassword
{
    public class ForgetPasswordCommand : IRequest<bool>
    {
        public string Email { get; set; }

        public class ForgetPasswordCommandHandler : IRequestHandler<ForgetPasswordCommand, bool>
        {
            private readonly IUserIdentityService _userIdentityService;
            private readonly IEmailService _emailService;
            private readonly IConfiguration _configuration;
            private readonly ILogger<ForgetPasswordCommandHandler> _logger;

            public ForgetPasswordCommandHandler(
                IUserIdentityService userIdentityService,
                IEmailService emailService,
                IConfiguration configuration,
                ILogger<ForgetPasswordCommandHandler> logger)
            {
                _userIdentityService = userIdentityService;
                _emailService = emailService;
                _configuration = configuration;
                _logger = logger;
            }

            public async Task<bool> Handle(ForgetPasswordCommand request, CancellationToken cancellationToken)
            {
                try
                {
                    var user = await _userIdentityService.FindUserByEmailAsync(request.Email);
                    if (user == null)
                    {
                        _logger.LogWarning($"Password reset attempted for non-existent email: {request.Email}");
                        return false;
                    }

                    var token = await _userIdentityService.GeneratePasswordResetTokenAsync(user.Id);
                    var frontendUrl = _configuration["FrontendURL"] ?? "http://localhost:3000";
                    var resetLink = $"{frontendUrl}/reset-password?userId={user.Id}&token={Uri.EscapeDataString(token)}";

                    await _emailService.SendAsync(new EmailRequest
                    {
                        To = user.Email,
                        Subject = "Reset Password",
                        Body = $"Click the following link to reset your password: <a href='{resetLink}'>Reset Password</a>"
                    });

                    _logger.LogInformation($"Password reset email sent to: {user.Email}");
                    return true;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error in ForgetPasswordCommand for email {request.Email}: {ex.Message}");
                    return false;
                }
            }
        }
    }
} 