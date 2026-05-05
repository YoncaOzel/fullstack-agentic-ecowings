using MediatR;
using CleanArchitecture.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading;
using System.Threading.Tasks;
using CleanArchitecture.Core.DTOs.Email;

namespace CleanArchitecture.Core.Features.Auth.Commands.SendConfirmEmail
{
    public class SendConfirmEmailCommand : IRequest<bool>
    {
        public string Email { get; set; }

        public class SendConfirmEmailCommandHandler : IRequestHandler<SendConfirmEmailCommand, bool>
        {
            private readonly IUserIdentityService _userIdentityService;
            private readonly IEmailService _emailService;
            private readonly IConfiguration _configuration;

            public SendConfirmEmailCommandHandler(
                IUserIdentityService userIdentityService, 
                IEmailService emailService, 
                IConfiguration configuration)
            {
                _userIdentityService = userIdentityService;
                _emailService = emailService;
                _configuration = configuration;
            }

            public async Task<bool> Handle(SendConfirmEmailCommand request, CancellationToken cancellationToken)
            {
                var user = await _userIdentityService.FindUserByEmailAsync(request.Email);
                if (user == null) return false;

                var token = await _userIdentityService.GenerateEmailConfirmationTokenAsync(user.Id);
                var frontendUrl = _configuration["FrontendURL"] ?? "http://localhost:3000";
                var confirmationLink = $"{frontendUrl}/confirmemail?userId={user.Id}&token={Uri.EscapeDataString(token)}";

                await _emailService.SendAsync(new EmailRequest
                {
                    To = user.Email,
                    Subject = "Confirm your email",
                    Body = $"Click the following link to confirm your email: <a href='{confirmationLink}'>Confirm Email</a>"
                });

                return true;
            }
        }
    }
}
