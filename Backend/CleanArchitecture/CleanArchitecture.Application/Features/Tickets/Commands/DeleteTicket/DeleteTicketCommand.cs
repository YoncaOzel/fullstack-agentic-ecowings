using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using System.Threading.Tasks;
using System.Threading;
using MediatR;

namespace CleanArchitecture.Core.Features.Tickets.Commands.DeleteTicket
{
    public class DeleteTicketCommand : IRequest<int>
    {
        public int Id { get; set; }
        public class DeleteTicketCommandHandler : IRequestHandler<DeleteTicketCommand, int>
        {
            private readonly IGenericRepositoryAsync<Ticket> _ticketRepository;

            public DeleteTicketCommandHandler(IGenericRepositoryAsync<Ticket> ticketRepository)
            {
                _ticketRepository = ticketRepository;
            }

            public async Task<int> Handle(DeleteTicketCommand request, CancellationToken cancellationToken)
            {
                var ticket = await _ticketRepository.GetByIdAsync(request.Id);
                if (ticket == null)
                    throw new NotFoundException($"Ticket with id {request.Id} not found.");

                await _ticketRepository.DeleteAsync(ticket);
                return ticket.Id;
            }
        }
    }
}
