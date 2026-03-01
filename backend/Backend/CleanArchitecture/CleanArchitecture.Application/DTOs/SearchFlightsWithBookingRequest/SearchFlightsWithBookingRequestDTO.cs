using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.DTOs.SearchFlightsWithBookingRequest
{
    public class SearchFlightsWithBookingRequest
    {
        public string Origin { get; set; }
        public string Destination { get; set; }
        public string Date { get; set; } // "yyyy-MM-dd" format
        public int UserId { get; set; }
        public int Adults { get; set; }
        public string TravelClass { get; set; } // ECONOMY, BUSINESS, etc.
        public decimal Price { get; set; }
    }
}
