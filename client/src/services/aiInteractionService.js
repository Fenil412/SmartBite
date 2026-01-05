import api from './api'

export const aiInteractionService = {
  // Get AI interaction statistics
  async getAiStats() {
    try {
      const response = await api.get('/analytics/ai-interactions')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch AI statistics')
    }
  },

  // Get AI interaction history with pagination and filters
  async getAiHistory(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.type) queryParams.append('type', params.type)
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      if (params.success !== undefined) queryParams.append('success', params.success)

      const response = await api.get(`/analytics/ai-interactions/history?${queryParams}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch AI history')
    }
  },

  // Get AI dashboard summary
  async getAiDashboardSummary() {
    try {
      const response = await api.get('/analytics/ai-interactions/dashboard')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch AI dashboard summary')
    }
  },

  // Get enhanced analytics (includes AI data)
  async getEnhancedAnalytics() {
    try {
      const response = await api.get('/analytics')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch enhanced analytics')
    }
  }
}

export default aiInteractionService