// api.js
import axios from "axios";
import { getCurrentUser, refreshToken } from "./AuthContext"; // adjust your imports

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://smartbite-server-ay4k.onrender.com",
  withCredentials: true,
  timeout: 10000,
});

// Attach response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const user = getCurrentUser(); // or get user from context/state
    if (error.response?.status === 401 && user) {
      try {
        const refreshed = await refreshToken();
        if (refreshed) {
          // Retry the original request with new token
          return api.request(error.config);
        }
      } catch (err) {
        console.error("Token refresh failed", err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
