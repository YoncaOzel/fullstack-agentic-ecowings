import apiClient from "../../../shared/services/apiClient";

const reviewService = {
  getReviews: () => apiClient.get("/api/AirlineReview"),

  addReview: (data) => apiClient.post("/api/AirlineReview", data),

  updateReview: (id, data) => apiClient.put(`/api/AirlineReview/${id}`, data),

  deleteReview: (id) => apiClient.delete(`/api/AirlineReview/${id}`),
};

export default reviewService;
