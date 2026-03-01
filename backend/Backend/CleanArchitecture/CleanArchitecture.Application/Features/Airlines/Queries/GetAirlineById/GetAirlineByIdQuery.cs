using System.Threading.Tasks;
using System.Threading;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using MediatR;

namespace CleanArchitecture.Core.Features.Airlines.Queries.GetAirlineById
{
    public class GetAirlineByIdQuery : IRequest<Airline>
    {
        public int Id { get; set; }
        public class GetAirlineByIdQueryHandler : IRequestHandler<GetAirlineByIdQuery, Airline>
        {
            private readonly IGenericRepositoryAsync<Airline> _airlineRepository;

            public GetAirlineByIdQueryHandler(IGenericRepositoryAsync<Airline> airlineRepository)
            {
                _airlineRepository = airlineRepository;
            }

            public async Task<Airline> Handle(GetAirlineByIdQuery request, CancellationToken cancellationToken)
            {
                var airline = await _airlineRepository.GetByIdAsync(request.Id);
                if (airline == null)
                    throw new NotFoundException($"Airline with id {request.Id} not found.");

                return airline;
            }
        }
    }
}
