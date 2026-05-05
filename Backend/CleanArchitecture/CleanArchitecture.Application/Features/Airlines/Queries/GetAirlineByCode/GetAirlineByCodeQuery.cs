using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Exceptions;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace CleanArchitecture.Core.Features.Airlines.Queries.GetAirlineByCode
{
    public class GetAirlineByCodeQuery : IRequest<Airline>
    {
        public string AirlineCode { get; set; }
    }

    public class GetAirlineByCodeQueryHandler : IRequestHandler<GetAirlineByCodeQuery, Airline>
    {
        private readonly IGenericRepositoryAsync<Airline> _airlineRepository;

        public GetAirlineByCodeQueryHandler(IGenericRepositoryAsync<Airline> airlineRepository)
        {
            _airlineRepository = airlineRepository;
        }

        public async Task<Airline> Handle(GetAirlineByCodeQuery request, CancellationToken cancellationToken)
        {
            // Repository üzerinden AirlineCode'a göre filtreleme yapıyoruz
            var airlineList = await _airlineRepository.GetAllAsync();
            var airline = airlineList.FirstOrDefault(x => x.AirlineCode == request.AirlineCode.ToUpper());

            if (airline == null)
                throw new NotFoundException($"Airline with code {request.AirlineCode} not found.");

            return airline;
        }
    }
}