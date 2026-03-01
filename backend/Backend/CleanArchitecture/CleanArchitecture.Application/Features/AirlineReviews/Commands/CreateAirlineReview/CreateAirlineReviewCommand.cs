using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System;
using System.Threading.Tasks;
using System.Threading;

namespace CleanArchitecture.Core.Features.AirlineReviews.Commands.CreateAirlineReview
{
    public class CreateAirlineReviewCommand : IRequest<int>
    {
        public string Comment { get; set; }
        public int Rating { get; set; }
        public DateTime CreatedAt { get; set; }
        public int AirlineId { get; set; }
        public int UserId { get; set; }
        public class CreateAirlineReviewCommandHandler : IRequestHandler<CreateAirlineReviewCommand, int>
        {
            private readonly IGenericRepositoryAsync<AirlineReview> _airlineReviewRepository;

            public CreateAirlineReviewCommandHandler(IGenericRepositoryAsync<AirlineReview> airlineReviewRepository)
            {
                _airlineReviewRepository = airlineReviewRepository;
            }

            public async Task<int> Handle(CreateAirlineReviewCommand request, CancellationToken cancellationToken)
            {
                var review = new AirlineReview
                {
                    Comment = request.Comment,
                    Rating = request.Rating,
                    CreatedAt = request.CreatedAt,
                    AirlineId = request.AirlineId,
                    UserId = request.UserId
                };

                await _airlineReviewRepository.AddAsync(review);
                return review.Id;
            }
        }
    }
}
