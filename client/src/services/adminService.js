import api from './api'
import { getAccessToken } from './api'

// HMAC signature generation for Flask API authentication
const generateHMACSignature = async (message) => {
  const secret = 'JOu0USVT1q5kN1wkclAttRKWA8LaxMzW' // Should match Flask INTERNAL_HMAC_SECRET
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(message)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
  const hashArray = Array.from(new Uint8Array(signature))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

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
      return response
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
      return response
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
      return response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch meals')
    }
  },

  getAllMealPlans: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const response = await api.get(`/admin/meal-plans?${queryParams}`)
      return response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch meal plans')
    }
  },

  getAllConstraints: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const response = await api.get(`/admin/constraints?${queryParams}`)
      return response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch constraints')
    }
  },

  getAllNotifications: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const response = await api.get(`/admin/notifications?${queryParams}`)
      return response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications')
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

  deleteMealPlan: async (mealPlanId) => {
    try {
      const response = await api.delete(`/admin/meal-plans/${mealPlanId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete meal plan')
    }
  },

  deleteConstraint: async (constraintId) => {
    try {
      const response = await api.delete(`/admin/constraints/${constraintId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete constraint')
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/admin/notifications/${notificationId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete notification')
    }
  },

  deleteFeedback: async (feedbackId) => {
    try {
      const response = await api.delete(`/admin/feedback/${feedbackId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete feedback')
    }
  },

  // Flask AI Service Integration
  getFlaskAnalytics: async (userId) => {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString()
      const body = JSON.stringify({ userId })
      const signature = await generateHMACSignature(timestamp + body)
      
      const response = await fetch('http://localhost:5000/analytics/internal/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-timestamp': timestamp,
          'x-signature': signature
        },
        body
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch Flask analytics')
    }
  },

  getFlaskDashboardStats: async () => {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString()
      const body = JSON.stringify({})
      const signature = await generateHMACSignature(timestamp + body)
      
      const response = await fetch('http://localhost:5000/analytics/internal/ai-dashboard-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-timestamp': timestamp,
          'x-signature': signature
        },
        body
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch Flask dashboard stats')
    }
  },

  // Get all Flask AI collections directly
  getAllFlaskAIHistory: async () => {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString()
      const body = '' // GET request has no body
      const signature = await generateHMACSignature(timestamp + body)
      
      const response = await fetch(`${import.meta.env.VITE_FLASK_API_URL}/api/admin/ai-history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-timestamp': timestamp,
          'x-signature': signature
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch Flask AI history')
    }
  },

  getAllFlaskHealthReports: async () => {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString()
      const body = '' // GET request has no body
      const signature = await generateHMACSignature(timestamp + body)
      
      const response = await fetch(`${import.meta.env.VITE_FLASK_API_URL}/api/admin/health-reports`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-timestamp': timestamp,
          'x-signature': signature
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch Flask health reports')
    }
  },

  getAllFlaskMealAnalysis: async () => {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString()
      const body = '' // GET request has no body
      const signature = await generateHMACSignature(timestamp + body)
      
      const response = await fetch(`${import.meta.env.VITE_FLASK_API_URL}/api/admin/meal-analysis`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-timestamp': timestamp,
          'x-signature': signature
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch Flask meal analysis')
    }
  },

  getAllFlaskWeeklyPlans: async () => {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString()
      const body = '' // GET request has no body
      const signature = await generateHMACSignature(timestamp + body)
      
      const response = await fetch(`${import.meta.env.VITE_FLASK_API_URL}/api/admin/weekly-plans`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-timestamp': timestamp,
          'x-signature': signature
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch Flask weekly plans')
    }
  },

  getAllFlaskUserContext: async () => {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString()
      const body = '' // GET request has no body
      const signature = await generateHMACSignature(timestamp + body)
      
      const response = await fetch(`${import.meta.env.VITE_FLASK_API_URL}/api/admin/user-context`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-timestamp': timestamp,
          'x-signature': signature
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch Flask user context')
    }
  },

  getAllFlaskChatHistory: async () => {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString()
      const body = '' // GET request has no body
      const signature = await generateHMACSignature(timestamp + body)
      
      const response = await fetch(`${import.meta.env.VITE_FLASK_API_URL}/api/admin/chat-history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-timestamp': timestamp,
          'x-signature': signature
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch Flask chat history')
    }
  },

  // Get aggregated Flask AI dashboard stats for all users
  getFlaskAggregatedStats: async () => {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString()
      const body = '' // GET request has no body
      const signature = await generateHMACSignature(timestamp + body)
      
      const response = await fetch(`${import.meta.env.VITE_FLASK_API_URL}/api/admin/dashboard-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-timestamp': timestamp,
          'x-signature': signature
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch Flask aggregated stats')
    }
  },

  // Delete Flask AI records
  deleteFlaskAIRecord: async (recordId, collection) => {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString()
      const body = JSON.stringify({ recordId, collection })
      const signature = await generateHMACSignature(timestamp + body)
      
      const response = await fetch(`${import.meta.env.VITE_FLASK_API_URL}/api/admin/delete-record`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-timestamp': timestamp,
          'x-signature': signature
        },
        body
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      throw new Error(error.message || 'Failed to delete Flask AI record')
    }
  },

  exportFlaskData: async (collection, format = 'excel') => {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString()
      const body = JSON.stringify({ collection, format })
      const signature = await generateHMACSignature(timestamp + body)
      
      const response = await fetch(`${import.meta.env.VITE_FLASK_API_URL}/api/admin/export-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-timestamp': timestamp,
          'x-signature': signature
        },
        body
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      if (format === 'excel') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `flask-${collection}-data-${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        return { success: true, message: `Flask ${collection} data exported successfully` }
      } else {
        return await response.json()
      }
    } catch (error) {
      throw new Error(error.message || `Failed to export Flask ${collection} data`)
    }
  },

  // Data Export
  exportData: async (type) => {
    try {
      // Use fetch directly to handle blob responses properly
      const token = getAccessToken()
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/admin/export/${type}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Export failed: ${errorText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      return { success: true, message: `${type} data exported successfully` }
    } catch (error) {
      throw new Error(error.message || `Failed to export ${type} data`)
    }
  },

  getAllFeedback: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const response = await api.get(`/admin/feedback?${queryParams}`)
      return response
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch feedback')
    }
  },

  // Admin Code Management (Super Admin Only)
  getAdminCodes: async () => {
    try {
      const response = await api.get('/admin/codes')
      return response
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