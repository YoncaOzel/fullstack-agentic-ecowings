import apiClient from "./apiClient";

const airportService = {
  /** GET /api/Airport — returns Airport[] with { id, code, name, city, country } */
  getAllAirports: () => apiClient.get("/api/Airport"),
};

export default airportService;
