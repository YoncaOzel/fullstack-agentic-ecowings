using System;

namespace CleanArchitecture.Core.Entities
{
    public class Flight
    {
        public int Id { get; set; }
        public string FlightNumber { get; set; }

        public int DepartureAirportId { get; set; }
        public Airport Departure { get; set; }

        public int DestinationAirportId { get; set; }
        public Airport Destination { get; set; }

        public DateTime DepartureTime { get; set; }
        public DateTime EstimatedArrivalTime { get; set; }
        public decimal Price { get; set; }

        public int AirlineId { get; set; }           // 👈 FK Property
        public Airline Airline { get; set; }         // 👈 Navigation Property
    }
}
