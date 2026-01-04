import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Calendar, TrendingUp, Clock, Filter } from 'lucide-react'
import { userService } from '../services/userService'
import { useToast } from '../contexts/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'

const ActivityPage = () => {
  const [activityData, setActivityData] = useState(null)
  const [activityStats, setActivityStats] = useState({
    totalActivities: 0,
    activeDays: 0,
    thisWeek: 0,
    lastActive: null
  })
  const [loading, setLoading] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [filter, setFilter] = useState('all') // all, today, week, month
  const { error: showError } = useToast()

  useEffect(() => {
    loadActivityData()
    fetchActivityStats()
  }, [filter])

  const fetchActivityStats = async () => {
    setIsLoadingStats(true)
    try {
      const response = await userService.getActivityStats()
      if (response.success) {
        setActivityStats(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch activity stats:', error)
      // Don't show error to user as this is not critical
    } finally {
      setIsLoadingStats(false)
    }
  }

  const loadActivityData = async () => {
    try {
      setLoading(true)
      const response = await userService.getActivityHistory()
      
      if (response.success) {
        let filteredData = response.data.activities || []
        
        // Apply filtering based on selected filter
        const now = new Date()
        
        switch (filter) {
          case 'today':
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            filteredData = filteredData.filter(activity => 
              new Date(activity.createdAt) >= today
            )
            break
            
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            filteredData = filteredData.filter(activity => 
              new Date(activity.createdAt) >= weekAgo
            )
            break
            
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            filteredData = filteredData.filter(activity => 
              new Date(activity.createdAt) >= monthAgo
            )
            break
            
          case 'all':
          default:
            // No filtering needed
            break
        }
        
        // Sort by date (newest first)
        filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        setActivityData({
          ...response.data,
          activities: filteredData
        })
      } else {
        showError(response.message || 'Failed to load activity data')
      }
    } catch (error) {
      showError(error.message || 'Failed to load activity data')
    } finally {
      setLoading(false)
    }
  }

  const filterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ]

  const getActivityIcon = (action) => {
    switch (action) {
      case 'LOGIN':
        return '🔐'
      case 'REGISTER':
        return '👤'
      case 'LOGOUT':
        return '🚪'
      case 'UPDATE_AVATAR':
        return '📷'
      case 'REFRESH_TOKEN':
        return '🔄'
      case 'REQUEST_PASSWORD_OTP':
        return '📧'
      case 'RESET_PASSWORD_OTP':
        return '🔑'
      default:
        return '📝'
    }
  }

  const getActivityColor = (action) => {
    switch (action) {
      case 'LOGIN':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
      case 'REGISTER':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
      case 'LOGOUT':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
      case 'UPDATE_AVATAR':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200'
      case 'REFRESH_TOKEN':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="Loading your activity..." />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Activity History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your SmartBite journey and progress
            </p>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 pr-8 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        {[
          {
            icon: Activity,
            label: 'Total Activities',
            value: isLoadingStats ? '...' : activityStats.totalActivities,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
          },
          {
            icon: Calendar,
            label: 'Active Days',
            value: isLoadingStats ? '...' : activityStats.activeDays,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20'
          },
          {
            icon: TrendingUp,
            label: 'This Week',
            value: isLoadingStats ? '...' : activityStats.thisWeek,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20'
          },
          {
            icon: Clock,
            label: 'Last Active',
            value: isLoadingStats ? '...' : (activityStats.lastActive ? new Date(activityStats.lastActive).toLocaleDateString() : 'N/A'),
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className={`${stat.bgColor} rounded-2xl p-6 border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Activity Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Recent Activities
        </h3>

        {activityData?.activityHistory && activityData.activityHistory.length > 0 ? (
          <div className="space-y-4">
            {activityData.activityHistory.map((activity, index) => (
              <motion.div
                key={activity._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                {/* Activity Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-600">
                    <span className="text-lg">
                      {getActivityIcon(activity.action)}
                    </span>
                  </div>
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.action?.replace('_', ' ').toUpperCase() || 'ACTIVITY'}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActivityColor(activity.action)}`}>
                      {activity.action?.replace('_', ' ').toUpperCase() || 'ACTIVITY'}
                    </span>
                  </div>
                  
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {Object.entries(activity.metadata).map(([key, value]) => (
                        <span key={key} className="mr-2">
                          {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                        </span>
                      ))}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {new Date(activity.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Activities Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start using SmartBite to see your activity history here.
            </p>
          </div>
        )}
      </motion.div>

      {/* Activity Summary by Type */}
      {activityData?.activityByType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Activity Breakdown
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(activityData.activityByType).map(([type, count]) => (
              <div key={type} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="text-2xl mb-2">
                  {getActivityIcon(type)}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {count}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {type.replace('_', ' ')}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ActivityPage