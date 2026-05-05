using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces; // IAirportRepositoryAsync için gerekli
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Airports.Queries.SearchAirports
{
    public class SearchAirportsQuery : IRequest<List<Airport>>
    {
        public string SearchTerm { get; set; }
    }

    public class SearchAirportsQueryHandler : IRequestHandler<SearchAirportsQuery, List<Airport>>
    {
        private readonly IAirportRepositoryAsync _airportRepository;

        public SearchAirportsQueryHandler(IAirportRepositoryAsync airportRepository)
        {
            _airportRepository = airportRepository;
        }

        public async Task<List<Airport>> Handle(SearchAirportsQuery request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.SearchTerm))
                return new List<Airport>();

            // Doğrudan yazdığımız yeni metodu çağırıyoruz (Sadece 10 sonuç getirecek)
            var airports = await _airportRepository.SearchAirportsAsync(request.SearchTerm, 10);

            return airports;
        }
    }
}