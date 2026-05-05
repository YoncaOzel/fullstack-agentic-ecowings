using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using System.Threading.Tasks;
using System.Threading;
using MediatR;

namespace CleanArchitecture.Core.Features.AirlineReviews.Commands.DeleteAirlineReview
{
    public class DeleteAirlineReviewCommand : IRequest<int>
    {
        public int Id { get; set; }
        public class DeleteAirlineReviewCommandHandler : IRequestHandler<DeleteAirlineReviewCommand, int>
        {
            private readonly IGenericRepositoryAsync<AirlineReview> _airlineReviewRepository;

            public DeleteAirlineReviewCommandHandler(IGenericRepositoryAsync<AirlineReview> airlineReviewRepository)
            {
                _airlineReviewRepository = airlineReviewRepository;
            }

            public async Task<int> Handle(DeleteAirlineReviewCommand request, CancellationToken cancellationToken)
            {
                var review = await _airlineReviewRepository.GetByIdAsync(request.Id);
                if (review == null)
                    throw new NotFoundException($"AirlineReview with id {request.Id} not found.");

                await _airlineReviewRepository.DeleteAsync(review);
                return review.Id;

            }
        }
    }
}
