using System;

namespace CleanArchitecture.Core.Entities
{
    public class AirlineReview
    {
        public int Id { get; set; }
        public string Comment { get; set; }
        public int Rating { get; set; } // 1-5 arası puan
        public DateTime CreatedAt { get; set; }

        // Foreign Keys
        public int AirlineId { get; set; }
        public Airline Airline { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }
    }
}
