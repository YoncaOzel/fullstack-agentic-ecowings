import apiClient from "../../../shared/services/apiClient";

const authService = {
  login: (data) => apiClient.post("/api/Account/authenticate", data),

  register: (data) => apiClient.post("/api/Account/register", data),

  refreshToken: (token) =>
    apiClient.post("/api/Account/refresh-token", { token }),

  forgotPassword: (email) =>
    apiClient.post("/api/Account/forgot-password", { email }),
};

export default authService;
