import api from './api.js'

export const mlContractService = {
  // Get AI user context
  getAIUserContext: async (userId) => {
    return await api.get(`/ml-contract/ai-user-context/${userId}`)
  },

  // Get analytics from Flask via Node.js
  getFlaskAnalytics: async (userId) => {
    return await api.get(`/ml-contract/analytics/${userId}`)
  },

  // Export user data from Flask via Node.js
  exportFlaskData: async (userId) => {
    return await api.get(`/ml-contract/export-data/${userId}`)
  }
}