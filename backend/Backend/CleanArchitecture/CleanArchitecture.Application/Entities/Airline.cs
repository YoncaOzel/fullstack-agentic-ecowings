using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Entities
{
    public class Airline
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Country { get; set; }
        public List<Flight> Flights { get; set; } = new();
        public List<AirlineReview> Reviews { get; set; } = new();
    }
}
