using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using System.Threading.Tasks;
using System.Threading;
using MediatR;

namespace CleanArchitecture.Core.Features.Airports.Commands.UpdateAirport
{
    public class UpdateAirportCommand : IRequest<int>
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Country { get; set; }
        public string City { get; set; }
        public string TimeZone { get; set; }
        public class UpdateAirportCommandHandler : IRequestHandler<UpdateAirportCommand, int>
        {
            private readonly IGenericRepositoryAsync<Airport> _airportRepository;

            public UpdateAirportCommandHandler(IGenericRepositoryAsync<Airport> airportRepository)
            {
                _airportRepository = airportRepository;
            }

            public async Task<int> Handle(UpdateAirportCommand request, CancellationToken cancellationToken)
            {
                var airport = await _airportRepository.GetByIdAsync(request.Id);
                if (airport == null)
                    throw new NotFoundException($"Airport with id {request.Id} not found.");

                airport.Code = request.Code;
                airport.Name = request.Name;
                airport.Country = request.Country;
                airport.City = request.City;
                airport.TimeZone = request.TimeZone;

                await _airportRepository.UpdateAsync(airport);
                return airport.Id;
            }
        }
    }
}
