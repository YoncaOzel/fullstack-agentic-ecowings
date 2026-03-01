using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.DTOs.Flight
{
    public class BookFlightRequest
    {
        public string FlightNumber { get; set; }

        public int DepartureAirportId { get; set; }
        public int DestinationAirportId { get; set; }

        public DateTime DepartureTime { get; set; }
        public DateTime EstimatedArrivalTime { get; set; }

        public decimal Price { get; set; }

        public int AirlineId { get; set; }
        public int UserId { get; set; }
    }

}
