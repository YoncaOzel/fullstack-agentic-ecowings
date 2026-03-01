using CleanArchitecture.Core.Features.AirlineReviews.Commands.CreateAirlineReview;
using CleanArchitecture.Core.Features.AirlineReviews.Commands.DeleteAirlineReview;
using CleanArchitecture.Core.Features.AirlineReviews.Commands.UpdateAirlineReview;
using CleanArchitecture.Core.Features.AirlineReviews.Queries.GetAirlineReviewById;
using CleanArchitecture.Core.Features.AirlineReviews.Queries.GetAllAirlineReviews;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims; // Token içinden ID okumak için
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers
{
    [Authorize] 
    [Route("api/[controller]")]
    [ApiController]
    public class AirlineReviewController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AirlineReviewController(IMediator mediator)
        {
            _mediator = mediator;
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
        // [Authorize] -> Zaten sınıfın tepesinde olduğu için giriş yapan herkes buraya girebilir
        public async Task<IActionResult> Create(CreateAirlineReviewCommand command)
        {
            // İsteğe bağlı güvenlik artırımı: 
            // Kullanıcının token'ındaki ID ile command içindeki ID uyuşuyor mu diye kontrol edebilirsin.
            var userIdString = User.FindFirstValue("uid");
            if (int.TryParse(userIdString, out int userId))
            {
                // command.PassengerId = userId; // Eğer command içinde PassengerId veya UserId varsa doğrudan Token'dan gelen ID'yi ezerek güvenliği sağlayabilirsin.
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