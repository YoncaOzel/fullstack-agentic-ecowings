using CleanArchitecture.Core.DTOs.Ticket;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;

namespace CleanArchitecture.Core.Features.Tickets.Queries.GetAllTickets
{
    public class GetAllTicketsQuery : IRequest<List<AdminTicketDto>>
    {
        public class GetAllTicketsQueryHandler : IRequestHandler<GetAllTicketsQuery, List<AdminTicketDto>>
        {
            private readonly IGenericRepositoryAsync<Ticket> _ticketRepository;

            public GetAllTicketsQueryHandler(IGenericRepositoryAsync<Ticket> ticketRepository)
            {
                _ticketRepository = ticketRepository;
            }

            public async Task<List<AdminTicketDto>> Handle(GetAllTicketsQuery request, CancellationToken cancellationToken)
            {
                var tickets = await _ticketRepository.GetWithIncludeAsync(
                    t => true,
                    t => t.Flight,
                    t => t.Flight.Departure,
                    t => t.Flight.Destination,
                    t => t.Passenger
                );

                return tickets.Select(t => new AdminTicketDto
                {
                    TicketId = t.Id,
                    PnrCode = t.PnrCode,
                    IsPaid = t.IsPaid,
                    BookingDate = t.BookingDate,
                    Price = t.Price,
                    IsDiscounted = t.IsDiscounted,
                    DiscountedPrice = t.DiscountedPrice,
                    DiscountRate = t.DiscountRate,
                    PassengerId = t.PassengerId,
                    PassengerName = t.Passenger?.Name ?? "",
                    PassengerEmail = t.Passenger?.Email ?? "",
                    FlightId = t.FlightId,
                    FlightNumber = t.Flight?.FlightNumber ?? "",
                    From = t.Flight?.Departure?.City ?? "",
                    To = t.Flight?.Destination?.City ?? "",
                    DepartureTime = t.Flight?.DepartureTime ?? default,
                    EstimatedArrivalTime = t.Flight?.EstimatedArrivalTime ?? default,
                }).ToList();
            }
        }
    }
}
