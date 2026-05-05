using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.DTOs.Flight
{
    public class CarbonComparisonDto
    {
        public double FlightEmissionKg { get; set; }
        public double AlternativeEmissionKg { get; set; }
        public string AlternativeMode { get; set; }
        public double PercentageDifference { get; set; }
        public bool IsAlternativeGreener { get; set; }
        public string SavingsCategory { get; set; }
    }
}
