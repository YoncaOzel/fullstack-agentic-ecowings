using System.Threading.Tasks;
using System.Threading;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using MediatR;

namespace CleanArchitecture.Core.Features.AirlineReviews.Queries.GetAirlineReviewById
{
    public class GetAirlineReviewByIdQuery : IRequest<AirlineReview>
    {
        public int Id { get; set; }
        public class GetAirlineReviewByIdQueryHandler : IRequestHandler<GetAirlineReviewByIdQuery, AirlineReview>
        {
            private readonly IGenericRepositoryAsync<AirlineReview> airlineReviewRepository;

            public GetAirlineReviewByIdQueryHandler(IGenericRepositoryAsync<AirlineReview> airlineReviewRepository)
            {
                this.airlineReviewRepository = airlineReviewRepository;
            }

            public async Task<AirlineReview> Handle(GetAirlineReviewByIdQuery request, CancellationToken cancellationToken)
            {
                var review = await airlineReviewRepository.GetByIdAsync(request.Id);
                if (review == null)
                    throw new NotFoundException($"AirlineReview with id {request.Id} not found.");

                return review;
            }
        }
    }
}
