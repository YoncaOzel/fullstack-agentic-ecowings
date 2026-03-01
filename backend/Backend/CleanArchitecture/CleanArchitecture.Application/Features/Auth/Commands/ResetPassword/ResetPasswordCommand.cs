using MediatR;
using CleanArchitecture.Core.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Auth.Commands.ResetPassword
{
    public class ResetPasswordCommand : IRequest<bool>
    {
        public string UserId { get; set; }
        public string Token { get; set; }
        public string NewPassword { get; set; }

        public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, bool>
        {
            private readonly IUserIdentityService _userIdentityService;

            public ResetPasswordCommandHandler(IUserIdentityService userIdentityService)
            {
                _userIdentityService = userIdentityService;
            }

            public async Task<bool> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
            {
                return await _userIdentityService.ResetPasswordAsync(
                    request.UserId,
                    request.Token,
                    request.NewPassword);
            }
        }
    }
} 