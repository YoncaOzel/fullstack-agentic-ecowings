using CleanArchitecture.Core.Entities;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace CleanArchitecture.Core.Interfaces.Repositories
{
    public interface IFlightRepositoryAsync : IGenericRepositoryAsync<Flight>
    {
        // İstediğin ekstra Flight'a özel metodlar olursa buraya ekle
        Task<IEnumerable<Flight>> GetFlightsByDestinationAsync(string destinationName);
    }
}
