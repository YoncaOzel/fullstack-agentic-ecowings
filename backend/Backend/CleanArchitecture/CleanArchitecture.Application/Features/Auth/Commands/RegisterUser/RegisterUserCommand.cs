using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Enums;
using CleanArchitecture.Core.Exceptions;
using MediatR;
using System;
using System.Threading.Tasks;
using System.Threading;
using CleanArchitecture.Core.Interfaces.Repositories;

namespace CleanArchitecture.Core.Features.Auth.Commands.RegisterUser
{
    public class RegisterUserCommand : IRequest<int>
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordPlain { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string PhoneNumber { get; set; }

        public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, int>
        {
            private readonly IUserRepositoryAsync _userRepository;

            public RegisterUserCommandHandler(IUserRepositoryAsync userRepository)
            {
                _userRepository = userRepository;
            }

            public async Task<int> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
            {
                var existingUser = await _userRepository.GetByEmailAsync(request.Email);
                if (existingUser != null)
                    throw new UserAlreadyRegisteredException($"Email {request.Email} is already registered.");

                var user = new User
                {
                    Name = request.Name,
                    Email = request.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.PasswordPlain),
                    Role = UserRoles.Customer, // Default olarak User atanıyor
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
