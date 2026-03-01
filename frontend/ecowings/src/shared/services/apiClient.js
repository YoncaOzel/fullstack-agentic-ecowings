import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — JWT token ekle
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — 401 yönetimi (refresh token TASK-22'de eklenecek)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/Account/refresh-token`,
            { token: refreshToken },
          );
          const newToken = res.data?.data?.jwToken;
          if (newToken) {
            localStorage.setItem("jwToken", newToken);
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(error.config);
          }
        } catch {
          // refresh başarısız — oturumu kapat
        }
        localStorage.removeItem("jwToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
