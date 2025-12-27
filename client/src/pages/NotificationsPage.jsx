import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Mail, MessageSquare, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, AlertCircle, Check, X, CheckCheck } from 'lucide-react'
import { notificationService } from '../services/notificationService'
import { useNotifications } from '../contexts/NotificationContext'
import { useToast } from '../contexts/ToastContext'

const NotificationsPage = () => {
  const { success, error } = useToast()
  const { markAsRead, markAsUnread, markAllAsRead, refreshUnreadCount } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [expandedNotifications, setExpandedNotifications] = useState(new Set())
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'read'
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
  }, [filter, currentPage])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 20
      }
      
      if (filter === 'unread') {
        params.unreadOnly = 'true'
      }
      
      const response = await notificationService.getMyNotifications(params)
      
      if (response.success) {
        setNotifications(response.data.notifications)
        setTotalPages(response.data.totalPages)
        setUnreadCount(response.data.unreadCount)
      }
    } catch (err) {
      error(err.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId 
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      await refreshUnreadCount()
      success('Notification marked as read')
    } catch (err) {
      error(err.message || 'Failed to mark notification as read')
    }
  }

  const handleMarkAsUnread = async (notificationId) => {
    try {
      await markAsUnread(notificationId)
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId 
            ? { ...n, isRead: false, readAt: undefined }
            : n
        )
      )
      setUnreadCount(prev => prev + 1)
      await refreshUnreadCount()
      success('Notification marked as unread')
    } catch (err) {
      error(err.message || 'Failed to mark notification as unread')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      )
      setUnreadCount(0)
      await refreshUnreadCount()
      success('All notifications marked as read')
    } catch (err) {
      error(err.message || 'Failed to mark all notifications as read')
    }
  }

  const toggleExpanded = (notificationId) => {
    const newExpanded = new Set(expandedNotifications)
    if (newExpanded.has(notificationId)) {
      newExpanded.delete(notificationId)
    } else {
      newExpanded.add(notificationId)
    }
    setExpandedNotifications(newExpanded)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
    }
  }

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-3 w-3" />
      case 'sms':
        return <MessageSquare className="h-3 w-3" />
      default:
        return <Bell className="h-3 w-3" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatEventName = (event) => {
    return event
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Stay updated with your meal planning activities and system alerts
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'read', label: 'Read', count: notifications.length - unreadCount }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setFilter(tab.key)
                setCurrentPage(1)
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  filter === tab.key
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center py-12"
        >
          <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No notifications yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            You'll see notifications about meal plan generation, constraint updates, and system alerts here.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification, index) => {
            const isExpanded = expandedNotifications.has(notification._id)
            
            return (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border transition-all duration-200 ${
                  notification.isRead 
                    ? 'border-gray-200 dark:border-gray-700' 
                    : 'border-primary-200 dark:border-primary-800 bg-primary-50/30 dark:bg-primary-900/10'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.isRead 
                        ? 'bg-gray-100 dark:bg-gray-700' 
                        : 'bg-primary-100 dark:bg-primary-900/20'
                    }`}>
                      <Bell className={`h-5 w-5 ${
                        notification.isRead 
                          ? 'text-gray-600 dark:text-gray-400' 
                          : 'text-primary-600 dark:text-primary-400'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {formatEventName(notification.event)}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(notification.createdAt)}
                        {notification.readAt && (
                          <span className="ml-2">• Read {formatDate(notification.readAt)}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Read/Unread Toggle */}
                    <button
                      onClick={() => notification.isRead 
                        ? handleMarkAsUnread(notification._id) 
                        : handleMarkAsRead(notification._id)
                      }
                      className={`p-2 rounded-lg transition-colors ${
                        notification.isRead
                          ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                          : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      }`}
                      title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                    >
                      {notification.isRead ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </button>

                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                      {getStatusIcon(notification.status)}
                      <span className="capitalize">{notification.status}</span>
                    </span>
                  </div>
                </div>

                {/* Channel Status */}
                <div className="flex items-center space-x-4 mb-4">
                  {notification.channels.email && (
                    <div className="flex items-center space-x-1">
                      {getChannelIcon('email')}
                      <span className={`text-xs px-2 py-1 rounded ${
                        notification.channels.email.status === 'success'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-200'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-200'
                      }`}>
                        Email: {notification.channels.email.status}
                      </span>
                    </div>
                  )}
                  
                  {notification.channels.sms && (
                    <div className="flex items-center space-x-1">
                      {getChannelIcon('sms')}
                      <span className={`text-xs px-2 py-1 rounded ${
                        notification.channels.sms.status === 'success'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-200'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-200'
                      }`}>
                        SMS: {notification.channels.sms.status}
                      </span>
                    </div>
                  )}
                  
                  {notification.attempts > 1 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {notification.attempts} attempts
                    </span>
                  )}
                </div>

                {/* Error Message */}
                {notification.lastError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-200">
                      <strong>Error:</strong> {notification.lastError}
                    </p>
                  </div>
                )}

                {/* Sent At */}
                {notification.sentAt && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Sent:</strong> {formatDate(notification.sentAt)}
                    </p>
                  </div>
                )}

                {/* Expandable Payload */}
                <div>
                  <button
                    onClick={() => toggleExpanded(notification._id)}
                    className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  >
                    <span>View Details</span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden"
                    >
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Payload Data:
                      </h4>
                      <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(notification.payload, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex items-center justify-center space-x-2"
        >
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === i + 1
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </motion.div>
      )}

      {/* Auto Refresh Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Notifications are checked automatically every 30 seconds • Page {currentPage} of {totalPages}
        </p>
      </motion.div>
    </div>
  )
}

export default NotificationsPage