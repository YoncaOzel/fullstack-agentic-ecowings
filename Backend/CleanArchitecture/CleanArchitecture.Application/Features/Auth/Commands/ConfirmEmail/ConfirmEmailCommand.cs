using MediatR;
using CleanArchitecture.Core.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Auth.Commands.ConfirmEmail
{
    public class ConfirmEmailCommand : IRequest<bool>
    {
        public string UserId { get; set; }
        public string Token { get; set; }

        public class ConfirmEmailCommandHandler : IRequestHandler<ConfirmEmailCommand, bool>
        {
            private readonly IUserIdentityService _userIdentityService;

            public ConfirmEmailCommandHandler(IUserIdentityService userIdentityService)
            {
                _userIdentityService = userIdentityService;
            }

            public async Task<bool> Handle(ConfirmEmailCommand request, CancellationToken cancellationToken)
            {
                return await _userIdentityService.ConfirmEmailAsync(request.UserId, request.Token);
            }
        }
    }
} 