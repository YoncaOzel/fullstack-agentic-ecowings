using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System;
using System.Threading.Tasks;
using System.Threading;

namespace CleanArchitecture.Core.Features.Flights.Commands.UpdateFlight
{
    public class UpdateFlightCommand : IRequest<int>
    {
        public int Id { get; set; }
        public string FlightNumber { get; set; }
        public int DepartureAirportId { get; set; }
        public int DestinationAirportId { get; set; }
        public DateTime DepartureTime { get; set; }
        public DateTime EstimatedArrivalTime { get; set; }
        public decimal Price { get; set; }
        public int AirlineId { get; set; }

        public class UpdateFlightCommandHandler : IRequestHandler<UpdateFlightCommand, int>
        {
            private readonly IGenericRepositoryAsync<Flight> _flightRepository;

            public UpdateFlightCommandHandler(IGenericRepositoryAsync<Flight> flightRepository)
            {
                _flightRepository = flightRepository;
            }

            public async Task<int> Handle(UpdateFlightCommand request, CancellationToken cancellationToken)
            {
                var flight = await _flightRepository.GetByIdAsync(request.Id);
                if (flight == null)
                    throw new System.Exception("Flight not found.");

                flight.FlightNumber = request.FlightNumber;
                flight.DepartureAirportId = request.DepartureAirportId;
                flight.DestinationAirportId = request.DestinationAirportId;
                flight.DepartureTime = request.DepartureTime;
                flight.EstimatedArrivalTime = request.EstimatedArrivalTime;
                flight.Price = request.Price;
                flight.AirlineId = request.AirlineId;

                await _flightRepository.UpdateAsync(flight);
                return flight.Id;
            }
        }
    }
}
