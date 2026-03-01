using System.Threading.Tasks;
using System.Threading;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using MediatR;

namespace CleanArchitecture.Core.Features.Tickets.Queries.GetTicketById
{
    public class GetTicketByIdQuery : IRequest<Ticket>
    {
        public int Id { get; set; }
        public class GetTicketByIdQueryHandler : IRequestHandler<GetTicketByIdQuery, Ticket>
        {
            private readonly IGenericRepositoryAsync<Ticket> _ticketRepository;

            public GetTicketByIdQueryHandler(IGenericRepositoryAsync<Ticket> ticketRepository)
            {
                _ticketRepository = ticketRepository;
            }

            public async Task<Ticket> Handle(GetTicketByIdQuery request, CancellationToken cancellationToken)
            {
                var ticket = await _ticketRepository.GetByIdAsync(request.Id);
                if (ticket == null)
                    throw new NotFoundException($"Ticket with id {request.Id} not found.");

                return ticket;
            }
        }
    }
}
