using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using System.Threading.Tasks;
using System.Threading;
using MediatR;

namespace CleanArchitecture.Core.Features.Airports.Commands.CreateAirport
{
    public class CreateAirportCommand : IRequest<int>
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string Country { get; set; }
        public string City { get; set; }
        public string TimeZone { get; set; }
        public class CreateAirportCommandHandler : IRequestHandler<CreateAirportCommand, int>
        {
            private readonly IGenericRepositoryAsync<Airport> _airportRepository;

            public CreateAirportCommandHandler(IGenericRepositoryAsync<Airport> airportRepository)
            {
                _airportRepository = airportRepository;
            }

            public async Task<int> Handle(CreateAirportCommand request, CancellationToken cancellationToken)
            {
                var airport = new Airport
                {
                    Code = request.Code,
                    Name = request.Name,
                    Country = request.Country,
                    City = request.City,
                    TimeZone = request.TimeZone
                };

                await _airportRepository.AddAsync(airport);
                return airport.Id;
            }
        }
    }
}
