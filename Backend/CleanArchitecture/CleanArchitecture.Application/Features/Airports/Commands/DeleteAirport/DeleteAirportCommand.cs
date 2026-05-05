using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using System.Threading.Tasks;
using System.Threading;
using MediatR;

namespace CleanArchitecture.Core.Features.Airports.Commands.DeleteAirport
{
    public class DeleteAirportCommand : IRequest<int>
    {
        public int Id { get; set; }
        public class DeleteAirportCommandHandler : IRequestHandler<DeleteAirportCommand, int>
        {
            private readonly IGenericRepositoryAsync<Airport> _airportRepository;

            public DeleteAirportCommandHandler(IGenericRepositoryAsync<Airport> airportRepository)
            {
                _airportRepository = airportRepository;
            }

            public async Task<int> Handle(DeleteAirportCommand request, CancellationToken cancellationToken)
            {
                var airport = await _airportRepository.GetByIdAsync(request.Id);
                if (airport == null)
                    throw new NotFoundException($"Airport with id {request.Id} not found.");

                await _airportRepository.DeleteAsync(airport);
                return airport.Id;
            }
        }
    }
}
