using System.Threading.Tasks;
using System.Threading;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces.Repositories;
using MediatR;
using CleanArchitecture.Core.DTOs.User;

namespace CleanArchitecture.Core.Features.Users.Queries.GetUserById
{
    public class GetUserByIdQuery : IRequest<UserDto>
    {
        public int Id { get; set; }
        public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserDto>
        {
            private readonly IUserRepositoryAsync _userRepository;

            public GetUserByIdQueryHandler(IUserRepositoryAsync userRepository)
            {
                _userRepository = userRepository;
            }

            public async Task<UserDto> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
            {
                var user = await _userRepository.GetByIdAsync(request.Id);
                if (user == null)
                    throw new NotFoundException($"User with id {request.Id} not found.");

                return new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role,
                    DateOfBirth = user.DateOfBirth,
                    Gender = user.Gender,
                    PhoneNumber = user.PhoneNumber
                };
            }
        }
    }
}
