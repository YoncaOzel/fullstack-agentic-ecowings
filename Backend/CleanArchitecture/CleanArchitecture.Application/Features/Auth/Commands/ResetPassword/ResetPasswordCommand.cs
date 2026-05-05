using MediatR;

namespace CleanArchitecture.Core.Features.Auth.Commands.ResetPassword
{
    public class ResetPasswordCommand : IRequest<bool>
    {
        public string Email { get; set; }
        public string Token { get; set; }
        public string NewPassword { get; set; }
    }
}