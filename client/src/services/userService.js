import api from './api.js'
import { getRefreshToken } from './api.js'

export const userService = {
  // Authentication
  signup: async (data) => {
    return await api.post('/users/signup', data)
  },

  login: async (data) => {
    return await api.post('/users/login', data)
  },

  logout: async () => {
    return await api.post('/users/logout')
  },

  refreshToken: async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    return await api.post('/users/refresh-token', { refreshToken })
  },

  // Password Reset (OTP Flow)
  requestPasswordOtp: async (email) => {
    return await api.post('/users/password/request-otp', { email })
  },

  resetPasswordWithOtp: async (payload) => {
    return await api.post('/users/password/reset', payload)
  },

  // User Profile
  getMe: async () => {
    return await api.get('/users/me')
  },

  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    
    return await api.put('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Activity Stats API
  getActivityStats: async () => {
    return await api.get('/users/activity-stats')
  },

  // Update User Data API
  updateUserData: async (data) => {
    return await api.put('/users/update', data)
  },

  // Store Additional Data API
  storeAdditionalData: async (data) => {
    return await api.put('/users/additional-data', data)
  },

  // Get Activity History
  getActivityHistory: async () => {
    return await api.get('/users/activity')
  },

  // Delete Account
  deleteAccount: async () => {
    return await api.delete('/users/me')
  },

  deleteAccount: async () => {
    return await api.delete('/users/me')
  },

  // User Activity
  getActivityHistory: async () => {
    return await api.get('/users/activity')
  },

  // Store Additional User Data
  storeAdditionalData: async (data) => {
    return await api.put('/users/additional-data', data)
  },

  // Update User Data
  updateUserData: async (data) => {
    return await api.put('/users/update', data)
  },

  // Internal AI Context
  getAIUserContext: async (userId) => {
    return await api.get(`/users/internal/ai/user-context/${userId}`)
  },
}