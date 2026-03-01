using CleanArchitecture.Core.Enums;
using CleanArchitecture.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FlightSearchController : ControllerBase
    {
        private readonly IAmadeusService _amadeusService;

        // Mediator'a artık bu controllerda ihtiyaç yok çünkü sadece okuma (arama) yapıyoruz.
        public FlightSearchController(IAmadeusService amadeusService)
        {
            _amadeusService = amadeusService;
        }

        [HttpGet("search")]
        [AllowAnonymous] // Arama işlemi herkes tarafından erişilebilir olabilir, istenirse kaldırılabilir.
        public async Task<IActionResult> Search(
            [FromQuery] string origin,
            [FromQuery] string destination,
            [FromQuery] string date,
            [FromQuery] int adults = 1,
            [FromQuery] TravelClass travelClass = TravelClass.ECONOMY)
        {
            // Veritabanına yazma işlemi yok, direkt API'den çekip dönüyoruz.
            var results = await _amadeusService.SearchFlightsAsync(
                origin,
                destination,
                date,
                adults,
                travelClass.ToString()
            );

            // Sonuç boşsa 404 değil, boş liste dönmesi daha sağlıklıdır (200 OK ve [])
            return Ok(results);
        }
    }
}