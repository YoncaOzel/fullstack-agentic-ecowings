using MediatR;

namespace CleanArchitecture.Core.Features.Auth.Commands.ForgetPassword
{
    public class ForgetPasswordCommand : IRequest<bool>
    {
        public string Email { get; set; }
    }
}