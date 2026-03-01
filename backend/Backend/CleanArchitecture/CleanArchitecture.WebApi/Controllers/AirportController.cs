using CleanArchitecture.Core.Features.Airports.Commands.CreateAirport;
using CleanArchitecture.Core.Features.Airports.Commands.DeleteAirport;
using CleanArchitecture.Core.Features.Airports.Commands.UpdateAirport;
using CleanArchitecture.Core.Features.Airports.Queries.GetAirportById;
using CleanArchitecture.Core.Features.Airports.Queries.GetAllAirports;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers
{
    [Authorize(Roles = "SuperAdmin,Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class AirportController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AirportController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateAirportCommand command)
        {
            var id = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id }, id);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var airports = await _mediator.Send(new GetAllAirportsQuery());
            return Ok(airports);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var airport = await _mediator.Send(new GetAirportByIdQuery { Id = id });
            return Ok(airport);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateAirportCommand command)
        {
            if (id != command.Id)
                return BadRequest("Route ID and body ID must match.");

            var updatedId = await _mediator.Send(command);
            return Ok(updatedId);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deletedId = await _mediator.Send(new DeleteAirportCommand { Id = id });
            return Ok(deletedId);
        }
    }
}
