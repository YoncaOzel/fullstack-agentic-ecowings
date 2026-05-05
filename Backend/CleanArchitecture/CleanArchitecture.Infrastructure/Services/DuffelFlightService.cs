using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using CleanArchitecture.Core.DTOs.Flight;
using CleanArchitecture.Core.Helpers;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Settings; // Eğer DuffelSettings Core/Settings içindeyse
using Microsoft.Extensions.Options;

namespace CleanArchitecture.Infrastructure.Services
{
    public class DuffelFlightService : IFlightSearchService
    {
        private readonly HttpClient _httpClient;
        private readonly string _accessToken;

        public DuffelFlightService(HttpClient httpClient, IOptions<DuffelSettings> settings)
        {
            _httpClient = httpClient;
            _accessToken = settings.Value.AccessToken;

            _httpClient.BaseAddress = new Uri("https://api.duffel.com/");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
            _httpClient.DefaultRequestHeaders.Add("Duffel-Version", "v2");
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        public async Task<List<FlightDto>> SearchFlightsAsync(string origin, string destination, string date, int adults, string travelClass)
        {
            try
            {
                var passengers = new List<object>();
                for (int i = 0; i < adults; i++)
                {
                    passengers.Add(new { type = "adult" });
                }

                string mappedClass = string.IsNullOrEmpty(travelClass) ? "economy" : travelClass.ToLower();
                if (mappedClass == "premium_economy") mappedClass = "premium_economy";
                else if (mappedClass != "business" && mappedClass != "first") mappedClass = "economy";

                var requestBody = new
                {
                    data = new
                    {
                        slices = new[]
                        {
                            new
                            {
                                origin = origin,
                                destination = destination,
                                departure_date = date
                            }
                        },
                        passengers = passengers,
                        cabin_class = mappedClass
                    }
                };

                var url = "air/offer_requests?return_offers=true";
                var response = await _httpClient.PostAsJsonAsync(url, requestBody);
                var rawJson = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Duffel API Error: {response.StatusCode} - {rawJson}");
                    return new List<FlightDto>();
                }

                var json = JsonSerializer.Deserialize<JsonElement>(rawJson);
                var results = new List<FlightDto>();

                if (!json.TryGetProperty("data", out var dataObj) || !dataObj.TryGetProperty("offers", out var offersArray))
                {
                    return results;
                }

                foreach (var offer in offersArray.EnumerateArray())
                {
                    try
                    {
                        var price = offer.GetProperty("total_amount").GetString();
                        var currency = offer.GetProperty("total_currency").GetString();

                        var slices = offer.GetProperty("slices");
                        if (slices.GetArrayLength() == 0) continue;

                        var slice = slices[0];
                        var segmentsArray = slice.GetProperty("segments");

                        var segmentsList = new List<FlightSegmentDto>();
                        double totalDurationMinutes = 0;

                        string mainCarrier = "Unknown";
                        string mainFlightNumber = "";
                        string departureTime = "";
                        string arrivalTime = "";

                        foreach (var segment in segmentsArray.EnumerateArray())
                        {
                            var segOrigin = segment.GetProperty("origin").GetProperty("iata_code").GetString();
                            var segDestination = segment.GetProperty("destination").GetProperty("iata_code").GetString();

                            var segDepTime = segment.GetProperty("departing_at").GetString();
                            var segArrTime = segment.GetProperty("arriving_at").GetString();

                            var carrier = segment.GetProperty("operating_carrier");
                            var carrierCode = carrier.TryGetProperty("iata_code", out var code) && code.ValueKind != JsonValueKind.Null ? code.GetString() : carrier.GetProperty("name").GetString();

                            var flNumber = segment.GetProperty("operating_carrier_flight_number").GetString();

                            var parsedDep = DateTime.Parse(segDepTime);
                            var parsedArr = DateTime.Parse(segArrTime);
                            var parsedDuration = parsedArr - parsedDep;
                            totalDurationMinutes += parsedDuration.TotalMinutes;

                            if (string.IsNullOrEmpty(mainFlightNumber))
                            {
                                mainCarrier = carrierCode;
                                mainFlightNumber = flNumber;
                                departureTime = segDepTime;
                            }
                            arrivalTime = segArrTime;

                            segmentsList.Add(new FlightSegmentDto
                            {
                                Departure = segOrigin,
                                Arrival = segDestination,
                                DepartureTime = segDepTime,
                                ArrivalTime = segArrTime,
                                Carrier = carrierCode,
                                FlightNumber = flNumber,
                                Duration = parsedDuration.ToString(@"hh\:mm")
                            });
                        }

                        var totalHours = totalDurationMinutes / 60.0;
                        var emissionData = CalculateEmission(totalHours);
                        TimeSpan totalSliceDuration = TimeSpan.FromMinutes(totalDurationMinutes);

                        results.Add(new FlightDto
                        {
                            Departure = origin,
                            Arrival = destination,
                            DepartureTime = departureTime,
                            ArrivalTime = arrivalTime,
                            Carrier = mainCarrier,
                            FlightNumber = mainFlightNumber,
                            Price = price,
                            Currency = currency,
                            Date = date,
                            Duration = totalSliceDuration.ToString(@"hh\:mm"),

                            CarbonEmission = emissionData, // Artık sadece double dönüyor

                            Segments = segmentsList
                        });
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Parse error: {ex.Message}");
                        continue;
                    }
                }

                return results.OrderBy(r => double.Parse(r.Price)).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DuffelService Exception: {ex.Message}");
                return new List<FlightDto>();
            }
        }

        public async Task<FlightDto?> GetLuckyFlightAndCreateTicketAsync(string origin, int userId)
        {
            return null;
        }

        public double CalculateEmission(double totalHours)
        {
            return EmissionCalculator.Calculate(totalHours); // Güncellendi
        }
    }
}