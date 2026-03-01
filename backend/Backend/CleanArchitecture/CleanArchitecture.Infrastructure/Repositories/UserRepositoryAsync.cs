using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Infrastructure.Contexts;
using CleanArchitecture.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace CleanArchitecture.Infrastructure.Repositories
{
    public class UserRepositoryAsync : GenericRepositoryAsync<User>, IUserRepositoryAsync
    {
        private readonly ApplicationDbContext _dbContext;

        public UserRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            return await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await _dbContext.Users.AnyAsync(u => u.Email == email);
        }
    }
}
