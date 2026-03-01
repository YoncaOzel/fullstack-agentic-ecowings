using CleanArchitecture.Core.DTOs;
using CleanArchitecture.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using CleanArchitecture.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;

namespace CleanArchitecture.WebApi.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class LuckyFlightController : ControllerBase
    {
        private readonly IAmadeusService _amadeusService;

        public LuckyFlightController(IAmadeusService amadeusService)
        {
            _amadeusService = amadeusService;
        }
        /*
        /// <summary>
        /// Returns a surprise economy-class flight from the given origin to a random city in Turkey within the next 30 days.
        /// </summary>
        /// <param name="origin">Origin airport IATA code (e.g. AYT)</param>
        /// <returns>A randomly selected flight suggestion</returns>
        /// */
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLuckyFlight([FromQuery] string origin, [FromQuery] int userId)
        {
            var flight = await _amadeusService.GetLuckyFlightAndCreateTicketAsync(origin, userId);

            if (flight == null)
                return NotFound("No available lucky flight found. Try again later.");

            return Ok(flight);
        }
    }
}
