import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { notificationService } from '../services/notificationService'
import { useToast } from './ToastContext'
import { useAuth } from './AuthContext'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const { info } = useToast()
  const [unreadCount, setUnreadCount] = useState(0)
  const [latestNotifications, setLatestNotifications] = useState([])
  const [lastChecked, setLastChecked] = useState(new Date().toISOString())

  // Load initial unread count
  const loadUnreadCount = useCallback(async () => {
    if (!user) return
    
    try {
      const response = await notificationService.getUnreadCount()
      if (response.success) {
        setUnreadCount(response.data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to load unread count:', error)
    }
  }, [user])

  // Check for new notifications
  const checkForNewNotifications = useCallback(async () => {
    if (!user) return

    try {
      const response = await notificationService.getLatestNotifications(lastChecked)
      if (response.success && response.data.notifications.length > 0) {
        const newNotifications = response.data.notifications
        
        // Show toast for new notifications
        newNotifications.forEach(notification => {
          const eventName = notification.event
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
          
          info(`New notification: ${eventName}`, {
            duration: 5000,
            action: {
              label: 'View',
              onClick: () => window.location.href = '/dashboard/notifications'
            }
          })
        })

        // Update state
        setLatestNotifications(prev => [...newNotifications, ...prev].slice(0, 10))
        setUnreadCount(prev => prev + newNotifications.length)
        setLastChecked(new Date().toISOString())
      }
    } catch (error) {
      console.error('Failed to check for new notifications:', error)
    }
  }, [user, lastChecked, info])

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await notificationService.markAsRead(notificationId)
      if (response.success) {
        setUnreadCount(prev => Math.max(0, prev - 1))
        return response.data.notification
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  }

  // Mark notification as unread
  const markAsUnread = async (notificationId) => {
    try {
      const response = await notificationService.markAsUnread(notificationId)
      if (response.success) {
        setUnreadCount(prev => prev + 1)
        return response.data.notification
      }
    } catch (error) {
      console.error('Failed to mark notification as unread:', error)
      throw error
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead()
      if (response.success) {
        setUnreadCount(0)
        return response
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw error
    }
  }

  // Initialize and set up polling
  useEffect(() => {
    if (user) {
      loadUnreadCount()
      
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(checkForNewNotifications, 30000)
      
      return () => clearInterval(interval)
    }
  }, [user, loadUnreadCount, checkForNewNotifications])

  // Reset state when user logs out
  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      setLatestNotifications([])
      setLastChecked(new Date().toISOString())
    }
  }, [user])

  const value = {
    unreadCount,
    latestNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    refreshUnreadCount: loadUnreadCount,
    checkForNewNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}