using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces.Repositories;
using CleanArchitecture.Infrastructure.Contexts;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CleanArchitecture.Infrastructure.Repository
{
    public class FlightRepositoryAsync : GenericRepositoryAsync<Flight>, IFlightRepositoryAsync
    {
        private readonly ApplicationDbContext _dbContext;

        public FlightRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<Flight>> GetFlightsByDestinationAsync(string destinationName)
        {
            return await _dbContext.Flights
                .Include(f => f.Departure)
                .Include(f => f.Destination)
                .Include(f => f.Airline)
                .Where(f => f.Destination.Name.Contains(destinationName))
                .ToListAsync();
        }
    }
}
