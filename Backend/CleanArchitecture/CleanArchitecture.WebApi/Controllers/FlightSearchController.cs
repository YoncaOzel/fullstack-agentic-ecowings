// Backend/CleanArchitecture/CleanArchitecture.WebApi/Controllers/FlightSearchController.cs
using CleanArchitecture.Core.Enums;
using CleanArchitecture.Core.Interfaces; // IEcoAgentService için eklendi
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using CleanArchitecture.Core.DTOs.SearchFlightsWithBookingRequest;
using MediatR;

namespace CleanArchitecture.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FlightSearchController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IEcoAgentService _ecoAgentService; // AI Servisi eklendi

        // Constructor güncellendi
        public FlightSearchController(IMediator mediator, IEcoAgentService ecoAgentService)
        {
            _mediator = mediator;
            _ecoAgentService = ecoAgentService;
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> Search(
            [FromQuery] string origin,
            [FromQuery] string destination,
            [FromQuery] string date,
            [FromQuery] int adults = 1,
            [FromQuery] TravelClass travelClass = TravelClass.ECONOMY)
        {
            var query = new SearchFlightsWithBookingRequestDTO
            {
                Origin = origin,
                Destination = destination,
                Date = date,
                Adults = adults,
                TravelClass = travelClass.ToString()
            };

            var response = await _mediator.Send(query);

            return Ok(response);
        }

        /// <summary>
        /// Asks the Python AI service for the most eco-friendly alternative transport method between two points.
        /// Example Request: GET /api/FlightSearch/alternative?origin=AYT&destination=IST
        /// </summary>
        [HttpGet("alternative")]
        [AllowAnonymous] // Kullanıcı giriş yapmadan da görebilsin diye eklendi
        public async Task<IActionResult> GetAlternativeTransport([FromQuery] string origin, [FromQuery] string destination)
        {
            if (string.IsNullOrWhiteSpace(origin) || string.IsNullOrWhiteSpace(destination))
            {
                return BadRequest(new { succeeded = false, message = "Origin and destination points are required." });
            }

            var result = await _ecoAgentService.GetAlternativeEmissionAsync(origin, destination);

            if (result == null || result.Mode == "None")
            {
                // Alternatif bulunamadığında null dönecek
                return Ok(new { succeeded = true, message = "No alternative route found.", data = (object)null });
            }

            // Başarılı olduğunda veriyi dönecek
            return Ok(new { succeeded = true, message = "Alternative transport method retrieved successfully.", data = result });
        }
    }
}