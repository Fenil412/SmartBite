// api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://smartbite-server-ay4k.onrender.com",
  withCredentials: true,
  timeout: 10000,
});

// We'll store the refresh token function and logout function here
let _refreshToken = null;
let _logout = null;

export const setAuthFunctions = (refreshTokenFunc, logoutFunc) => {
  _refreshToken = refreshTokenFunc;
  _logout = logoutFunc;
};

// Attach response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 and not a refresh token request itself
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark request to avoid infinite loops

      if (_refreshToken && _logout) {
        try {
          const refreshed = await _refreshToken();
          if (refreshed) {
            // Retry the original request with new token
            return api.request(originalRequest);
          }
        } catch (err) {
          console.error("Token refresh failed in interceptor", err);
          _logout(); // Log out if refresh fails
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;