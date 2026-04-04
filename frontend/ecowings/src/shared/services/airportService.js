import apiClient from "./apiClient";

const airportService = {
  /** GET /api/Airport — returns Airport[] with { id, code, name, city, country } */
  getAllAirports: () => apiClient.get("/api/Airport"),

  /**
   * GET /api/Airport/search?term=... — returns up to 10 matching airports
   * Searches by name or IATA code prefix (backend: StartsWith logic)
   */
  searchAirports: (term) => apiClient.get("/api/Airport/search", { params: { term } }),
};

export default airportService;
