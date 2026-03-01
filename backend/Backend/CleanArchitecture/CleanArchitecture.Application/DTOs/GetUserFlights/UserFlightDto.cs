using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.DTOs.GetUserFlights
{
    public class UserFlightDto
    {
        public int TicketId { get; set; }
        public string FlightNumber { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public DateTime DepartureTime { get; set; }
        public DateTime EstimatedArrivalTime { get; set; }
        public decimal Price { get; set; }
        public bool IsPaid { get; set; }
        public string PnrCode { get; set; }
    }
}
