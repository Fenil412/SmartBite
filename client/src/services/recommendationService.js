import api from './api.js'

export const recommendationService = {
  // Generate weekly AI-based meal plan
  generateMealPlan: async () => {
    return await api.post('/recommendations/generate')
  },

  // Get meal plan history
  getMealPlanHistory: async () => {
    return await api.get('/recommendations/history')
  }
}