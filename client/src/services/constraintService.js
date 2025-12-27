import api from './api.js'

export const constraintService = {
  // Create or update constraints (upsert)
  upsertConstraints: async (payload) => {
    return await api.post('/constraints', payload)
  },

  // Get my constraints
  getMyConstraints: async () => {
    return await api.get('/constraints')
  },

  // Delete constraints
  deleteConstraints: async () => {
    return await api.delete('/constraints')
  }
}