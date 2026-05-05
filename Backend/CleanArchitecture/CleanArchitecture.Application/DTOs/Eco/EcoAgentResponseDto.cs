using System.Text.Json.Serialization;

namespace CleanArchitecture.Core.DTOs.Eco
{
    public class EcoAgentResponseDto
    {
        [JsonPropertyName("mode")]
        public string Mode { get; set; } // Örn: "Tren", "Elektrikli Otobüs"

        [JsonPropertyName("emissionKg")]
        public double EmissionKg { get; set; } // Örn: 15.5
    }
}