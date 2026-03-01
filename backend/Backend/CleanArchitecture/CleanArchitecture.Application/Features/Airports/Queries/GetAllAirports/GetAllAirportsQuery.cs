using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;

namespace CleanArchitecture.Core.Features.Airports.Queries.GetAllAirports
{
    public class GetAllAirportsQuery : IRequest<List<Airport>>
    {
        public class GetAllAirportsQueryHandler : IRequestHandler<GetAllAirportsQuery, List<Airport>>
        {
            private readonly IGenericRepositoryAsync<Airport> _airportRepository;

            public GetAllAirportsQueryHandler(IGenericRepositoryAsync<Airport> airportRepository)
            {
                _airportRepository = airportRepository;
            }

            public async Task<List<Airport>> Handle(GetAllAirportsQuery request, CancellationToken cancellationToken)
            {
                var airports = await _airportRepository.GetAllAsync();
                return airports.ToList();
            }
        }
    }
}
