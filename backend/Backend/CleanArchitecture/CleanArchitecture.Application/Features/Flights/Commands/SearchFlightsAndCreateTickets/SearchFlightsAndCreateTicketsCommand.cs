using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;

namespace CleanArchitecture.Core.Features.Flights.Commands.SearchFlightsAndCreateTickets
{
    public class SearchFlightsAndCreateTicketsCommand : IRequest<List<(Flight Flight, int TicketId)>>
    {
        public string Origin { get; set; }
        public string Destination { get; set; }
        public string Date { get; set; }
        public int UserId { get; set; }
        public int Adults { get; set; }
        public string TravelClass { get; set; }
       
        //public decimal TicketPrice { get; set; } // Optional, if you want to filter by price

        public class SearchFlightsAndCreateTicketsHandler : IRequestHandler<SearchFlightsAndCreateTicketsCommand, List<(Flight Flight, int TicketId)>>
        {
            private readonly IAmadeusService _amadeusService;
            private readonly IGenericRepositoryAsync<Flight> _flightRepository;
            private readonly IGenericRepositoryAsync<Ticket> _ticketRepository;
            private readonly IGenericRepositoryAsync<Airport> _airportRepository;
            private readonly IGenericRepositoryAsync<Airline> _airlineRepository;

            public SearchFlightsAndCreateTicketsHandler(
                IAmadeusService amadeusService,
                IGenericRepositoryAsync<Flight> flightRepository,
                IGenericRepositoryAsync<Ticket> ticketRepository,
                IGenericRepositoryAsync<Airport> airportRepository,
                IGenericRepositoryAsync<Airline> airlineRepository)
            {
                _amadeusService = amadeusService;
                _flightRepository = flightRepository;
                _ticketRepository = ticketRepository;
                _airportRepository = airportRepository;
                _airlineRepository = airlineRepository;
            }

            public async Task<List<(Flight Flight, int TicketId)>> Handle(SearchFlightsAndCreateTicketsCommand request, CancellationToken cancellationToken)
            {
                var flightsDto = await _amadeusService.SearchFlightsAsync(
                    request.Origin,
                    request.Destination,
                    request.Date,
                    request.Adults,
                    request.TravelClass
                );

                var departureAirports = await _airportRepository.GetAllAsync();
                var destinationAirports = await _airportRepository.GetAllAsync();
                var airlineList = await _airlineRepository.GetAllAsync();

                var result = new List<(Flight, int)>();

                foreach (var f in flightsDto)
                {
                    var departureId = departureAirports.FirstOrDefault(a => a.Code == f.Departure)?.Id ?? 0;
                    var destinationId = destinationAirports.FirstOrDefault(a => a.Code == f.Arrival)?.Id ?? 0;
                    var airlineId = airlineList.FirstOrDefault(a => a.Name == f.Carrier)?.Id ?? 1;

                    if (departureId == 0 || destinationId == 0)
                        continue;

                    var flight = new Flight
                    {
                        FlightNumber = f.FlightNumber,
                        DepartureTime = DateTime.Parse(f.DepartureTime),
                        EstimatedArrivalTime = DateTime.Parse(f.ArrivalTime),
                        Price = decimal.Parse(f.Price),
                        AirlineId = airlineId,
                        DepartureAirportId = departureId,
                        DestinationAirportId = destinationId
                    };

                    await _flightRepository.AddAsync(flight);

                    var ticket = new Ticket
                    {
                        PassengerId = request.UserId,
                        Flight = flight,
                        BookingDate = DateTime.UtcNow,
                        IsPaid = false,
                        Price = flight.Price
                    };

                    await _ticketRepository.AddAsync(ticket);
                    result.Add((flight, ticket.Id));
                }

                return result;
            }
        }
    }
}
