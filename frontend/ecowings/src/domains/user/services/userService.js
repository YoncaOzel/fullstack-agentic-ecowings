import apiClient from "../../../shared/services/apiClient";

const userService = {
  getProfile: () => apiClient.get("/api/User/me"),

  updateProfile: (data) => apiClient.put("/api/User/me", data),

  changePassword: (data) => apiClient.put("/api/User/change-password", data),

  getMyCoupons: () => apiClient.get("/api/User/my-coupons"),
};

export default userService;
