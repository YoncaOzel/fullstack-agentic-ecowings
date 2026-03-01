import apiClient from "../../../shared/services/apiClient";

const flightService = {
  getFlights: () => apiClient.get("/api/Flights"),

  getFlightById: (id) => apiClient.get(`/api/Flights/${id}`),

  searchFlights: (params) => apiClient.post("/api/Flights/search", params),
};

export default flightService;
