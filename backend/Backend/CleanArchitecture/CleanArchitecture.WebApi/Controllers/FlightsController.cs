using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization; 
using MediatR;
using CleanArchitecture.Core.Features.Flights.Commands.CreateFlight;
using CleanArchitecture.Core.Features.Flights.Commands.UpdateFlight;
using CleanArchitecture.Core.Features.Flights.Commands.DeleteFlight;
using CleanArchitecture.Core.Features.Flights.Queries.GetFlightById;
using CleanArchitecture.Core.Features.Flights.Queries.GetAllFlights;
using System.Threading.Tasks;
using CleanArchitecture.Core.DTOs.Flight;
using CleanArchitecture.Core.Entities;
using System;
using CleanArchitecture.Core.Features.Flights.Commands.BookFlight;

namespace CleanArchitecture.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FlightsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public FlightsController(IMediator mediator)
        {
            _mediator = mediator;
        }

 
        // Yeni Uçuş Ekleme
        [HttpPost]
        [Authorize(Roles = "SuperAdmin,Admin")] 
        public async Task<IActionResult> Create([FromBody] CreateFlightCommand command)
        {
            var flightId = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = flightId }, new { id = flightId });
        }

        // Uçuş Bilgilerini Güncelleme
        [HttpPut("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")] 
        public async Task<IActionResult> Update(int id, [FromBody] UpdateFlightCommand command)
        {
            if (id != command.Id)
                return BadRequest("ID mismatch.");

            await _mediator.Send(command);
            return NoContent();
        }

        // Uçuşu Silme (İptal Etme)
        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")] 
        public async Task<IActionResult> Delete(int id)
        {
            await _mediator.Send(new DeleteFlightCommand { Id = id });
            return NoContent();
        }

        // Tüm Uçuşları Listeleme (Arama Sonuçları)
        [HttpGet]
        [AllowAnonymous] 
        public async Task<IActionResult> GetAll()
        {
            var flights = await _mediator.Send(new GetAllFlightsQuery());
            return Ok(flights);
        }

        // Tek Bir Uçuş Detayını Görme
        [HttpGet("{id}")]
        [AllowAnonymous] 
        public async Task<IActionResult> GetById(int id)
        {
            var flight = await _mediator.Send(new GetFlightByIdQuery { Id = id });
            if (flight == null)
                return NotFound();

            return Ok(flight);
        }


        // Bilet Rezervasyonu / Satın Alma
        [HttpPost("book")]
        [Authorize] 
        public async Task<IActionResult> BookFlight([FromBody] BookFlightCommand command)
        {
            var ticketId = await _mediator.Send(command);
            return Ok(new { ticketId });
        }
    }
}