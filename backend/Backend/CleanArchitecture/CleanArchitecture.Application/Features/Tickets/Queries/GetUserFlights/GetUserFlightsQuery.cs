using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using CleanArchitecture.Core.DTOs.GetUserFlights;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;

namespace CleanArchitecture.Core.Features.Tickets.Queries.GetUserFlights
{
    public class GetUserFlightsQuery : IRequest<List<UserFlightDto>>
    {
        public int UserId { get; set; }

        public GetUserFlightsQuery(int userId)
        {
            UserId = userId;
        }

        public class GetUserFlightsQueryHandler : IRequestHandler<GetUserFlightsQuery, List<UserFlightDto>>
        {
            private readonly IGenericRepositoryAsync<Ticket> _ticketRepository;

            public GetUserFlightsQueryHandler(IGenericRepositoryAsync<Ticket> ticketRepository)
            {
                _ticketRepository = ticketRepository;
            }

            public async Task<List<UserFlightDto>> Handle(GetUserFlightsQuery request, CancellationToken cancellationToken)
            {
                var tickets = await _ticketRepository.GetWithIncludeAsync(
                    t => t.Passenger.Id == request.UserId && t.IsPaid, //  sadece ödenmiş biletler
                    t => t.Flight,
                    t => t.Flight.Departure,
                    t => t.Flight.Destination
                );

                return tickets.Select(t => new UserFlightDto
                {
                    TicketId = t.Id,
                    FlightNumber = t.Flight.FlightNumber,
                    From = t.Flight.Departure?.City ?? "",
                    To = t.Flight.Destination?.City ?? "",
                    DepartureTime = t.Flight.DepartureTime,
                    EstimatedArrivalTime = t.Flight.EstimatedArrivalTime,
                    Price = t.Flight.Price,
                    IsPaid = t.IsPaid,
                    PnrCode = t.PnrCode
                }).ToList();
            }
        }

    }
}
