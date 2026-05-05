using CleanArchitecture.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Interfaces
{
    // IGenericRepositoryAsync'in tüm özelliklerini miras alır
    public interface IAirportRepositoryAsync : IGenericRepositoryAsync<Airport>
    {
        // Sadece Airport'a özel olan arama metodumuz
        Task<List<Airport>> SearchAirportsAsync(string searchTerm, int count);
    }
}