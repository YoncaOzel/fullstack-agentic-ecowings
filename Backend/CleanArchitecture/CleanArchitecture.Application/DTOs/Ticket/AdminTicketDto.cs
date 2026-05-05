using System;

namespace CleanArchitecture.Core.DTOs.Ticket
{
    public class AdminTicketDto
    {
        public int TicketId { get; set; }
        public string PnrCode { get; set; }
        public bool IsPaid { get; set; }
        public DateTime BookingDate { get; set; }
        public decimal Price { get; set; }
        public bool IsDiscounted { get; set; }
        public decimal? DiscountedPrice { get; set; }
        public decimal? DiscountRate { get; set; }

        public int PassengerId { get; set; }
        public string PassengerName { get; set; }
        public string PassengerEmail { get; set; }

        public int FlightId { get; set; }
        public string FlightNumber { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public DateTime DepartureTime { get; set; }
        public DateTime EstimatedArrivalTime { get; set; }
    }
}
