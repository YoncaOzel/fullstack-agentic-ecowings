using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;

using CleanArchitecture.Core.Interfaces.Repositories;

namespace CleanArchitecture.Core.Features.Airlines.Queries.GetAllAirlines
{
    public class GetAllAirlinesQuery : IRequest<List<Airline>>
    {
        public class GetAllAirlinesQueryHandler : IRequestHandler<GetAllAirlinesQuery, List<Airline>>
        {
            private readonly IGenericRepositoryAsync<Airline> _airlineRepository;

            public GetAllAirlinesQueryHandler(IGenericRepositoryAsync<Airline> airlineRepository)
            {
                _airlineRepository = airlineRepository;
            }

            public async Task<List<Airline>> Handle(GetAllAirlinesQuery request, CancellationToken cancellationToken)
            {
                var airlines = await _airlineRepository.GetAllAsync();
                return airlines.ToList();
            }
        }
    }
}
