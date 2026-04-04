import os
import re
import requests
import urllib3
from pydantic import BaseModel
from crewai.tools import BaseTool

# Self-signed sertifika uyarısını kapat (lokal geliştirme)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def _parse_duration(iso_duration: str) -> str:
    """ISO 8601 duration (PT3H30M) -> '3h 30m' formatına çevirir."""
    if not iso_duration:
        return "N/A"
    hours = re.search(r"(\d+)H", iso_duration)
    minutes = re.search(r"(\d+)M", iso_duration)
    h = int(hours.group(1)) if hours else 0
    m = int(minutes.group(1)) if minutes else 0
    parts = []
    if h:
        parts.append(f"{h}h")
    if m:
        parts.append(f"{m}m")
    return " ".join(parts) if parts else iso_duration


class FlightSearchInput(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: str = ""
    adults: int = 1
    travel_class: str = "ECONOMY"


class FlightSearchTool(BaseTool):
    name: str = "EcoWings Flight Search"
    description: str = (
        "Search for real available flights using the EcoWings platform. "
        "Provide IATA airport codes (e.g. IST for Istanbul, CDG for Paris, JFK for New York). "
        "Returns real flight options with prices, times, and durations. "
        "If no results are found or the backend is unavailable, the agent should provide estimated options."
    )
    args_schema: type[BaseModel] = FlightSearchInput

    def _run(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: str = "",
        adults: int = 1,
        travel_class: str = "ECONOMY",
    ) -> str:
        backend_url = os.getenv("ECOWINGS_BACKEND_URL", "https://localhost:5000")
        params = {
            "origin": origin,
            "destination": destination,
            "date": departure_date,
            "adults": adults,
            "travelClass": travel_class,
        }

        try:
            response = requests.get(
                f"{backend_url}/api/FlightSearch/search",
                params=params,
                timeout=15,
                verify=False,  # self-signed sertifika için
            )

            if response.status_code != 200:
                return (
                    f"EcoWings backend returned HTTP {response.status_code}. "
                    "No real flight data available. Please provide estimated flight options based on typical routes."
                )

            flights = response.json()

            if not isinstance(flights, list) or len(flights) == 0:
                return (
                    "EcoWings Flight Search returned no flights for this route. "
                    "Please provide estimated flight options based on typical routes for this destination."
                )

            results = [f"EcoWings returned {len(flights)} flight(s):"]
            for flight in flights[:5]:
                duration_raw = flight.get("duration", "")
                duration_str = _parse_duration(duration_raw) if duration_raw else "N/A"
                price = flight.get("price", "N/A")
                currency = flight.get("currency", "")
                line = (
                    f"- Flight {flight.get('flightNumber', 'N/A')} | "
                    f"Carrier: {flight.get('carrier', 'N/A')} | "
                    f"Departure: {flight.get('departureTime', 'N/A')} | "
                    f"Arrival: {flight.get('arrivalTime', 'N/A')} | "
                    f"Duration: {duration_str} | "
                    f"Price: {price} {currency} | "
                    f"CO2: {flight.get('carbonEmission', 'N/A')} kg"
                )
                results.append(line)

            return "\n".join(results)

        except requests.exceptions.SSLError:
            return (
                "EcoWings backend SSL error (self-signed certificate). "
                "Please provide estimated flight options based on typical routes for this destination."
            )
        except requests.exceptions.ConnectionError:
            return (
                "EcoWings backend is not reachable at the configured URL. "
                "Please provide estimated flight options based on typical routes for this destination."
            )
        except Exception as e:
            return (
                f"An unexpected error occurred while searching flights: {str(e)}. "
                "Please provide estimated flight options based on typical routes for this destination."
            )
