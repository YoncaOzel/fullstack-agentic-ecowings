using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;

namespace CleanArchitecture.Core.Features.AirlineReviews.Queries.GetAllAirlineReviews
{
    public class GetAllAirlineReviewsQuery : IRequest<List<AirlineReview>>
    {
        public class GetAllAirlineReviewsQueryHandler : IRequestHandler<GetAllAirlineReviewsQuery, List<AirlineReview>>
        {
            private readonly IGenericRepositoryAsync<AirlineReview> _airlineReviewRepository;

            public GetAllAirlineReviewsQueryHandler(IGenericRepositoryAsync<AirlineReview> airlineReviewRepository)
            {
                _airlineReviewRepository = airlineReviewRepository;
            }

            public async Task<List<AirlineReview>> Handle(GetAllAirlineReviewsQuery request, CancellationToken cancellationToken)
            {
                var reviews = await _airlineReviewRepository.GetAllAsync();
                return reviews.ToList();
            }
        }
    }
}
