using System.Text.Json.Serialization;

namespace CleanArchitecture.Core.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TravelClass
    {
        ECONOMY,
        PREMIUM_ECONOMY,
        BUSINESS,
        FIRST
    }
}
