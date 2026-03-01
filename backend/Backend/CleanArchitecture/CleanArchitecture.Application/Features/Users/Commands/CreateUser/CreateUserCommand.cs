using System;
using System.Threading;
using System.Threading.Tasks;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Enums;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces.Repositories;
using MediatR;
using BCrypt.Net;

namespace CleanArchitecture.Core.Features.Users.Commands.CreateUser
{
    public class CreateUserCommand : IRequest<int>
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordPlain { get; set; }
        public UserRoles Role { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string PhoneNumber { get; set; }

        public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, int>
        {
            private readonly IUserRepositoryAsync _userRepository;

            public CreateUserCommandHandler(IUserRepositoryAsync userRepository)
            {
                _userRepository = userRepository;
            }

            public async Task<int> Handle(CreateUserCommand request, CancellationToken cancellationToken)
            {
                var existingUser = await _userRepository.GetByEmailAsync(request.Email);
                if (existingUser != null) // <<< doğru kontrol bu!
                {
                    throw new UserAlreadyRegisteredException($"User with email {request.Email} has already registered.");
                }

                var user = new User
                {
                    Name = request.Name,
                    Email = request.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.PasswordPlain),
                    Role = request.Role,
                    DateOfBirth = request.DateOfBirth,
                    Gender = request.Gender,
                    PhoneNumber = request.PhoneNumber
                };

                await _userRepository.AddAsync(user);
                return user.Id;
            }
        }
    }
}
