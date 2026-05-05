using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CleanArchitecture.Core.Entities;

namespace CleanArchitecture.Core.Interfaces.Repositories
{
    public interface IUserRepositoryAsync:IGenericRepositoryAsync<User>
    {
        Task<User> GetByEmailAsync(string email); // login için kullanılabilir
        Task<bool> ExistsByEmailAsync(string email); // duplicate kontrolü
    }
}
