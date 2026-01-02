import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token management with localStorage persistence
let accessToken = null
let refreshToken = null

// Initialize tokens from localStorage on module load
const initializeTokens = () => {
  try {
    const storedAccessToken = localStorage.getItem('smartbite_access_token')
    const storedRefreshToken = localStorage.getItem('smartbite_refresh_token')
    
    if (storedAccessToken && storedRefreshToken) {
      accessToken = storedAccessToken
      refreshToken = storedRefreshToken
    }
  } catch (error) {
    // Continue without tokens if localStorage fails
  }
}

// Initialize tokens when module loads
initializeTokens()

export const setTokens = (access, refresh) => {
  accessToken = access
  refreshToken = refresh
  
  // Persist tokens to localStorage
  try {
    if (access && refresh) {
      localStorage.setItem('smartbite_access_token', access)
      localStorage.setItem('smartbite_refresh_token', refresh)
    }
  } catch (error) {
    // Continue if localStorage fails
  }
}

export const getAccessToken = () => {
  return accessToken
}

export const getRefreshToken = () => {
  return refreshToken
}

export const clearTokens = () => {
  accessToken = null
  refreshToken = null
  
  // Clear tokens from localStorage
  try {
    localStorage.removeItem('smartbite_access_token')
    localStorage.removeItem('smartbite_refresh_token')
  } catch (error) {
    // Continue if localStorage fails
  }
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/users/refresh-token`,
          { refreshToken },
          { 
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
          }
        )

        if (refreshResponse.data?.success && refreshResponse.data?.data?.tokens) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data.data.tokens
          
          setTokens(newAccessToken, newRefreshToken)
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred'
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    })
  }
)

export default api