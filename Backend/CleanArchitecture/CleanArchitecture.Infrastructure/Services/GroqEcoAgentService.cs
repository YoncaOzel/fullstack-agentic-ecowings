using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using CleanArchitecture.Core.Interfaces;

namespace CleanArchitecture.Infrastructure.Services
{
    public class GroqEcoAgentService : IEcoAgentService
    {
        private readonly HttpClient _httpClient;
        private readonly string _pythonApiUrl;
        private readonly IAirportRepositoryAsync _airportRepository; // ✅ Veritabanından havalimanı bulmak için eklendi
        private static readonly System.Collections.Generic.IReadOnlyDictionary<string, string> AirportCityFallbacks =
            new System.Collections.Generic.Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["IST"] = "Istanbul, Turkey",
                ["SAW"] = "Istanbul, Turkey",
                ["AYT"] = "Antalya, Turkey"
            };

        public GroqEcoAgentService(HttpClient httpClient, IConfiguration configuration, IAirportRepositoryAsync airportRepository)
        {
            _httpClient = httpClient;
            _airportRepository = airportRepository;
            _pythonApiUrl = NormalizeBaseUrl(configuration["PythonEcoAgentService:BaseUrl"] ?? "http://localhost:8002");
        }

        private static string NormalizeBaseUrl(string baseUrl)
        {
            if (string.IsNullOrWhiteSpace(baseUrl))
            {
                return "http://localhost:8002";
            }

            baseUrl = baseUrl.Trim().TrimEnd('/');
            return baseUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                   baseUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase)
                ? baseUrl
                : $"http://{baseUrl}";
        }

        public async Task<EcoAgentResponseDto> GetAlternativeEmissionAsync(string departureCity, string destinationCity)
        {
            try
            {
                // ✅ 1. IATA Kodlarını Şehir ve Ülke İsmine Çeviriyoruz
                string originFullName = await GetCityNameAsync(departureCity);
                string destFullName = await GetCityNameAsync(destinationCity);

                Console.WriteLine($"[EcoAgent] Python'a Gönderilen Rota: {originFullName} -> {destFullName}");

                var requestBody = new
                {
                    origin = originFullName,
                    destination = destFullName
                };

                var jsonBody = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

                // 2. İşi Python Mikroservisine Devret
                var response = await _httpClient.PostAsync($"{_pythonApiUrl}/api/eco/alternative", content);

                if (!response.IsSuccessStatusCode) return null;

                var responseString = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<EcoAgentResponseDto>(responseString, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (result == null || result.Mode == "None")
                {
                    return null;
                }

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EcoAgentService] Python Mikroservisine ulaşılamadı: {ex.Message}");
                return null;
            }
        }

        // ✅ 3. Hayat Kurtaran Çeviri Metodu (AYT -> Antalya, Turkey)
        private async Task<string> GetCityNameAsync(string codeOrName)
        {
            if (string.IsNullOrWhiteSpace(codeOrName)) return codeOrName;
            codeOrName = codeOrName.Trim();

            if (codeOrName.Length == 3)
            {
                var airports = await _airportRepository.SearchAirportsAsync(codeOrName, 10);
                if (airports != null && airports.Count > 0)
                {
                    var exactMatch = System.Linq.Enumerable.FirstOrDefault(airports, a => a.Code.Equals(codeOrName, StringComparison.OrdinalIgnoreCase));
                    var targetAirport = exactMatch ?? airports[0];
                    return $"{targetAirport.City}, {targetAirport.Country}";
                }

                if (AirportCityFallbacks.TryGetValue(codeOrName, out var cityName))
                {
                    return cityName;
                }

                return $"{codeOrName} International Airport";
            }

            return codeOrName;
        }
    }
}
