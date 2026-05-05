using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using System.Threading.Tasks;
using System.Threading;
using MediatR;

namespace CleanArchitecture.Core.Features.Airlines.Commands.DeleteAirline
{
    public class DeleteAirlineCommand : IRequest<int>
    {
        public int Id { get; set; }
        public class DeleteAirlineCommandHandler : IRequestHandler<DeleteAirlineCommand, int>
        {
            private readonly IGenericRepositoryAsync<Airline> _airlineRepository;

            public DeleteAirlineCommandHandler(IGenericRepositoryAsync<Airline> airlineRepository)
            {
                _airlineRepository = airlineRepository;
            }

            public async Task<int> Handle(DeleteAirlineCommand request, CancellationToken cancellationToken)
            {
                var airline = await _airlineRepository.GetByIdAsync(request.Id);
                if (airline == null)
                    throw new NotFoundException($"Airline with id {request.Id} not found.");

                await _airlineRepository.DeleteAsync(airline);
                return airline.Id;
            }
        }
    }
}
