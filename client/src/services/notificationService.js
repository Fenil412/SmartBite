import api from './api.js'

export const notificationService = {
  // Get my notifications with pagination and filters
  getMyNotifications: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return await api.get(`/notifications${queryParams ? `?${queryParams}` : ''}`)
  },

  // Get unread count
  getUnreadCount: async () => {
    return await api.get('/notifications/unread-count')
  },

  // Get latest notifications (for real-time updates)
  getLatestNotifications: async (since) => {
    const params = since ? `?since=${since}` : ''
    return await api.get(`/notifications/latest${params}`)
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    return await api.patch(`/notifications/${notificationId}/read`)
  },

  // Mark notification as unread
  markAsUnread: async (notificationId) => {
    return await api.patch(`/notifications/${notificationId}/unread`)
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return await api.patch('/notifications/mark-all-read')
  }
}