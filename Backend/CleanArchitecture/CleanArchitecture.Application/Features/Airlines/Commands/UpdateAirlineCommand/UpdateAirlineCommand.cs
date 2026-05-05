using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using System.Threading.Tasks;
using System.Threading;
using MediatR;

namespace CleanArchitecture.Core.Features.Airlines.Commands.UpdateAirline
{
    public class UpdateAirlineCommand : IRequest<int>
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Country { get; set; }
        // 1. Yeni özelliği komuta ekleyin
        public string AirlineCode { get; set; }

        public class UpdateAirlineCommandHandler : IRequestHandler<UpdateAirlineCommand, int>
        {
            private readonly IGenericRepositoryAsync<Airline> _airlineRepository;

            public UpdateAirlineCommandHandler(IGenericRepositoryAsync<Airline> airlineRepository)
            {
                _airlineRepository = airlineRepository;
            }

            public async Task<int> Handle(UpdateAirlineCommand request, CancellationToken cancellationToken)
            {
                var airline = await _airlineRepository.GetByIdAsync(request.Id);

                if (airline == null)
                    throw new NotFoundException($"Airline with id {request.Id} not found.");

                // 2. Mevcut entity değerlerini komuttan gelenlerle güncelleyin
                airline.Name = request.Name;
                airline.Country = request.Country;
                airline.AirlineCode = request.AirlineCode; // Kodu da güncelliyoruz

                await _airlineRepository.UpdateAsync(airline);
                return airline.Id;
            }
        }
    }
}