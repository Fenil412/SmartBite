import api from './api.js'

export const mealService = {
  // Get meals with filters and pagination
  getMeals: async (filters = {}) => {
    const params = new URLSearchParams()
    
    if (filters.cuisine) params.append('cuisine', filters.cuisine)
    if (filters.mealType) params.append('mealType', filters.mealType)
    if (filters.costLevel) params.append('costLevel', filters.costLevel)
    if (filters.vegetarian !== undefined) params.append('vegetarian', filters.vegetarian)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    
    const queryString = params.toString()
    const url = queryString ? `/meals?${queryString}` : '/meals'
    
    return await api.get(url)
  },

  // Get all meals for ML/AI analysis (returns full meal catalog)
  getAllMeals: async () => {
    return await api.get('/ml/meals')
  },

  // Get single meal by ID
  getMealById: async (mealId) => {
    return await api.get(`/meals/${mealId}`)
  },

  // Create new meal (auth required) - supports FormData for image upload
  createMeal: async (data) => {
    const isFormData = data instanceof FormData
    return await api.post('/meals', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    })
  },

  // Update meal (auth + owner only) - supports FormData for image upload
  updateMeal: async (mealId, data) => {
    const isFormData = data instanceof FormData
    return await api.put(`/meals/${mealId}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    })
  },

  // Delete meal (auth + owner only) - soft delete
  deleteMeal: async (mealId) => {
    return await api.delete(`/meals/${mealId}`)
  },

  // Toggle like/unlike meal (auth required)
  toggleLikeMeal: async (mealId) => {
    return await api.post(`/meals/${mealId}/like`)
  }
}