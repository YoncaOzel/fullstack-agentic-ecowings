using CleanArchitecture.Core.Features.AirlineReviews.Commands.CreateAirlineReview;
using CleanArchitecture.Core.Features.AirlineReviews.Commands.DeleteAirlineReview;
using CleanArchitecture.Core.Features.AirlineReviews.Commands.UpdateAirlineReview;
using CleanArchitecture.Core.Features.AirlineReviews.Queries.GetAirlineReviewById;
using CleanArchitecture.Core.Features.AirlineReviews.Queries.GetAllAirlineReviews;
using CleanArchitecture.Core.Interfaces.Repositories;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AirlineReviewController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IUserRepositoryAsync _userRepository;

        public AirlineReviewController(IMediator mediator, IUserRepositoryAsync userRepository)
        {
            _mediator = mediator;
            _userRepository = userRepository;
        }


        // GET: api/airlinereview
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var reviews = await _mediator.Send(new GetAllAirlineReviewsQuery());
            return Ok(reviews);
        }

        // GET: api/airlinereview/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var review = await _mediator.Send(new GetAirlineReviewByIdQuery { Id = id });
            return Ok(review);
        }


        // POST: api/airlinereview
        [HttpPost]
        public async Task<IActionResult> Create(CreateAirlineReviewCommand command)
        {
            // Önce customUserId claim'ini dene (yeni token), yoksa email ile lookup yap (eski token)
            var userIdString = User.FindFirstValue("customUserId");
            if (int.TryParse(userIdString, out int userId) && userId > 0)
            {
                command.UserId = userId;
            }
            else
            {
                var email = User.FindFirstValue(JwtRegisteredClaimNames.Email)
                            ?? User.FindFirstValue(ClaimTypes.Email);
                if (!string.IsNullOrEmpty(email))
                {
                    var customUser = await _userRepository.GetByEmailAsync(email);
                    if (customUser != null)
                        command.UserId = customUser.Id;
                }
            }

            var reviewId = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = reviewId }, reviewId);
        }


        // PUT: api/airlinereview/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")] 
        public async Task<IActionResult> Update(int id, UpdateAirlineReviewCommand command)
        {
            if (id != command.Id)
                return BadRequest("Route ID and body ID must match.");

            var updatedId = await _mediator.Send(command);
            return Ok(updatedId);
        }

        // DELETE: api/airlinereview/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")] 
        public async Task<IActionResult> Delete(int id)
        {
            var deletedId = await _mediator.Send(new DeleteAirlineReviewCommand { Id = id });
            return Ok(deletedId);
        }
    }
}