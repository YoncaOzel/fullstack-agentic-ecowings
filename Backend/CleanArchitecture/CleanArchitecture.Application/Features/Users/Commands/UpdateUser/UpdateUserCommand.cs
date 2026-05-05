using CleanArchitecture.Core.Enums;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces.Repositories;
using MediatR;
using System;
using System.Threading.Tasks;
using System.Threading;

namespace CleanArchitecture.Core.Features.Users.Commands.UpdateUser
{
    public class UpdateUserCommand : IRequest<int>
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PasswordPlain { get; set; }
        public UserRoles Role { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string PhoneNumber { get; set; }

        public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, int>
        {
            private readonly IUserRepositoryAsync _userRepository;

            public UpdateUserCommandHandler(IUserRepositoryAsync userRepository)
            {
                _userRepository = userRepository;
            }

            public async Task<int> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
            {
                var user = await _userRepository.GetByIdAsync(request.Id);
                if (user == null)
                    throw new NotFoundException($"User with id {request.Id} not found.");

                // Eğer email değiştiriliyorsa ve başka biriyle çakışıyorsa kontrol
                if (user.Email != request.Email)
                {
                    var userWithSameEmail = await _userRepository.GetByEmailAsync(request.Email);
                    if (userWithSameEmail != null)
                    {
                        throw new UserAlreadyRegisteredException($"Another user with email {request.Email} already exists.");
                    }
                }

                user.Name = $"{request.FirstName} {request.LastName}";
                user.Email = request.Email;
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.PasswordPlain);
                user.Role = request.Role;
                user.DateOfBirth = request.DateOfBirth;
                user.Gender = request.Gender;
                user.PhoneNumber = request.PhoneNumber;

                await _userRepository.UpdateAsync(user);

                return user.Id;
            }
        }
    }
}
