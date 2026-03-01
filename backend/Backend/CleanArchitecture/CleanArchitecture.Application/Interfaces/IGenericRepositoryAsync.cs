using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Interfaces
{
    public interface IGenericRepositoryAsync<T> where T : class
    {
        Task<T> GetByIdAsync(int id);
        Task<IReadOnlyList<T>> GetAllAsync();
        Task<IReadOnlyList<T>> GetPagedReponseAsync(int pageNumber, int pageSize);
        Task<T> AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task DeleteAsync(T entity);
        Task<IReadOnlyList<T>> GetWithIncludeAsync(Expression<Func<T, bool>> predicate,params Expression<Func<T, object>>[] includes);
    }
}
