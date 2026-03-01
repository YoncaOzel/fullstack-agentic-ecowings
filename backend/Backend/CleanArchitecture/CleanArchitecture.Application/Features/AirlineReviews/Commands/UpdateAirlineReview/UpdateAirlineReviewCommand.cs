using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System;
using System.Threading.Tasks;
using System.Threading;

namespace CleanArchitecture.Core.Features.AirlineReviews.Commands.UpdateAirlineReview
{
    public class UpdateAirlineReviewCommand : IRequest<int>
    {
        public int Id { get; set; }
        public string Comment { get; set; }
        public int Rating { get; set; }
        public DateTime CreatedAt { get; set; }
        public int AirlineId { get; set; }
        public int UserId { get; set; }
        public class UpdateAirlineReviewCommandHandler : IRequestHandler<UpdateAirlineReviewCommand, int>
        {
            private readonly IGenericRepositoryAsync<AirlineReview> _airlineReviewRepository;

            public UpdateAirlineReviewCommandHandler(IGenericRepositoryAsync<AirlineReview> airlineReviewRepository)
            {
                _airlineReviewRepository = airlineReviewRepository;
            }

            public async Task<int> Handle(UpdateAirlineReviewCommand request, CancellationToken cancellationToken)
            {
                var review = await _airlineReviewRepository.GetByIdAsync(request.Id);
                if (review == null)
                    throw new NotFoundException($"AirlineReview with id {request.Id} not found.");

                review.Comment = request.Comment;
                review.Rating = request.Rating;
                review.CreatedAt = request.CreatedAt;
                review.AirlineId = request.AirlineId;
                review.UserId = request.UserId;

                await _airlineReviewRepository.UpdateAsync(review);
                return review.Id;
            }
        }
    }
}
