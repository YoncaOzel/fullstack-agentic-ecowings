using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System;
using System.Threading.Tasks;
using System.Threading;

namespace CleanArchitecture.Core.Features.Tickets.Commands.UpdateTicket
{
    public class UpdateTicketCommand : IRequest<int>
    {
        public int Id { get; set; }
        public int PassengerId { get; set; }
        public int FlightId { get; set; }
        public DateTime BookingDate { get; set; }
    }
    public class UpdateTicketCommandHandler : IRequestHandler<UpdateTicketCommand, int>
    {
        private readonly IGenericRepositoryAsync<Ticket> _ticketRepository;

        public UpdateTicketCommandHandler(IGenericRepositoryAsync<Ticket> ticketRepository)
        {
            _ticketRepository = ticketRepository;
        }

        public async Task<int> Handle(UpdateTicketCommand request, CancellationToken cancellationToken)
        {
            var ticket = await _ticketRepository.GetByIdAsync(request.Id);
            if (ticket == null)
                throw new NotFoundException($"Ticket with id {request.Id} not found.");

            ticket.PassengerId = request.PassengerId;
            ticket.FlightId = request.FlightId;
            ticket.BookingDate = request.BookingDate;

            await _ticketRepository.UpdateAsync(ticket);
            return ticket.Id;
        }
    }
}
