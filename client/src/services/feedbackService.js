import api from './api.js'

export const feedbackService = {
  // Submit feedback
  submitFeedback: async (payload) => {
    return await api.post('/feedback', payload)
  },

  // Get my feedback history
  getMyFeedback: async () => {
    return await api.get('/feedback')
  }
}