using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using System.Xml;
using CleanArchitecture.Core.DTOs;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Settings;
using Microsoft.Extensions.Options;

namespace CleanArchitecture.Infrastructure.Services
{
    public class AmadeusService : IAmadeusService
    {
        private readonly HttpClient _httpClient;
        private readonly AmadeusSettings _settings;

        public AmadeusService(HttpClient httpClient, IOptions<AmadeusSettings> settings)
        {
            _httpClient = httpClient;
            _settings = settings.Value;
        }

        public async Task<string> GetAccessTokenAsync()
        {
            var content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("grant_type", "client_credentials"),
                new KeyValuePair<string, string>("client_id", _settings.ClientId),
                new KeyValuePair<string, string>("client_secret", _settings.ClientSecret)
            });

            var response = await _httpClient.PostAsync($"{_settings.BaseUrl}/v1/security/oauth2/token", content);
            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            return json.GetProperty("access_token").GetString();
        }

        public async Task<List<FlightDto>> SearchFlightsAsync(string origin, string destination, string date, int adults, string travelClass)
        {
            var token = await GetAccessTokenAsync();

            var url = $"{_settings.BaseUrl}/v2/shopping/flight-offers" +
                      $"?originLocationCode={origin}" +
                      $"&destinationLocationCode={destination}" +
                      $"&departureDate={date}" +
                      $"&adults={adults}" +
                      $"&currencyCode=EUR";

            if (!string.IsNullOrEmpty(travelClass))
                url += $"&travelClass={travelClass}";

            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode) return new List<FlightDto>();

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            var results = new List<FlightDto>();

            if (!json.TryGetProperty("data", out var dataArray)) return results;

            foreach (var item in dataArray.EnumerateArray())
            {
                var itineraries = item.GetProperty("itineraries")[0];
                var segments = itineraries.GetProperty("segments");
                int segmentCount = segments.GetArrayLength();

                // İlk ve Son Segmentler (Kalkış-Varış için)
                var firstSegment = segments[0];
                var lastSegment = segments[segmentCount - 1];
                var firstDepartureCode = firstSegment.GetProperty("departure").GetProperty("iataCode").GetString();
                var finalArrivalCode   = lastSegment.GetProperty("arrival").GetProperty("iataCode").GetString();

                // Kalkış noktası kontrolü — sadece istenen origin'den kalkan uçuşlar
                if (!string.Equals(firstDepartureCode, origin, StringComparison.OrdinalIgnoreCase))
                    continue;

                // Varış noktası kontrolü — sadece istenen destination'a giden uçuşlar
                if (!string.Equals(finalArrivalCode, destination, StringComparison.OrdinalIgnoreCase))
                    continue;

                // --- GÜNCELLENEN KISIM BAŞLANGIÇ ---

                var segmentList = new List<FlightSegmentDto>();
                double totalFlightHours = 0; // Sadece havada geçen süre toplamı

                foreach (var seg in segments.EnumerateArray())
                {
                    // Her bir segmentin süresini alıp topluyoruz (Bekleme süreleri hariç)
                    var segDuration = seg.GetProperty("duration").GetString();
                    totalFlightHours += XmlConvert.ToTimeSpan(segDuration).TotalHours;

                    segmentList.Add(new FlightSegmentDto
                    {
                        Departure = seg.GetProperty("departure").GetProperty("iataCode").GetString(),
                        Arrival = seg.GetProperty("arrival").GetProperty("iataCode").GetString(),
                        DepartureTime = seg.GetProperty("departure").GetProperty("at").GetString(),
                        ArrivalTime = seg.GetProperty("arrival").GetProperty("at").GetString(),
                        Carrier = seg.GetProperty("carrierCode").GetString(),
                        FlightNumber = seg.GetProperty("number").GetString(),
                        Duration = segDuration
                    });
                }

                // Emisyonu artık toplam bekleme süresi üzerinden DEĞİL, sadece uçuş süresi üzerinden hesaplıyoruz
                var emissionData = CalculateEmission(totalFlightHours);

                // --- GÜNCELLENEN KISIM BİTİŞ ---

                var price = item.GetProperty("price").GetProperty("total").GetString();
                var currency = item.GetProperty("price").GetProperty("currency").GetString();
                var totalDurationIso = itineraries.GetProperty("duration").GetString(); // Toplam seyahat süresi (Display için)

                results.Add(new FlightDto
                {
                    Departure = firstSegment.GetProperty("departure").GetProperty("iataCode").GetString(),
                    Arrival = finalArrivalCode,
                    DepartureTime = firstSegment.GetProperty("departure").GetProperty("at").GetString(),
                    ArrivalTime = lastSegment.GetProperty("arrival").GetProperty("at").GetString(),
                    Carrier = firstSegment.GetProperty("carrierCode").GetString(),
                    FlightNumber = firstSegment.GetProperty("number").GetString(),
                    Price = price,
                    Currency = currency,
                    Date = date,
                    Duration = totalDurationIso, // Kullanıcıya gösterilecek toplam süre (beklemeler dahil)

                    CarbonEmission = emissionData.Amount,
                    EmissionClass = emissionData.Category,

                    Segments = segmentList
                });
            }

            return results;
        }

        // Metod imzası değişti: Artık string değil double alıyor
        public (double Amount, string Category) CalculateEmission(double totalHours)
        {
            // Ortalama: 90 kg CO2 / saat
            double emission = Math.Round(totalHours * 90, 2);

            string category;
            if (emission < 100) category = "Düşük (Low)";
            else if (emission < 250) category = "Orta (Moderate)";
            else if (emission < 500) category = "Yüksek (High)";
            else category = "Çok Yüksek (Extreme)";

            return (emission, category);
        }

        public async Task<FlightDto?> GetLuckyFlightAndCreateTicketAsync(string origin, int userId)
        {
            return null;
        }
    }
}