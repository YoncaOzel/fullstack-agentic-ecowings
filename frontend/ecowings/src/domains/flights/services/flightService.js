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

  /**
   * Amadeus API üzerinden rastgele şanslı uçuş döndürür.
   * GET /api/LuckyFlight/search
   * @param {string} origin  - Kalkış IATA kodu (ör: "IST")
   * @param {number} userId  - Kullanıcı ID (giriş yapılmamışsa 0)
   */
  getLuckyFlight: (origin, userId = 0) =>
    apiClient.get("/api/LuckyFlight/search", { params: { origin, userId } }),

  /**
   * Books an Amadeus flight for a user — saves flight to DB and creates an unpaid Ticket.
   * POST /api/Flights/book
   * @param {{ flightNumber, departureAirportId, destinationAirportId, departureTime, estimatedArrivalTime, price, airlineId, userId }} data
   * @returns {{ ticketId: number }}
   */
  bookAmadeusFlight: (data) => apiClient.post("/api/Flights/book", data),

  /**
   * Uçuşu kaydeder, bilet oluşturur ve Stripe ödeme linki döner — tek istekte.
   * POST /api/Flights/book-and-pay
   * @param {{ flightNumber, departureAirportCode, destinationAirportCode, departureTime, estimatedArrivalTime, price, airlineCode, userEmail }} data
   * @returns {{ ticketId: number, paymentUrl: string }}
   */
  bookAndPay: (data) => apiClient.post("/api/Flights/book-and-pay", data),
};

export default flightService;
