using CleanArchitecture.Core.Features.Airlines.Commands.CreateAirline;
using CleanArchitecture.Core.Features.Airlines.Commands.DeleteAirline;
using CleanArchitecture.Core.Features.Airlines.Commands.UpdateAirline;
using CleanArchitecture.Core.Features.Airlines.Queries.GetAllAirlines;
using CleanArchitecture.Core.Features.Airlines.Queries.GetAirlineById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers
{
    [Route("api/[controller]")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    [ApiController]
    public class AirlineController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AirlineController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // POST: api/airline
        [HttpPost]
        public async Task<IActionResult> Create(CreateAirlineCommand command)
        {
            var airlineId = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = airlineId }, airlineId);
        }

        // GET: api/airline
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var airlines = await _mediator.Send(new GetAllAirlinesQuery());
            return Ok(airlines);
        }

        // GET: api/airline/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var airline = await _mediator.Send(new GetAirlineByIdQuery { Id = id });
            return Ok(airline);
        }

        // PUT: api/airline/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateAirlineCommand command)
        {
            if (id != command.Id)
                return BadRequest("Route ID and body ID do not match.");

            var updatedId = await _mediator.Send(command);
            return Ok(updatedId);
        }

        // DELETE: api/airline/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deletedId = await _mediator.Send(new DeleteAirlineCommand { Id = id });
            return Ok(deletedId);
        }
    }
}
