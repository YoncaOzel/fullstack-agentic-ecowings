using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System;
using System.Threading.Tasks;
using System.Threading;

namespace CleanArchitecture.Core.Features.Tickets.Commands.CreateTicket
{
    public class CreateTicketCommand : IRequest<int>
    {
        public int PassengerId { get; set; }
        public int FlightId { get; set; }
        public DateTime BookingDate { get; set; }
    }
    public class CreateTicketCommandHandler : IRequestHandler<CreateTicketCommand, int>
    {
        private readonly IGenericRepositoryAsync<Ticket> _ticketRepository;

        public CreateTicketCommandHandler(IGenericRepositoryAsync<Ticket> ticketRepository)
        {
            _ticketRepository = ticketRepository;
        }

        public async Task<int> Handle(CreateTicketCommand request, CancellationToken cancellationToken)
        {
            var ticket = new Ticket
            {
                PassengerId = request.PassengerId,
                FlightId = request.FlightId,
                BookingDate = request.BookingDate
            };

            await _ticketRepository.AddAsync(ticket);
            return ticket.Id;
        }
    }
}
