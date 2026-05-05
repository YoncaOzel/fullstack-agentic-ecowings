using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Airports.Queries.GetAirportByCode
{
    public class GetAirportByCodeQuery : IRequest<Airport>
    {
        public string Code { get; set; }
    }

    public class GetAirportByCodeQueryHandler : IRequestHandler<GetAirportByCodeQuery, Airport>
    {
        private readonly IGenericRepositoryAsync<Airport> _airportRepository;

        public GetAirportByCodeQueryHandler(IGenericRepositoryAsync<Airport> airportRepository)
        {
            _airportRepository = airportRepository;
        }

        public async Task<Airport> Handle(GetAirportByCodeQuery request, CancellationToken cancellationToken)
        {
            // Tüm listeyi çekip filtrelemek yerine, performans için repository üzerinden özel bir metot 
            // veya GetAllAsync sonucunda LINQ kullanabilirsin.
            var airports = await _airportRepository.GetAllAsync();
            var airport = airports.FirstOrDefault(x => x.Code.ToUpper() == request.Code.ToUpper());

            if (airport == null)
                throw new NotFoundException($"Airport with code {request.Code} not found.");

            return airport;
        }
    }
}