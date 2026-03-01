using MediatR;
using System;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Flights.Commands.BookFlight
{
    public class BookFlightCommand : IRequest<int> // ticketId döner
    {
        public string FlightNumber { get; set; }
        public int DepartureAirportId { get; set; }
        public int DestinationAirportId { get; set; }
        public DateTime DepartureTime { get; set; }
        public DateTime EstimatedArrivalTime { get; set; }
        public decimal Price { get; set; }
        public int AirlineId { get; set; }
        public int UserId { get; set; } // bilet sahibi

        public class BookFlightCommandHandler : IRequestHandler<BookFlightCommand, int>
        {
            private readonly IGenericRepositoryAsync<Flight> _flightRepository;
            private readonly IGenericRepositoryAsync<Ticket> _ticketRepository;

            public BookFlightCommandHandler(
                IGenericRepositoryAsync<Flight> flightRepository,
                IGenericRepositoryAsync<Ticket> ticketRepository)
            {
                _flightRepository = flightRepository;
                _ticketRepository = ticketRepository;
            }

            public async Task<int> Handle(BookFlightCommand request, CancellationToken cancellationToken)
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

                var ticket = new Ticket
                {
                    Passenger = new User { Id = request.UserId }, // sadece ID'yi ata
                    Flight = flight,
                    BookingDate = DateTime.UtcNow,
                    IsPaid = false
                };

                await _ticketRepository.AddAsync(ticket);

                return ticket.Id;
            }
        }
    }
}
