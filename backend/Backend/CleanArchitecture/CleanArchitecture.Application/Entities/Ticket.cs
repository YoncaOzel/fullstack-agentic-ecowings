using System;

namespace CleanArchitecture.Core.Entities
{
    public class Ticket
    {
        public int Id { get; set; }

        // Foreign Key
        public int PassengerId { get; set; }
        public User Passenger { get; set; }

        // Foreign Key
        public int FlightId { get; set; }
        public Flight Flight { get; set; }

        public DateTime BookingDate { get; set; }
        public bool IsPaid { get; set; } = false;
        public string PnrCode { get; set; }
        public decimal Price { get; set; }
    }
}
