using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;

namespace CleanArchitecture.Core.Features.Flights.Queries.GetAllFlights
{
    public class GetAllFlightsQuery : IRequest<List<Flight>>
    {

        public class GetAllFlightsQueryHandler : IRequestHandler<GetAllFlightsQuery, List<Flight>>
        {
            private readonly IGenericRepositoryAsync<Flight> _flightRepository;

            public GetAllFlightsQueryHandler(IGenericRepositoryAsync<Flight> flightRepository)
            {
                _flightRepository = flightRepository;
            }

            public async Task<List<Flight>> Handle(GetAllFlightsQuery request, CancellationToken cancellationToken)
            {
                var flights = await _flightRepository.GetAllAsync();
                return flights.ToList();
            }
        }
    }
}
