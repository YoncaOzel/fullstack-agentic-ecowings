using System.Threading.Tasks;
using System.Threading;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using MediatR;

namespace CleanArchitecture.Core.Features.Airports.Queries.GetAirportById
{
    public class GetAirportByIdQuery : IRequest<Airport>
    {
        public int Id { get; set; }
        public class GetAirportByIdQueryHandler : IRequestHandler<GetAirportByIdQuery, Airport>
        {
            private readonly IGenericRepositoryAsync<Airport> _airportRepository;

            public GetAirportByIdQueryHandler(IGenericRepositoryAsync<Airport> airportRepository)
            {
                _airportRepository = airportRepository;
            }

            public async Task<Airport> Handle(GetAirportByIdQuery request, CancellationToken cancellationToken)
            {
                var airport = await _airportRepository.GetByIdAsync(request.Id);
                if (airport == null)
                    throw new NotFoundException($"Airport with id {request.Id} not found.");

                return airport;
            }
        }
    }
}
