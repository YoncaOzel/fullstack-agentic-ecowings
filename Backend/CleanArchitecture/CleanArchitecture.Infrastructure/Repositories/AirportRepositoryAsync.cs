using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Infrastructure.Contexts;
using CleanArchitecture.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
// Kendi DbContext yolunu buraya ekle (Örn: using CleanArchitecture.Infrastructure.Contexts;)

namespace CleanArchitecture.Infrastructure.Repositories
{
    public class AirportRepositoryAsync : GenericRepositoryAsync<Airport>, IAirportRepositoryAsync
    {
        private readonly ApplicationDbContext _dbContext;

        public AirportRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }

        // 10.000 veri içinden sadece eşleşen 10 tanesini getiren performanslı sorgu
        public async Task<List<Airport>> SearchAirportsAsync(string searchTerm, int count)
        {
            return await _dbContext.Airports
                .Where(a => a.Name.ToLower().StartsWith(searchTerm.ToLower()) ||
                            a.Code.ToLower().StartsWith(searchTerm.ToLower()))
                .Take(count)
                .ToListAsync();
        }
    }
}