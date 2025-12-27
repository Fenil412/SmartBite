import api from './api.js'

export const mealPlanService = {
  // Create meal plan
  createMealPlan: async (data) => {
    console.log('🔍 DEBUG: mealPlanService.createMealPlan called with data:', data)
    console.log('🔍 DEBUG: Making POST request to /meal-plans')
    
    const response = await api.post('/meal-plans', data)
    
    console.log('🔍 DEBUG: createMealPlan API response:', response)
    return response
  },

  // Get all meal plans for current user
  getMyMealPlans: async () => {
    return await api.get('/meal-plans')
  },

  // Get single meal plan by ID
  getMealPlanById: async (planId) => {
    return await api.get(`/meal-plans/${planId}`)
  },

  // Update meal plan
  updateMealPlan: async (planId, data) => {
    console.log('🔍 DEBUG: mealPlanService.updateMealPlan called with planId:', planId, 'data:', data)
    console.log('🔍 DEBUG: Making PUT request to /meal-plans/' + planId)
    
    const response = await api.put(`/meal-plans/${planId}`, data)
    
    console.log('🔍 DEBUG: updateMealPlan API response:', response)
    return response
  },

  // Delete meal plan (soft delete)
  deleteMealPlan: async (planId) => {
    return await api.delete(`/meal-plans/${planId}`)
  },

  // Mark meal as eaten
  adhereMeal: async (planId, payload) => {
    return await api.post(`/meal-plans/${planId}/adhere`, payload)
  },

  // Mark meal as skipped
  skipMeal: async (planId, payload) => {
    return await api.post(`/meal-plans/${planId}/skip`, payload)
  },

  // Replace meal
  replaceMeal: async (planId, payload) => {
    return await api.post(`/meal-plans/${planId}/replace`, payload)
  }
}