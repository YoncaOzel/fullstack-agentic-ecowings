import apiClient from "../../../shared/services/apiClient";

const flightService = {
  getFlights: () => apiClient.get("/api/Flights"),

  getFlightById: (id) => apiClient.get(`/api/Flights/${id}`),

  searchFlights: (params) => apiClient.post("/api/Flights/search", params),

  /**
   * Amadeus API üzerinden uçuş arar.
   * GET /api/FlightSearch/search
   * @param {string} origin      - Kalkış IATA kodu veya şehir (ör: "IST")
   * @param {string} destination - Varış IATA kodu veya şehir (ör: "AYT")
   * @param {string} date        - "YYYY-MM-DD" formatında tarih
   * @param {number} adults      - Yolcu sayısı (varsayılan: 1)
   * @param {string} travelClass - "ECONOMY" | "BUSINESS" | "FIRST" (varsayılan: "ECONOMY")
   */
  searchFlightsApi: (
    origin,
    destination,
    date,
    adults = 1,
    travelClass = "ECONOMY",
  ) =>
    apiClient.get("/api/FlightSearch/search", {
      params: { origin, destination, date, adults, travelClass },
    }),
};

export default flightService;
