using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using System.Threading.Tasks;
using System.Threading;
using MediatR;

namespace CleanArchitecture.Core.Features.Airlines.Commands.CreateAirline
{
    public class CreateAirlineCommand : IRequest<int>
    {
        public string Name { get; set; }
        public string Country { get; set; }
    }
    public class CreateAirlineCommandHandler : IRequestHandler<CreateAirlineCommand, int>
    {
        private readonly IGenericRepositoryAsync<Airline> _airlineRepository;

        public CreateAirlineCommandHandler(IGenericRepositoryAsync<Airline> airlineRepository)
        {
            _airlineRepository = airlineRepository;
        }

        public async Task<int> Handle(CreateAirlineCommand request, CancellationToken cancellationToken)
        {
            var airline = new Airline
            {
                Name = request.Name,
                Country = request.Country
            };

            await _airlineRepository.AddAsync(airline);
            return airline.Id;
        }
    }
}
