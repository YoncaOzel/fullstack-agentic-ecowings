using System.Threading.Tasks;
using System.Threading;
using MediatR;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Exceptions;

namespace CleanArchitecture.Core.Features.Auth.Commands.LoginUser
{
    public class LoginUserCommand : IRequest<string> // Token dönecek
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public class LoginUserCommandHandler : IRequestHandler<LoginUserCommand, string>
        {
            private readonly IUserRepositoryAsync _userRepository;
            private readonly ITokenService _tokenService;

            public LoginUserCommandHandler(IUserRepositoryAsync userRepository, ITokenService tokenService)
            {
                _userRepository = userRepository;
                _tokenService = tokenService;
            }

            public async Task<string> Handle(LoginUserCommand request, CancellationToken cancellationToken)
            {
                var user = await _userRepository.GetByEmailAsync(request.Email);
                if (user == null)
                    throw new UnauthorizedException("Invalid credentials.");

                bool passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
                if (!passwordValid)
                    throw new UnauthorizedException("Invalid credentials.");

                var token = _tokenService.GenerateToken(user);
                return token;
            }
        }
    }
}
