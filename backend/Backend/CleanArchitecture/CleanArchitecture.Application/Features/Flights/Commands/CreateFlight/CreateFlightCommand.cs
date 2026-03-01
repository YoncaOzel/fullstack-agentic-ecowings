using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System;
using System.Threading.Tasks;
using System.Threading;

namespace CleanArchitecture.Core.Features.Flights.Commands.CreateFlight
{
    public class CreateFlightCommand : IRequest<int> // int = oluşan Flight'ın Id'si
    {
        public string FlightNumber { get; set; }
        public int DepartureAirportId { get; set; }
        public int DestinationAirportId { get; set; }
        public DateTime DepartureTime { get; set; }
        public DateTime EstimatedArrivalTime { get; set; }
        public decimal Price { get; set; }
        public int AirlineId { get; set; }

        public class CreateFlightCommandHandler : IRequestHandler<CreateFlightCommand, int>
        {
            private readonly IGenericRepositoryAsync<Flight> _flightRepository;

            public CreateFlightCommandHandler(IGenericRepositoryAsync<Flight> flightRepository)
            {
                _flightRepository = flightRepository;
            }

            public async Task<int> Handle(CreateFlightCommand request, CancellationToken cancellationToken)
            {
                var flight = new Flight
                {
                    FlightNumber = request.FlightNumber,
                    DepartureAirportId = request.DepartureAirportId,
                    DestinationAirportId = request.DestinationAirportId,
                    DepartureTime = request.DepartureTime,
                    EstimatedArrivalTime = request.EstimatedArrivalTime,
                    Price = request.Price,
                    AirlineId = request.AirlineId
                };

                await _flightRepository.AddAsync(flight);
                return flight.Id;
            }
        }
    }
}
