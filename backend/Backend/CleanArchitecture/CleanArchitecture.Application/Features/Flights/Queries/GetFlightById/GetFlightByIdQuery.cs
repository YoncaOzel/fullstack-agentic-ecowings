using System.Threading.Tasks;
using System.Threading;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;

namespace CleanArchitecture.Core.Features.Flights.Queries.GetFlightById
{
    public class GetFlightByIdQuery : IRequest<Flight>
    {
        public int Id { get; set; }
    }
    public class GetFlightByIdQueryHandler : IRequestHandler<GetFlightByIdQuery, Flight>
    {
        private readonly IGenericRepositoryAsync<Flight> _flightRepository;

        public GetFlightByIdQueryHandler(IGenericRepositoryAsync<Flight> flightRepository)
        {
            _flightRepository = flightRepository;
        }

        public async Task<Flight> Handle(GetFlightByIdQuery request, CancellationToken cancellationToken)
        {
            return await _flightRepository.GetByIdAsync(request.Id);
        }
    }
}
