import api from './api'

const adminService = {
  // Dashboard and Analytics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats')
      return response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats')
    }
  },

  getSystemInfo: async () => {
    try {
      const response = await api.get('/admin/system/info')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch system info')
    }
  },

  getRecentActivity: async (limit = 50) => {
    try {
      const response = await api.get(`/admin/activity/recent?limit=${limit}`)
      return response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recent activity')
    }
  },

  // User Management
  registerAdmin: async (adminData) => {
    try {
      const response = await api.post('/admin/users/register-admin', adminData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to register admin')
    }
  },

  getAllUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const response = await api.get(`/admin/users?${queryParams}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users')
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user')
    }
  },

  updateUserRole: async (userId, roles) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { roles })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user role')
    }
  },

  updateUserStatus: async (userId, status) => {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { status })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user status')
    }
  },

  deleteUser: async (userId, permanent = false) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`, { 
        data: { permanent } 
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user')
    }
  },

  restoreUser: async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/restore`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to restore user')
    }
  },

  // Content Management
  getAllMeals: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const response = await api.get(`/admin/meals?${queryParams}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch meals')
    }
  },

  updateMealStatus: async (mealId, status) => {
    try {
      const response = await api.put(`/admin/meals/${mealId}/status`, { status })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update meal status')
    }
  },

  deleteMeal: async (mealId, permanent = false) => {
    try {
      const response = await api.delete(`/admin/meals/${mealId}`, { 
        data: { permanent } 
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete meal')
    }
  },

  // Data Export
  exportData: async (type) => {
    try {
      const response = await api.get(`/admin/export/${type}`, {
        responseType: 'blob'
      })
      return response
    } catch (error) {
      throw new Error(error.response?.data?.message || `Failed to export ${type} data`)
    }
  },

  getAllFeedback: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const response = await api.get(`/admin/feedback?${queryParams}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch feedback')
    }
  },

  // Admin Code Management (Super Admin Only)
  getAdminCodes: async () => {
    try {
      const response = await api.get('/admin/codes')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch admin codes')
    }
  },

  regenerateAdminCodes: async () => {
    try {
      const response = await api.post('/admin/codes/regenerate')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to regenerate admin codes')
    }
  }
}

export default adminService