using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;

namespace CleanArchitecture.Core.Features.Tickets.Queries.GetAllTickets
{
    public class GetAllTicketsQuery : IRequest<List<Ticket>>
    {
        public class GetAllTicketsQueryHandler : IRequestHandler<GetAllTicketsQuery, List<Ticket>>
        {
            private readonly IGenericRepositoryAsync<Ticket> _ticketRepository;

            public GetAllTicketsQueryHandler(IGenericRepositoryAsync<Ticket> ticketRepository)
            {
                _ticketRepository = ticketRepository;
            }

            public async Task<List<Ticket>> Handle(GetAllTicketsQuery request, CancellationToken cancellationToken)
            {
                var tickets = await _ticketRepository.GetAllAsync();
                return tickets.ToList();
            }
        }
    }
}
