using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using System.Threading.Tasks;
using System.Threading;
using MediatR;

namespace CleanArchitecture.Core.Features.Flights.Commands.DeleteFlight
{
    public class DeleteFlightCommand : IRequest<Unit>
    {
        public int Id { get; set; }

        public class DeleteFlightCommandHandler : IRequestHandler<DeleteFlightCommand,Unit>
        {
            private readonly IGenericRepositoryAsync<Flight> _flightRepository;

            public DeleteFlightCommandHandler(IGenericRepositoryAsync<Flight> flightRepository)
            {
                _flightRepository = flightRepository;
            }

            public async Task<Unit> Handle(DeleteFlightCommand request, CancellationToken cancellationToken)
            {
                var flight = await _flightRepository.GetByIdAsync(request.Id);

                if (flight == null)
                    throw new System.Exception("Flight not found.");

                await _flightRepository.DeleteAsync(flight);
                return Unit.Value;
            }
        }
    }
}
