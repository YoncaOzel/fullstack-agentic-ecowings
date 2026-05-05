using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;
using CleanArchitecture.Core.DTOs.User;

namespace CleanArchitecture.Core.Features.Users.Queries.GetAllUsers
{
    public class GetAllUsersQuery : IRequest<List<UserDto>>
    {
        public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, List<UserDto>>
        {
            private readonly IGenericRepositoryAsync<User> _userRepository;

            public GetAllUsersQueryHandler(IGenericRepositoryAsync<User> userRepository)
            {
                _userRepository = userRepository;
            }

            public async Task<List<UserDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
            {
                var users = await _userRepository.GetAllAsync();

                return users.Select(u => new UserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    Role = u.Role,
                    DateOfBirth = u.DateOfBirth,
                    Gender = u.Gender,
                    PhoneNumber = u.PhoneNumber
                }).ToList();
            }
        }
    }
}
