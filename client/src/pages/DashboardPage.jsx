import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Activity, 
  Target, 
  Calendar, 
  TrendingUp, 
  Database,
  UtensilsCrossed,
  ChefHat,
  MessageSquare,
  Brain,
  BarChart3,
  Clock,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Info,
  Download,
  History,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { analyticsService } from '../services/analyticsService'
import { useToast } from '../contexts/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'

const DashboardPage = () => {
  const { user, fetchMe } = useAuth()
  const { success: showSuccess, error: showError } = useToast()
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showExportDropdown, setShowExportDropdown] = useState(false)

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.export-dropdown')) {
        setShowExportDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportDropdown])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Fetch latest user data
      await fetchMe()
      
      // Fetch comprehensive analytics data from new analytics service
      const response = await analyticsService.getAnalytics()
      setAnalyticsData(response.data)
      
    } catch (error) {
      showError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const exportAllData = async (format = 'json') => {
    try {
      setShowExportDropdown(false)
      await analyticsService.exportUserData(format)
      showSuccess(`Data exported successfully as ${format.toUpperCase()}`)
    } catch (error) {
      showError('Failed to export data')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="Loading your analytics dashboard..." />
      </div>
    )
  }

  // Data Statistics Cards
  const dataStats = [
    {
      icon: UtensilsCrossed,
      label: 'Total Meals',
      value: analyticsData?.counts?.totalMeals || 0,
      description: 'Meals in your plans',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      trend: '+12% this month'
    },
    {
      icon: Calendar,
      label: 'Meal Plans',
      value: analyticsData?.counts?.totalMealPlans || 0,
      description: 'Created meal plans',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      trend: 'Active plans'
    },
    {
      icon: Brain,
      label: 'AI Interactions',
      value: analyticsData?.counts?.totalAiInteractions || 0,
      description: 'AI conversations & analyses',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      trend: 'Smart insights'
    },
    {
      icon: MessageSquare,
      label: 'Feedback Given',
      value: analyticsData?.counts?.totalFeedbacks || 0,
      description: 'Meal ratings & reviews',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      trend: 'Community contribution'
    }
  ]

  // Storage & Usage Statistics
  const storageStats = [
    {
      icon: Database,
      label: 'Data Storage',
      value: `${Math.round((analyticsData?.flaskAnalytics?.storageStats?.totalSizeKB || 0) + 50)} KB`,
      description: 'Total data stored',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
      icon: Clock,
      label: 'Account Age',
      value: `${analyticsData?.statistics?.accountAge || 0} days`,
      description: 'Member since',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20'
    },
    {
      icon: Activity,
      label: 'Active Days',
      value: analyticsData?.statistics?.activeDays || 0,
      description: 'Days with activity',
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      icon: TrendingUp,
      label: 'Growth Rate',
      value: '15%',
      description: 'Monthly progress',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    }
  ]

  // Recent Activity Summary
  const activitySummary = [
    {
      icon: ChefHat,
      title: 'Latest Meal Plan',
      description: analyticsData?.recent?.latestMealPlan?.title || 'No meal plans yet',
      time: analyticsData?.recent?.latestMealPlan?.createdAt ? new Date(analyticsData.recent.latestMealPlan.createdAt).toLocaleDateString() : 'N/A',
      status: 'success'
    },
    {
      icon: Brain,
      title: 'Recent AI Activity',
      description: analyticsData?.flaskAnalytics?.recentActivity?.[0]?.action || 'No AI interactions yet',
      time: analyticsData?.flaskAnalytics?.recentActivity?.[0]?.timestamp ? new Date(analyticsData.flaskAnalytics.recentActivity[0].timestamp).toLocaleDateString() : 'N/A',
      status: 'info'
    },
    {
      icon: Target,
      title: 'Latest Feedback',
      description: analyticsData?.recent?.latestFeedback ? `${analyticsData.recent.latestFeedback.rating}/5 stars` : 'No feedback yet',
      time: analyticsData?.recent?.latestFeedback?.createdAt ? new Date(analyticsData.recent.latestFeedback.createdAt).toLocaleDateString() : 'N/A',
      status: 'warning'
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
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
              Analytics Dashboard 📊
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete overview of your SmartBite data and usage statistics
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative export-dropdown">
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Data</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showExportDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="py-2">
                    <button
                      onClick={() => exportAllData('json')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <span className="text-lg">📄</span>
                      <div>
                        <div className="font-medium">Export as JSON</div>
                        <div className="text-xs text-gray-500">Structured data format</div>
                      </div>
                    </button>
                    <button
                      onClick={() => exportAllData('excel')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <span className="text-lg">📊</span>
                      <div>
                        <div className="font-medium">Export as Excel</div>
                        <div className="text-xs text-gray-500">Spreadsheet format</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-xl">
              <CheckCircle className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data Statistics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Your Data Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dataStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className={`${stat.bgColor} rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                  {stat.trend}
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Storage & Usage Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <HardDrive className="h-5 w-5 mr-2" />
          Storage & Usage Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {storageStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className={`${stat.bgColor} rounded-2xl p-6 border border-gray-200 dark:border-gray-700`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Account Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Account Information
          </h3>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-white" />
              )}
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                {user?.fullName || user?.name || 'User'}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                {user?.isVerified ? (
                  <span className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verified Account
                  </span>
                ) : (
                  <span className="flex items-center text-yellow-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Pending Verification
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Member Since</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Last Active</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : 'Today'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Plan Type</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Free Plan
              </p>
            </div>
          </div>
        </motion.div>

        {/* Data Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Data Breakdown
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <UtensilsCrossed className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Meals Data</span>
              </div>
              <span className="text-sm font-bold text-blue-600">
                {analyticsData?.counts?.totalMeals || 0} items
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <Brain className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">AI Data</span>
              </div>
              <span className="text-sm font-bold text-purple-600">
                {analyticsData?.flaskAnalytics?.dataBreakdown?.totalDocuments || 0} records
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Profile Data</span>
              </div>
              <span className="text-sm font-bold text-green-600">
                1 profile
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Feedback Data</span>
              </div>
              <span className="text-sm font-bold text-orange-600">
                {analyticsData?.counts?.totalFeedbacks || 0} reviews
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <History className="h-5 w-5 mr-2" />
          Recent Activity Summary
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {activitySummary.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className={`p-2 rounded-lg ${
                activity.status === 'success' ? 'bg-green-100 dark:bg-green-900/20' :
                activity.status === 'info' ? 'bg-blue-100 dark:bg-blue-900/20' :
                'bg-yellow-100 dark:bg-yellow-900/20'
              }`}>
                <activity.icon className={`h-5 w-5 ${
                  activity.status === 'success' ? 'text-green-600' :
                  activity.status === 'info' ? 'text-blue-600' :
                  'text-yellow-600'
                }`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  {activity.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Data Export & Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Data Management
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You have stored {Math.round((analyticsData?.flaskAnalytics?.storageStats?.totalSizeKB || 0) + 50)} KB of data across {dataStats.reduce((sum, stat) => sum + stat.value, 0)} items.
              Your data includes meal plans, AI interactions, feedback, and profile information. All data is securely stored and can be exported or deleted at any time.
            </p>
          </div>
          <div className="flex space-x-3">
            <div className="relative export-dropdown">
              <button 
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                <span>Export Data</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showExportDropdown && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="py-2">
                    <button
                      onClick={() => exportAllData('json')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <span className="text-lg">📄</span>
                      <div>
                        <div className="font-medium">Export as JSON</div>
                        <div className="text-xs text-gray-500">Structured data format</div>
                      </div>
                    </button>
                    <button
                      onClick={() => exportAllData('excel')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <span className="text-lg">📊</span>
                      <div>
                        <div className="font-medium">Export as Excel</div>
                        <div className="text-xs text-gray-500">Spreadsheet format</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
              Manage Data
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default DashboardPage
