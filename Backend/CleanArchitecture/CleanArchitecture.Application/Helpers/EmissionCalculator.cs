// Backend/CleanArchitecture/CleanArchitecture.Application/Helpers/EmissionCalculator.cs
using System;

namespace CleanArchitecture.Core.Helpers
{
    public static class EmissionCalculator
    {
        /// <summary>
        /// Calculates estimated carbon emission based on flight duration (hours).
        /// ICAO standard: ~90 kg CO2 per passenger per hour.
        /// </summary>
        public static double Calculate(double totalHours)
        {
            double emissionAmount = totalHours * 90.0;

            // Rounding to 2 decimal places before returning
            return Math.Round(emissionAmount, 2);
        }
    }
}