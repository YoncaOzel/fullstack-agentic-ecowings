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

                airline.Name = request.Name;
                airline.Country = request.Country;

                await _airlineRepository.UpdateAsync(airline);
                return airline.Id;
            }
        }
    }
}
