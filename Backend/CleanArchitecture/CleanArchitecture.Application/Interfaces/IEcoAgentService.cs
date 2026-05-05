using System.Threading.Tasks;
using System.Text.Json.Serialization;

namespace CleanArchitecture.Core.Interfaces
{
    public interface IEcoAgentService
    {
        Task<EcoAgentResponseDto> GetAlternativeEmissionAsync(string departureCity, string destinationCity);
    }

    public class EcoAgentResponseDto
    {
        [JsonPropertyName("mode")]
        public string Mode { get; set; }

        [JsonPropertyName("emissionKg")]
        public double EmissionKg { get; set; }
    }
}