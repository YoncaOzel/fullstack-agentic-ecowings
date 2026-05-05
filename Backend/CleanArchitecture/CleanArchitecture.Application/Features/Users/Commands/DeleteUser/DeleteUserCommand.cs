using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using System.Threading.Tasks;
using System.Threading;
using MediatR;

namespace CleanArchitecture.Core.Features.Users.Commands.DeleteUser
{
    public class DeleteUserCommand : IRequest<int>
    {
        public int Id { get; set; }
    }
    public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, int>
    {
        private readonly IGenericRepositoryAsync<User> _userRepository;

        public DeleteUserCommandHandler(IGenericRepositoryAsync<User> userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<int> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByIdAsync(request.Id);
            if (user == null)
                throw new System.Exception("User not found.");

            await _userRepository.DeleteAsync(user);
            return user.Id;
        }
    }
}
