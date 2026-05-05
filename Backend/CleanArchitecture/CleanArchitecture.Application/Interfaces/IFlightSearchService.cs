// Backend/CleanArchitecture/CleanArchitecture.Application/Interfaces/IFlightSearchService.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using CleanArchitecture.Core.DTOs.Flight;

namespace CleanArchitecture.Core.Interfaces
{
    public interface IFlightSearchService
    {
        // Standard flight search method
        Task<List<FlightDto>> SearchFlightsAsync(string origin, string destination, string date, int adults, string travelClass);

        // Random/Lucky flight and ticket creation method
        Task<FlightDto?> GetLuckyFlightAndCreateTicketAsync(string origin, int userId);

        // Carbon emission calculation method
        double CalculateEmission(double totalHours); // Updated signature
    }
}