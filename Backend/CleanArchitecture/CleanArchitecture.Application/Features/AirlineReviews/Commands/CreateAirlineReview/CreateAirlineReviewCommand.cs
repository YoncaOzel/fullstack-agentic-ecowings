using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.AirlineReviews.Commands.CreateAirlineReview
{
    // 1. KOMUT SINIFI
    public class CreateAirlineReviewCommand : IRequest<int>
    {
        public string Comment { get; set; }
        public int Rating { get; set; }
        public string AirlineCode { get; set; } // Değişti
        public int UserId { get; set; }
    }

    // 2. HANDLER SINIFI (Aynı namespace içinde, komutun dışında)
    public class CreateAirlineReviewCommandHandler : IRequestHandler<CreateAirlineReviewCommand, int>
    {
        private readonly IGenericRepositoryAsync<AirlineReview> _airlineReviewRepository;
        private readonly IMLService _mlService;

        public CreateAirlineReviewCommandHandler(
            IGenericRepositoryAsync<AirlineReview> airlineReviewRepository,
            IMLService mlService)
        {
            _airlineReviewRepository = airlineReviewRepository;
            _mlService = mlService;
        }

        public async Task<int> Handle(CreateAirlineReviewCommand request, CancellationToken cancellationToken)
        {
            var finalRating = request.Rating == 0
                ? await _mlService.PredictRatingAsync(request.Comment)
                : request.Rating;

            var review = new AirlineReview
            {
                Comment = request.Comment,
                Rating = finalRating,
                CreatedAt = DateTime.UtcNow,
                AirlineCode = request.AirlineCode,
                UserId = request.UserId
            };

            await _airlineReviewRepository.AddAsync(review);
            return review.Id;
        }
    }
}