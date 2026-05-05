using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces.Repositories;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Users.Commands.ChangeUserPassword
{
    public class ChangeUserPasswordCommand : IRequest<bool>
    {
        public int UserId { get; set; }
        public string NewPasswordPlain { get; set; }

        public class ChangeUserPasswordCommandHandler : IRequestHandler<ChangeUserPasswordCommand, bool>
        {
            private readonly IUserRepositoryAsync _userRepository;

            public ChangeUserPasswordCommandHandler(IUserRepositoryAsync userRepository)
            {
                _userRepository = userRepository;
            }

            public async Task<bool> Handle(ChangeUserPasswordCommand request, CancellationToken cancellationToken)
            {
                var user = await _userRepository.GetByIdAsync(request.UserId);
                if (user == null) throw new NotFoundException($"User not found.");

                // Senin User tablondaki şifreyi kriptolayarak güncelliyoruz
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPasswordPlain);
                await _userRepository.UpdateAsync(user);

                return true;
            }
        }
    }
}