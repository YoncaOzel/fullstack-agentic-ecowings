using System.Collections.Generic;
using System.Threading.Tasks;
using CleanArchitecture.Core.DTOs;

namespace CleanArchitecture.Core.Interfaces
{
    public interface IAmadeusService
    {
        Task<string> GetAccessTokenAsync();

        Task<List<FlightDto>> SearchFlightsAsync(string origin, string destination, string date, int adults, string travelClass);

        Task<FlightDto?> GetLuckyFlightAndCreateTicketAsync(string origin, int userId);

        // ✅ GÜNCELLENDİ: Artık direkt saat değerini alıyor
        (double Amount, string Category) CalculateEmission(double totalHours);
    }
}