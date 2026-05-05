using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers
{
    [Authorize(Roles = "SuperAdmin,Admin")] // Sadece yetkililer erişebilir
    [Route("api/[controller]")]
    [ApiController]
    public class AdminMLController : ControllerBase
    {
        private readonly IMLService _mlService;

        public AdminMLController(IMLService mlService)
        {
            _mlService = mlService;
        }

        // POST: api/AdminML/educate
        [HttpPost("educate")]
        public async Task<IActionResult> TrainModel()
        {
            // CSV dosyasının API projesinin ana dizininde olduğunu varsayıyoruz
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Airline_review.csv");
            Console.Write($"Model eğitimi için CSV dosyası aranıyor: {filePath}");
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("Eğitim verisi (Airline_review.csv) bulunamadı.");
            }

            await _mlService.TrainModelAsync(filePath);
            return Ok("Model sağlanan veri kümesi kullanılarak başarıyla eğitildi.");
        }

        // GET: api/AdminML/test-prediction?comment=harika bir uçuştu
        [HttpGet("test-prediction")]
        public async Task<IActionResult> TestModel([FromQuery] string comment)
        {
            if (string.IsNullOrEmpty(comment))
                return BadRequest("Lütfen bir yorum girin.");

            var rating = await _mlService.PredictRatingAsync(comment);

            return Ok(new
            {
                Comment = comment,
                PredictedRating = rating,
                Message = "Bu puan model tarafından otomatik hesaplanmıştır."
            });
        }
    }
}