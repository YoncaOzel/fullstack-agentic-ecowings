// Backend/CleanArchitecture/CleanArchitecture.Application/DTOs/Flight/FlightDto.cs
using System.Collections.Generic;

namespace CleanArchitecture.Core.DTOs.Flight
{
    public class FlightDto
    {
        public string Departure { get; set; }
        public string Arrival { get; set; }
        public string DepartureTime { get; set; }
        public string ArrivalTime { get; set; }
        public string Carrier { get; set; }
        public string FlightNumber { get; set; }
        public string Price { get; set; }
        public string Currency { get; set; }
        public string Date { get; set; }
        public string Duration { get; set; }

        public double CarbonEmission { get; set; } // Only this property remains

        public List<FlightSegmentDto> Segments { get; set; } = new List<FlightSegmentDto>();
    }

    public class FlightSegmentDto
    {
        public string Departure { get; set; }
        public string Arrival { get; set; }
        public string DepartureTime { get; set; }
        public string ArrivalTime { get; set; }
        public string Carrier { get; set; }
        public string FlightNumber { get; set; }
        public string Duration { get; set; }
    }
}