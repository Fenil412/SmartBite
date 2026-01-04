import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import adminService from '../../services/adminService'
import { useToast } from '../../contexts/ToastContext'
import { getAccessToken } from '../../services/api'
import {
  Users,
  ChefHat,
  MessageSquare,
  TrendingUp,
  Activity,
  Shield,
  Database,
  Server,
  AlertTriangle,
  Eye,
  UserCheck,
  UserX,
  Trash2,
  Download,
  RefreshCw,
  Calendar,
  Settings,
  Bell
} from 'lucide-react'
import { motion } from 'framer-motion'
import '../../styles/admin-responsive.css'

// Admin Codes Management Component
const AdminCodesTab = () => {
  const [adminCodes, setAdminCodes] = useState(null)
  const [loading, setLoading] = useState(false)
  const { success, error: showError } = useToast()

  const loadAdminCodes = async () => {
    try {
      setLoading(true)
      const response = await adminService.getAdminCodes()
      
      // Handle different possible response structures
      let codesData = null
      
      if (response?.data) {
        codesData = response.data
      } else if (response?.adminCode || response?.superAdminCode) {
        codesData = response
      } else {
        // Unexpected response structure - using fallback
        codesData = { adminCode: 'Loading...', superAdminCode: 'Loading...' }
      }
      
      setAdminCodes(codesData)
    } catch (error) {
      console.error('Admin codes error:', error)
      showError(error?.response?.data?.message || error?.message || 'Failed to load admin codes')
      // Set fallback data to prevent UI errors
      setAdminCodes({ adminCode: 'Error loading code', superAdminCode: 'Error loading code' })
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateCode = async () => {
    // Enhanced confirmation dialog
    const confirmMessage = `🚨 SECURITY WARNING 🚨\n\n` +
      `You are about to regenerate admin registration codes.\n\n` +
      `This action will:\n` +
      `• Invalidate ALL existing admin codes\n` +
      `• Generate new codes that must be updated in your .env file\n` +
      `• Require server restart for changes to take effect\n` +
      `• Potentially lock out users trying to register with old codes\n\n` +
      `Are you absolutely sure you want to continue?`
    
    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      setLoading(true)
      const response = await adminService.regenerateAdminCodes()
      
      // Handle different possible response structures
      let newAdminCode, newSuperAdminCode
      
      if (response?.data?.newAdminCode && response?.data?.newSuperAdminCode) {
        // Standard response structure
        newAdminCode = response.data.newAdminCode
        newSuperAdminCode = response.data.newSuperAdminCode
      } else if (response?.newAdminCode && response?.newSuperAdminCode) {
        // Direct response structure
        newAdminCode = response.newAdminCode
        newSuperAdminCode = response.newSuperAdminCode
      } else if (response?.data?.adminCode && response?.data?.superAdminCode) {
        // Alternative naming
        newAdminCode = response.data.adminCode
        newSuperAdminCode = response.data.superAdminCode
      } else if (response?.adminCode && response?.superAdminCode) {
        // Direct alternative naming
        newAdminCode = response.adminCode
        newSuperAdminCode = response.superAdminCode
      } else if (response?.data?.admin_code && response?.data?.super_admin_code) {
        // Snake case naming
        newAdminCode = response.data.admin_code
        newSuperAdminCode = response.data.super_admin_code
      } else {
        // Fallback - show success but no codes
        success('Admin codes regenerated successfully')
        showError('New codes were generated but could not be displayed. Please check your server logs or .env file.')
        loadAdminCodes()
        return
      }
      
      success('Admin codes regenerated successfully')
      
      // Show the new codes in a more user-friendly way
      const alertMessage = `🔑 New Admin Codes Generated Successfully!\n\n` +
        `📋 Admin Registration Code:\n${newAdminCode}\n\n` +
        `🔐 Super Admin Registration Code:\n${newSuperAdminCode}\n\n` +
        `⚠️ IMPORTANT NEXT STEPS:\n` +
        `1. Copy these codes to a secure location\n` +
        `2. Update your .env file:\n` +
        `   ADMIN_REGISTRATION_CODE=${newAdminCode}\n` +
        `   SUPER_ADMIN_REGISTRATION_CODE=${newSuperAdminCode}\n` +
        `3. Restart your server\n` +
        `4. Share codes securely with authorized personnel\n` +
        `5. Old codes are now permanently invalid`
      
      alert(alertMessage)
      
      // Reload the codes to show updated values
      await loadAdminCodes()
    } catch (error) {
      console.error('Regenerate admin codes error:', error)
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Failed to regenerate admin codes. Please try again.'
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminCodes()
  }, [])

  if (loading && !adminCodes) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 lg:p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Security Notice
            </h4>
            <p className="text-xs lg:text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Admin registration codes are sensitive. Only share them with trusted individuals who need admin access.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Shield className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-blue-600 flex-shrink-0" />
            Current Admin Codes
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Admin Registration Code
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 font-mono text-xs lg:text-sm break-all">
                {adminCodes?.adminCode || 'Loading...'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Grants admin privileges to new users
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Super Admin Registration Code
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 font-mono text-xs lg:text-sm break-all">
                {adminCodes?.superAdminCode || 'Loading...'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Grants super admin privileges to new users
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <RefreshCw className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-green-600 flex-shrink-0" />
            Code Management
          </h3>
          
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 lg:p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Current Environment Codes
              </h4>
              <p className="text-xs lg:text-sm text-blue-800 dark:text-blue-200">
                The codes shown above are currently active in your environment variables.
              </p>
            </div>

            <button
              onClick={handleRegenerateCode}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Generating...' : 'Regenerate Codes'}</span>
            </button>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 lg:p-4">
              <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                ⚠️ Important Notes
              </h4>
              <ul className="text-xs lg:text-sm text-red-800 dark:text-red-200 space-y-1">
                <li>• Regenerating codes will invalidate existing codes</li>
                <li>• You must update your .env file manually</li>
                <li>• Server restart is required for changes to take effect</li>
                <li>• Inform other admins about the new codes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How to Use Admin Registration Codes
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm lg:text-base">For New Admin Registration:</h4>
            <ol className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>1. Go to the signup page</li>
              <li>2. Select "Administrator" as account type</li>
              <li>3. Enter the admin registration code</li>
              <li>4. Complete the registration process</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm lg:text-base">Code Security:</h4>
            <ul className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Only share codes with trusted individuals</li>
              <li>• Regenerate codes if compromised</li>
              <li>• Monitor admin registrations regularly</li>
              <li>• Keep codes confidential and secure</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  
  const [stats, setStats] = useState(null)
  const [systemInfo, setSystemInfo] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [users, setUsers] = useState([])
  const [meals, setMeals] = useState([])
  const [mealPlans, setMealPlans] = useState([])
  const [constraints, setConstraints] = useState([])
  const [notifications, setNotifications] = useState([])
  const [feedback, setFeedback] = useState([])
  const [aiHistory, setAiHistory] = useState([])
  const [userContext, setUserContext] = useState([])
  const [mealAnalysis, setMealAnalysis] = useState([])
  const [healthReports, setHealthReports] = useState([])
  const [weeklyPlans, setWeeklyPlans] = useState([])
  const [chatHistory, setChatHistory] = useState([])
  const [flaskStats, setFlaskStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [userFilter, setUserFilter] = useState('all')
  const [mealFilter, setMealFilter] = useState('all')

  useEffect(() => {
    // Check if user is admin
    if (!user?.roles?.includes('admin') && !user?.roles?.includes('super_admin')) {
      navigate('/')
      return
    }

    if (!getAccessToken()) {
      navigate('/login')
      return
    }

    loadDashboardData()
  }, [user, navigate])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load dashboard stats
      const statsResponse = await adminService.getDashboardStats()
      setStats(statsResponse.data)

      // Load system info (only for super admins)
      if (user?.roles?.includes('super_admin')) {
        try {
          const systemResponse = await adminService.getSystemInfo()
          setSystemInfo(systemResponse.data)
        } catch (err) {
          console.error('Failed to load system info:', err)
        }
      }

      // Load recent activity
      try {
        const activityResponse = await adminService.getRecentActivity(20)
        // Handle API response structure
        if (activityResponse.data?.activities) {
          setRecentActivity(activityResponse.data.activities)
        } else if (Array.isArray(activityResponse.data)) {
          setRecentActivity(activityResponse.data)
        } else {
          setRecentActivity([])
        }
      } catch (err) {
        console.warn('Failed to load recent activity:', err)
        setRecentActivity([])
      }

      // Load Flask AI data
      try {
        await loadFlaskData()
      } catch (err) {
        console.warn('Failed to load Flask AI data:', err)
      }

    } catch (error) {
      console.error('Dashboard loading error:', error);
      showError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadUsersData = async () => {
    try {
      const usersResponse = await adminService.getAllUsers()
      
      // Handle API response structure: { success: true, data: { users: [...] } }
      let usersData = [];
      if (usersResponse?.data?.users) {
        usersData = usersResponse.data.users;
      } else if (Array.isArray(usersResponse?.data)) {
        usersData = usersResponse.data;
      } else {
        usersData = [];
      }
      
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load users:', err)
      showError('Failed to load users: ' + err.message)
      setUsers([])
    }
  }

  const loadMealPlansData = async () => {
    try {
      const mealPlansResponse = await adminService.getAllMealPlans()
      
      // Handle API response structure: { success: true, data: { mealPlans: [...] } }
      let mealPlansData = [];
      if (mealPlansResponse?.data?.mealPlans) {
        mealPlansData = mealPlansResponse.data.mealPlans;
      } else if (Array.isArray(mealPlansResponse?.data)) {
        mealPlansData = mealPlansResponse.data;
      } else {
        mealPlansData = [];
      }
      
      setMealPlans(mealPlansData);
    } catch (err) {
      console.error('Failed to load meal plans:', err)
      showError('Failed to load meal plans: ' + err.message)
      setMealPlans([])
    }
  }

  const loadConstraintsData = async () => {
    try {
      const constraintsResponse = await adminService.getAllConstraints()
      
      // Handle API response structure: { success: true, data: { constraints: [...] } }
      let constraintsData = [];
      if (constraintsResponse?.data?.constraints) {
        constraintsData = constraintsResponse.data.constraints;
      } else if (Array.isArray(constraintsResponse?.data)) {
        constraintsData = constraintsResponse.data;
      } else {
        constraintsData = [];
      }
      
      setConstraints(constraintsData);
    } catch (err) {
      console.error('Failed to load constraints:', err)
      showError('Failed to load constraints: ' + err.message)
      setConstraints([])
    }
  }

  const loadNotificationsData = async () => {
    try {
      const notificationsResponse = await adminService.getAllNotifications()
      
      // Handle API response structure: { success: true, data: { notifications: [...] } }
      let notificationsData = [];
      if (notificationsResponse?.data?.notifications) {
        notificationsData = notificationsResponse.data.notifications;
      } else if (Array.isArray(notificationsResponse?.data)) {
        notificationsData = notificationsResponse.data;
      } else {
        notificationsData = [];
      }
      
      setNotifications(notificationsData);
    } catch (err) {
      console.error('Failed to load notifications:', err)
      showError('Failed to load notifications: ' + err.message)
      setNotifications([])
    }
  }

  const loadFeedbackData = async () => {
    try {
      const feedbackResponse = await adminService.getAllFeedback()
      
      // Handle API response structure: { success: true, data: { feedback: [...] } }
      let feedbackData = [];
      if (feedbackResponse?.data?.feedback) {
        feedbackData = feedbackResponse.data.feedback;
      } else if (Array.isArray(feedbackResponse?.data)) {
        feedbackData = feedbackResponse.data;
      } else {
        feedbackData = [];
      }
      
      setFeedback(feedbackData);
    } catch (err) {
      console.error('Failed to load feedback:', err)
      showError('Failed to load feedback: ' + err.message)
      setFeedback([])
    }
  }

  const loadFlaskData = async () => {
    try {
      // Load Flask aggregated dashboard stats for all users
      const flaskStatsResponse = await adminService.getFlaskAggregatedStats()
      setFlaskStats(flaskStatsResponse.data)
      
    } catch (err) {
      // Flask data loading failed
      // Set default empty stats if Flask is not available
      setFlaskStats({
        aiInteractions: { total: 0, byType: {}, last7Days: 0, last30Days: 0 },
        chatActivity: { totalMessages: 0, averageLength: 0 },
        weeklyPlans: { total: 0 },
        healthReports: { total: 0 },
        userContext: { total: 0 }
      })
    }
  }

  const loadFlaskAIHistoryData = async () => {
    try {
      // Load all Flask AI collections directly
      
      // Load all Flask AI collections directly
      const [aiHistoryResponse, healthReportsResponse, mealAnalysisResponse, weeklyPlansResponse, userContextResponse, chatHistoryResponse] = await Promise.allSettled([
        adminService.getAllFlaskAIHistory(),
        adminService.getAllFlaskHealthReports(),
        adminService.getAllFlaskMealAnalysis(),
        adminService.getAllFlaskWeeklyPlans(),
        adminService.getAllFlaskUserContext(),
        adminService.getAllFlaskChatHistory()
      ])
      
      // Set all Flask AI data with error handling
      setAiHistory(aiHistoryResponse.status === 'fulfilled' ? aiHistoryResponse.value.data || [] : [])
      setHealthReports(healthReportsResponse.status === 'fulfilled' ? healthReportsResponse.value.data || [] : [])
      setMealAnalysis(mealAnalysisResponse.status === 'fulfilled' ? mealAnalysisResponse.value.data || [] : [])
      setWeeklyPlans(weeklyPlansResponse.status === 'fulfilled' ? weeklyPlansResponse.value.data || [] : [])
      setUserContext(userContextResponse.status === 'fulfilled' ? userContextResponse.value.data || [] : [])
      setChatHistory(chatHistoryResponse.status === 'fulfilled' ? chatHistoryResponse.value.data || [] : [])
      
      // Check if any requests failed
      const failedRequests = [aiHistoryResponse, healthReportsResponse, mealAnalysisResponse, weeklyPlansResponse, userContextResponse, chatHistoryResponse]
        .filter(response => response.status === 'rejected')
      
      if (failedRequests.length > 0) {
        // Some Flask AI collection requests failed
        showError(`Some Flask AI data could not be loaded. Flask service may be unavailable.`)
      } else {
        // All Flask AI collections loaded successfully
      }
      
    } catch (error) {
      // Flask AI data loading failed
      showError('Failed to load Flask AI data. Please ensure Flask service is running on port 5000.')
      // Set empty arrays as fallback
      setAiHistory([])
      setHealthReports([])
      setMealAnalysis([])
      setWeeklyPlans([])
      setUserContext([])
      setChatHistory([])
    }
  }

  const loadMealsData = async () => {
    try {
      const mealsResponse = await adminService.getAllMeals()
      
      // Handle API response structure: { success: true, data: { meals: [...] } }
      let mealsData = [];
      if (mealsResponse?.data?.meals) {
        mealsData = mealsResponse.data.meals;
      } else if (Array.isArray(mealsResponse?.data)) {
        mealsData = mealsResponse.data;
      } else {
        mealsData = [];
      }
      
      setMeals(mealsData);
    } catch (err) {
      console.error('Failed to load meals:', err)
      showError('Failed to load meals: ' + err.message)
      setMeals([])
    }
  }

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleUserAction = async (userId, action) => {
    try {
      switch (action) {
        case 'activate':
          await adminService.updateUserStatus(userId, 'active')
          success('User activated successfully')
          break
        case 'deactivate':
          await adminService.updateUserStatus(userId, 'inactive')
          success('User deactivated successfully')
          break
        case 'delete':
          if (window.confirm('Are you sure you want to delete this user?')) {
            await adminService.deleteUser(userId)
            success('User deleted successfully')
          }
          break
        default:
          return
      }
      
      // Reload users data
      await loadUsersData()
    } catch (error) {
      showError(error.message)
    }
  }

  const handleMealAction = async (mealId, action) => {
    try {
      switch (action) {
        case 'approve':
          await adminService.updateMealStatus(mealId, 'approved')
          success('Meal approved successfully')
          break
        case 'reject':
          await adminService.updateMealStatus(mealId, 'rejected')
          success('Meal rejected successfully')
          break
        case 'delete':
          if (window.confirm('Are you sure you want to delete this meal?')) {
            await adminService.deleteMeal(mealId)
            success('Meal deleted successfully')
          }
          break
        default:
          return
      }
      
      // Reload meals data
      await loadMealsData()
    } catch (error) {
      console.error('Meal action error:', error);
      showError(error.message)
    }
  }

  const exportData = async (type) => {
    try {
      await adminService.exportData(type)
      success(`${type} data exported successfully`)
    } catch (error) {
      showError(`Failed to export ${type} data: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 stat-card-responsive responsive-card"
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400 truncate-mobile">{title}</p>
          <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change !== undefined && change !== null && (
            <p className={`text-xs lg:text-sm flex items-center ${
              change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
            }`}>
              <span className="hidden sm:inline">
                {change > 0 ? '↗' : change < 0 ? '↘' : '→'} {change > 0 ? '+' : ''}{change}% vs last week
              </span>
              <span className="sm:hidden">
                {change > 0 ? '+' : ''}{change}%
              </span>
            </p>
          )}
        </div>
        <div className={`p-2 lg:p-3 rounded-full ${color} flex-shrink-0`}>
          <Icon className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
        </div>
      </div>
    </motion.div>
  )

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => {
        setActiveTab(id)
        // Load data when switching to tabs
        if (id === 'users') {
          loadUsersData()
        } else if (id === 'meals') {
          loadMealsData()
        } else if (id === 'meal-plans') {
          loadMealPlansData()
        } else if (id === 'constraints') {
          loadConstraintsData()
        } else if (id === 'notifications') {
          loadNotificationsData()
        } else if (id === 'feedback') {
          loadFeedbackData()
        } else if (id === 'ai-history') {
          loadFlaskAIHistoryData()
        } else if (id === 'health-reports') {
          loadFlaskAIHistoryData()
        } else if (id === 'meal-analysis') {
          loadFlaskAIHistoryData()
        } else if (id === 'weekly-plans-ai') {
          loadFlaskAIHistoryData()
        } else if (id === 'chat-history') {
          loadFlaskAIHistoryData()
        } else if (id === 'user-context') {
          loadFlaskAIHistoryData()
        }
      }}
      className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap touch-target focus-visible-enhanced ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
    >
      <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
      <span className="hidden sm:inline truncate">{label}</span>
      <span className="sm:hidden truncate">{label.split(' ')[0]}</span>
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 safe-area-inset">
      <div className="container-responsive admin-scrollbar">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
                Manage users, content, and system settings
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={loadDashboardData}
                className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm touch-target"
                title="Refresh Dashboard"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-4 sm:mb-6 space-y-responsive">
          {/* Mobile Tab Selector */}
          <div className="block sm:hidden mobile-nav-select">
            <select
              value={activeTab}
              onChange={(e) => {
                const tabId = e.target.value
                setActiveTab(tabId)
                // Load data when switching to tabs (same logic as before)
                if (tabId === 'users') {
                  loadUsersData()
                } else if (tabId === 'meals') {
                  loadMealsData()
                } else if (tabId === 'meal-plans') {
                  loadMealPlansData()
                } else if (tabId === 'constraints') {
                  loadConstraintsData()
                } else if (tabId === 'notifications') {
                  loadNotificationsData()
                } else if (tabId === 'feedback') {
                  loadFeedbackData()
                } else if (tabId === 'ai-history') {
                  loadFlaskAIHistoryData()
                } else if (tabId === 'health-reports') {
                  loadFlaskAIHistoryData()
                } else if (tabId === 'meal-analysis') {
                  loadFlaskAIHistoryData()
                } else if (tabId === 'weekly-plans-ai') {
                  loadFlaskAIHistoryData()
                } else if (tabId === 'chat-history') {
                  loadFlaskAIHistoryData()
                } else if (tabId === 'user-context') {
                  loadFlaskAIHistoryData()
                }
              }}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus-visible-enhanced text-sm"
            >
              <option value="overview">📊 Overview</option>
              <option value="users">👥 User Management</option>
              <option value="meals">🍽️ Meal Management</option>
              <option value="meal-plans">📅 Meal Plans</option>
              <option value="constraints">⚙️ Constraints</option>
              <option value="notifications">🔔 Notifications</option>
              <option value="feedback">💬 Feedback</option>
              <option value="ai-history">🤖 AI History</option>
              <option value="health-reports">🛡️ Health Reports</option>
              <option value="meal-analysis">🍽️ Meal Analysis</option>
              <option value="weekly-plans-ai">📅 AI Weekly Plans</option>
              <option value="chat-history">💬 AI Chat</option>
              <option value="user-context">👥 User Context</option>
              <option value="activity">📈 Activity Log</option>
              {user?.roles?.includes('super_admin') && (
                <>
                  <option value="system">🖥️ System Info</option>
                  <option value="codes">🛡️ Admin Codes</option>
                </>
              )}
            </select>
          </div>

          {/* Desktop/Tablet Tab Buttons */}
          <div className="hidden sm:block">
            <div className="flex flex-wrap gap-1 lg:gap-2 overflow-x-auto pb-2 admin-scrollbar">
              <TabButton id="overview" label="Overview" icon={TrendingUp} />
              <TabButton id="users" label="User Management" icon={Users} />
              <TabButton id="meals" label="Meal Management" icon={ChefHat} />
              <TabButton id="meal-plans" label="Meal Plans" icon={Calendar} />
              <TabButton id="constraints" label="Constraints" icon={Settings} />
              <TabButton id="notifications" label="Notifications" icon={Bell} />
              <TabButton id="feedback" label="Feedback" icon={MessageSquare} />
              <TabButton id="ai-history" label="AI History" icon={Activity} />
              <TabButton id="health-reports" label="Health Reports" icon={Shield} />
              <TabButton id="meal-analysis" label="Meal Analysis" icon={ChefHat} />
              <TabButton id="weekly-plans-ai" label="AI Weekly Plans" icon={Calendar} />
              <TabButton id="chat-history" label="AI Chat" icon={MessageSquare} />
              <TabButton id="user-context" label="User Context" icon={Users} />
              <TabButton id="activity" label="Activity Log" icon={Activity} />
              {user?.roles?.includes('super_admin') && (
                <>
                  <TabButton id="system" label="System Info" icon={Server} />
                  <TabButton id="codes" label="Admin Codes" icon={Shield} />
                </>
              )}
            </div>
          </div>
        </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4 lg:space-y-6">
          {/* Stats Grid - 4x4 Layout */}
          <div className="stats-grid-4x4">
            {/* First Row - 4 Cards */}
            <StatCard
              title="Total Users"
              value={stats?.users?.total || 0}
              icon={Users}
              color="bg-blue-500"
              change={stats?.users?.newThisMonth}
            />
            <StatCard
              title="Total Meals"
              value={stats?.meals?.total || 0}
              icon={ChefHat}
              color="bg-green-500"
              change={stats?.meals?.weeklyChange}
            />
            <StatCard
              title="Meal Plans"
              value={stats?.mealPlans?.total || 0}
              icon={Calendar}
              color="bg-purple-500"
              change={stats?.mealPlans?.weeklyChange}
            />
            <StatCard
              title="Constraints"
              value={stats?.constraints?.total || 0}
              icon={Settings}
              color="bg-indigo-500"
              change={stats?.constraints?.weeklyChange}
            />
            
            {/* Second Row - 4 Cards */}
            <StatCard
              title="Notifications"
              value={stats?.notifications?.total || 0}
              icon={Bell}
              color="bg-yellow-500"
              change={stats?.notifications?.weeklyChange}
            />
            <StatCard
              title="Feedback Count"
              value={stats?.feedback?.total || 0}
              icon={MessageSquare}
              color="bg-orange-500"
              change={stats?.feedback?.weeklyChange}
            />
            <StatCard
              title="AI Interactions"
              value={flaskStats?.aiInteractions?.total || 0}
              icon={Activity}
              color="bg-pink-500"
              change={flaskStats?.aiInteractions?.last7Days}
            />
            <StatCard
              title="AI Chat Messages"
              value={flaskStats?.chatActivity?.totalMessages || 0}
              icon={MessageSquare}
              color="bg-cyan-500"
              change={flaskStats?.aiInteractions?.last30Days}
            />
          </div>

          {/* Charts and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Enhanced Weekly Growth */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 lg:p-6 responsive-card weekly-growth-mobile">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-blue-600" />
                  Weekly Growth
                </h3>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  vs. last week
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Meals Growth */}
                <div className="weekly-growth-item group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <ChefHat className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Meals</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-semibold flex items-center growth-indicator ${
                        (stats?.meals?.weeklyChange || 0) > 0 ? 'text-green-600' : 
                        (stats?.meals?.weeklyChange || 0) < 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {(stats?.meals?.weeklyChange || 0) > 0 && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {(stats?.meals?.weeklyChange || 0) < 0 && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {(stats?.meals?.weeklyChange || 0) > 0 ? '+' : ''}{stats?.meals?.weeklyChange || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-700 ease-out progress-bar-animated ${
                        (stats?.meals?.weeklyChange || 0) > 0 ? 'bg-gradient-to-r from-green-400 to-green-600 growth-positive' : 
                        (stats?.meals?.weeklyChange || 0) < 0 ? 'bg-gradient-to-r from-red-400 to-red-600 growth-negative' : 'bg-gray-400'
                      }`}
                      style={{ 
                        width: `${Math.min(Math.abs(stats?.meals?.weeklyChange || 0), 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Meal Plans Growth */}
                <div className="weekly-growth-item group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-purple-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Meal Plans</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-semibold flex items-center growth-indicator ${
                        (stats?.mealPlans?.weeklyChange || 0) > 0 ? 'text-green-600' : 
                        (stats?.mealPlans?.weeklyChange || 0) < 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {(stats?.mealPlans?.weeklyChange || 0) > 0 && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {(stats?.mealPlans?.weeklyChange || 0) < 0 && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {(stats?.mealPlans?.weeklyChange || 0) > 0 ? '+' : ''}{stats?.mealPlans?.weeklyChange || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-700 ease-out progress-bar-animated ${
                        (stats?.mealPlans?.weeklyChange || 0) > 0 ? 'bg-gradient-to-r from-purple-400 to-purple-600 growth-positive' : 
                        (stats?.mealPlans?.weeklyChange || 0) < 0 ? 'bg-gradient-to-r from-red-400 to-red-600 growth-negative' : 'bg-gray-400'
                      }`}
                      style={{ 
                        width: `${Math.min(Math.abs(stats?.mealPlans?.weeklyChange || 0), 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Constraints Growth */}
                <div className="weekly-growth-item group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Constraints</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-semibold flex items-center growth-indicator ${
                        (stats?.constraints?.weeklyChange || 0) > 0 ? 'text-green-600' : 
                        (stats?.constraints?.weeklyChange || 0) < 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {(stats?.constraints?.weeklyChange || 0) > 0 && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {(stats?.constraints?.weeklyChange || 0) < 0 && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {(stats?.constraints?.weeklyChange || 0) > 0 ? '+' : ''}{stats?.constraints?.weeklyChange || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-700 ease-out progress-bar-animated ${
                        (stats?.constraints?.weeklyChange || 0) > 0 ? 'bg-gradient-to-r from-indigo-400 to-indigo-600 growth-positive' : 
                        (stats?.constraints?.weeklyChange || 0) < 0 ? 'bg-gradient-to-r from-red-400 to-red-600 growth-negative' : 'bg-gray-400'
                      }`}
                      style={{ 
                        width: `${Math.min(Math.abs(stats?.constraints?.weeklyChange || 0), 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Feedback Growth */}
                <div className="weekly-growth-item group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Feedback</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-semibold flex items-center growth-indicator ${
                        (stats?.feedback?.weeklyChange || 0) > 0 ? 'text-green-600' : 
                        (stats?.feedback?.weeklyChange || 0) < 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {(stats?.feedback?.weeklyChange || 0) > 0 && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {(stats?.feedback?.weeklyChange || 0) < 0 && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {(stats?.feedback?.weeklyChange || 0) > 0 ? '+' : ''}{stats?.feedback?.weeklyChange || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-700 ease-out progress-bar-animated ${
                        (stats?.feedback?.weeklyChange || 0) > 0 ? 'bg-gradient-to-r from-orange-400 to-orange-600 growth-positive' : 
                        (stats?.feedback?.weeklyChange || 0) < 0 ? 'bg-gradient-to-r from-red-400 to-red-600 growth-negative' : 'bg-gray-400'
                      }`}
                      style={{ 
                        width: `${Math.min(Math.abs(stats?.feedback?.weeklyChange || 0), 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Notifications Growth */}
                <div className="weekly-growth-item group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-semibold flex items-center growth-indicator ${
                        (stats?.notifications?.weeklyChange || 0) > 0 ? 'text-green-600' : 
                        (stats?.notifications?.weeklyChange || 0) < 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {(stats?.notifications?.weeklyChange || 0) > 0 && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {(stats?.notifications?.weeklyChange || 0) < 0 && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {(stats?.notifications?.weeklyChange || 0) > 0 ? '+' : ''}{stats?.notifications?.weeklyChange || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-700 ease-out progress-bar-animated ${
                        (stats?.notifications?.weeklyChange || 0) > 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 growth-positive' : 
                        (stats?.notifications?.weeklyChange || 0) < 0 ? 'bg-gradient-to-r from-red-400 to-red-600 growth-negative' : 'bg-gray-400'
                      }`}
                      style={{ 
                        width: `${Math.min(Math.abs(stats?.notifications?.weeklyChange || 0), 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* AI Interactions Growth */}
                <div className="weekly-growth-item group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-pink-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Interactions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-semibold flex items-center growth-indicator growth-tooltip ${
                        (flaskStats?.aiInteractions?.last7Days || 0) > 0 ? 'text-green-600' : 
                        (flaskStats?.aiInteractions?.last7Days || 0) < 0 ? 'text-red-600' : 'text-gray-500'
                      }`} data-tooltip="Last 7 days count">
                        {(flaskStats?.aiInteractions?.last7Days || 0) > 0 && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {(flaskStats?.aiInteractions?.last7Days || 0) < 0 && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {(flaskStats?.aiInteractions?.last7Days || 0) > 0 ? '+' : ''}{flaskStats?.aiInteractions?.last7Days || 0}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-700 ease-out progress-bar-animated ${
                        (flaskStats?.aiInteractions?.last7Days || 0) > 0 ? 'bg-gradient-to-r from-pink-400 to-pink-600 growth-positive' : 
                        (flaskStats?.aiInteractions?.last7Days || 0) < 0 ? 'bg-gradient-to-r from-red-400 to-red-600 growth-negative' : 'bg-gray-400'
                      }`}
                      style={{ 
                        width: `${Math.min(Math.abs(flaskStats?.aiInteractions?.last7Days || 0) * 2, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Enhanced Summary Section */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      ((stats?.meals?.weeklyChange || 0) + 
                       (stats?.mealPlans?.weeklyChange || 0) + 
                       (stats?.constraints?.weeklyChange || 0) + 
                       (stats?.feedback?.weeklyChange || 0) + 
                       (stats?.notifications?.weeklyChange || 0)) > 0 
                        ? 'bg-green-500 growth-positive' : 'bg-red-500 growth-negative'
                    }`}></div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Overall Trend</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-semibold ${
                      ((stats?.meals?.weeklyChange || 0) + 
                       (stats?.mealPlans?.weeklyChange || 0) + 
                       (stats?.constraints?.weeklyChange || 0) + 
                       (stats?.feedback?.weeklyChange || 0) + 
                       (stats?.notifications?.weeklyChange || 0)) > 0 
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {((stats?.meals?.weeklyChange || 0) + 
                        (stats?.mealPlans?.weeklyChange || 0) + 
                        (stats?.constraints?.weeklyChange || 0) + 
                        (stats?.feedback?.weeklyChange || 0) + 
                        (stats?.notifications?.weeklyChange || 0)) > 0 ? '↗ Growing' : '↘ Declining'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({Math.abs(((stats?.meals?.weeklyChange || 0) + 
                        (stats?.mealPlans?.weeklyChange || 0) + 
                        (stats?.constraints?.weeklyChange || 0) + 
                        (stats?.feedback?.weeklyChange || 0) + 
                        (stats?.notifications?.weeklyChange || 0)) / 5).toFixed(1)}% avg)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 lg:p-6 responsive-card">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3 max-h-64 lg:max-h-96 overflow-y-auto admin-scrollbar">
                {recentActivity.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 lg:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-shrink-0">
                      <Activity className="h-3 w-3 lg:h-4 lg:w-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs lg:text-sm text-gray-900 dark:text-white truncate">
                        {activity.action || activity.description || 'Activity'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {activity.name && `${activity.name} - `}
                        {new Date(activity.timestamp || activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <div className="text-center py-4 mobile-loading">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 lg:p-6 responsive-card">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2 lg:space-y-3 max-h-64 lg:max-h-96 overflow-y-auto admin-scrollbar">
                <button
                  onClick={() => exportData('users')}
                  className="w-full flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm touch-target"
                >
                  <Download className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                  <span className="truncate">Export Users</span>
                </button>
                <button
                  onClick={() => exportData('meals')}
                  className="w-full flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm touch-target"
                >
                  <Download className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                  <span className="truncate">Export Meals</span>
                </button>
                <button
                  onClick={() => exportData('meal-plans')}
                  className="w-full flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-sm touch-target"
                >
                  <Download className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                  <span className="truncate">Export Meal Plans</span>
                </button>
                <button
                  onClick={() => exportData('constraints')}
                  className="w-full flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-sm touch-target"
                >
                  <Download className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                  <span className="truncate">Export Constraints</span>
                </button>
                <button
                  onClick={() => exportData('notifications')}
                  className="w-full flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors text-sm touch-target"
                >
                  <Download className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                  <span className="truncate">Export Notifications</span>
                </button>
                <button
                  onClick={() => exportData('feedback')}
                  className="w-full flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-sm touch-target"
                >
                  <Download className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                  <span className="truncate">Export Feedback</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      await adminService.exportFlaskData('ai-history', 'excel')
                      success('AI History data exported successfully')
                    } catch (error) {
                      showError(`Failed to export AI History data: ${error.message}`)
                    }
                  }}
                  className="w-full flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors text-sm touch-target"
                >
                  <Download className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                  <span className="truncate">Export AI History</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      await adminService.exportFlaskData('health-reports', 'excel')
                      success('Health Reports data exported successfully')
                    } catch (error) {
                      showError(`Failed to export Health Reports data: ${error.message}`)
                    }
                  }}
                  className="w-full flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm touch-target"
                >
                  <Download className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                  <span className="truncate">Export Health Reports</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      await adminService.exportFlaskData('meal-analysis', 'excel')
                      success('Meal Analysis data exported successfully')
                    } catch (error) {
                      showError(`Failed to export Meal Analysis data: ${error.message}`)
                    }
                  }}
                  className="w-full flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm touch-target"
                >
                  <Download className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                  <span className="truncate">Export Meal Analysis</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      await adminService.exportFlaskData('weekly-plans', 'excel')
                      success('AI Weekly Plans data exported successfully')
                    } catch (error) {
                      showError(`Failed to export AI Weekly Plans data: ${error.message}`)
                    }
                  }}
                  className="w-full flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-sm touch-target"
                >
                  <Download className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                  <span className="truncate">Export AI Weekly Plans</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      await adminService.exportFlaskData('chat-history', 'excel')
                      success('AI Chat History data exported successfully')
                    } catch (error) {
                      showError(`Failed to export AI Chat History data: ${error.message}`)
                    }
                  }}
                  className="w-full flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors text-sm touch-target"
                >
                  <Download className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                  <span className="truncate">Export AI Chat History</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      await adminService.exportFlaskData('user-context', 'excel')
                      success('User Context data exported successfully')
                    } catch (error) {
                      showError(`Failed to export User Context data: ${error.message}`)
                    }
                  }}
                  className="w-full flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-sm touch-target"
                >
                  <Download className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                  <span className="truncate">Export User Context</span>
                </button>
                <button
                  onClick={loadDashboardData}
                  className="w-full flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-sm touch-target"
                >
                  <RefreshCw className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                  <span className="truncate">Refresh Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4 lg:space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 flex-responsive">
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus-visible-enhanced"
              >
                <option value="all">All Users</option>
                <option value="active">Active Users</option>
                <option value="inactive">Inactive Users</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            <button
              onClick={() => exportData('users')}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto touch-target"
            >
              <Download className="h-4 w-4 flex-shrink-0" />
              <span>Export Users</span>
            </button>
          </div>

          {/* Mobile Cards View */}
          <div className="block sm:hidden space-y-4">
            {users
              .filter(u => {
                if (userFilter === 'all') return true
                if (userFilter === 'active') return u.status === 'active'
                if (userFilter === 'inactive') return u.status === 'inactive'
                if (userFilter === 'admin') return u.roles?.includes('admin') || u.roles?.includes('super_admin')
                return true
              })
              .map((user) => (
              <div key={user._id} className="mobile-table-card">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-medium text-base">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="table-row">
                    <div className="table-label">Role</div>
                    <div className="table-value">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.roles?.includes('super_admin') 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          : user.roles?.includes('admin')
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {user.roles?.includes('super_admin') ? 'Super Admin' : 
                         user.roles?.includes('admin') ? 'Admin' : 'User'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="table-row">
                    <div className="table-label">Status</div>
                    <div className="table-value">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="table-row">
                    <div className="table-label">Joined</div>
                    <div className="table-value text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-3 mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 action-buttons-mobile">
                  <button
                    onClick={() => navigate(`/admin/users/${user._id}`)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 touch-target focus-visible-enhanced"
                    title="View User"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {user.status === 'active' ? (
                    <button
                      onClick={() => handleUserAction(user._id, 'deactivate')}
                      className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 touch-target focus-visible-enhanced"
                      title="Deactivate User"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUserAction(user._id, 'activate')}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 touch-target focus-visible-enhanced"
                      title="Activate User"
                    >
                      <UserCheck className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleUserAction(user._id, 'delete')}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 touch-target focus-visible-enhanced"
                    title="Delete User"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center py-8 mobile-loading">
                <p className="text-gray-500 dark:text-gray-400">No users found</p>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden responsive-card">
            <div className="overflow-x-auto responsive-overflow admin-scrollbar">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="hidden md:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users
                    .filter(u => {
                      if (userFilter === 'all') return true
                      if (userFilter === 'active') return u.status === 'active'
                      if (userFilter === 'inactive') return u.status === 'inactive'
                      if (userFilter === 'admin') return u.roles?.includes('admin') || u.roles?.includes('super_admin')
                      return true
                    })
                    .map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 lg:h-10 lg:w-10">
                            <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-medium text-sm lg:text-base">
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3 lg:ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate-mobile max-w-32 lg:max-w-none">
                              {user.name}
                            </div>
                            <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 truncate-mobile max-w-32 lg:max-w-none">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.roles?.includes('super_admin') 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                            : user.roles?.includes('admin')
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {user.roles?.includes('super_admin') ? 'Super Admin' : 
                           user.roles?.includes('admin') ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-1 lg:space-x-2 action-buttons-mobile">
                          <button
                            onClick={() => navigate(`/admin/users/${user._id}`)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 touch-target focus-visible-enhanced"
                            title="View User"
                          >
                            <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                          </button>
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleUserAction(user._id, 'deactivate')}
                              className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 touch-target focus-visible-enhanced"
                              title="Deactivate User"
                            >
                              <UserX className="h-3 w-3 lg:h-4 lg:w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(user._id, 'activate')}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 touch-target focus-visible-enhanced"
                              title="Activate User"
                            >
                              <UserCheck className="h-3 w-3 lg:h-4 lg:w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleUserAction(user._id, 'delete')}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 touch-target focus-visible-enhanced"
                            title="Delete User"
                          >
                            <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div className="text-center py-8 mobile-loading">
                <p className="text-gray-500 dark:text-gray-400">No users found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Meals Management Tab */}
      {activeTab === 'meals' && (
        <div className="space-y-4 lg:space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 flex-responsive">
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
              <select
                value={mealFilter}
                onChange={(e) => setMealFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus-visible-enhanced"
              >
                <option value="all">All Meals</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button
              onClick={() => exportData('meals')}
              className="flex items-center justify-center space-x-2 bg-green-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm w-full sm:w-auto touch-target"
            >
              <Download className="h-4 w-4 flex-shrink-0" />
              <span>Export Meals</span>
            </button>
          </div>

          {/* Meals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 responsive-grid-auto">
            {meals
              .filter(meal => {
                if (mealFilter === 'all') return true
                const mealStatus = meal.status || 'approved'; // Default to approved if no status
                return mealStatus === mealFilter
              })
              .map((meal) => (
              <div key={meal._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden responsive-card hover:shadow-lg transition-shadow">
                {meal.image && (
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="w-full h-32 sm:h-40 lg:h-48 object-cover responsive-image"
                  />
                )}
                <div className="p-3 lg:p-4">
                  <h3 className="text-sm lg:text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
                    {meal.name}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                    By: {meal.createdBy?.name || 'Unknown'}
                  </p>
                  <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {meal.description?.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      (meal.status || 'approved') === 'approved' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : (meal.status || 'approved') === 'rejected'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                    }`}>
                      {meal.status || 'approved'}
                    </span>
                    <div className="flex items-center space-x-1 action-buttons-mobile">
                      <button
                        onClick={() => navigate(`/dashboard/meals/${meal._id}`)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 touch-target focus-visible-enhanced"
                        title="View Meal"
                      >
                        <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                      </button>
                      {(meal.status || 'approved') !== 'approved' && (
                        <button
                          onClick={() => handleMealAction(meal._id, 'approve')}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 touch-target focus-visible-enhanced"
                          title="Approve Meal"
                        >
                          <UserCheck className="h-3 w-3 lg:h-4 lg:w-4" />
                        </button>
                      )}
                      {(meal.status || 'approved') !== 'rejected' && (
                        <button
                          onClick={() => handleMealAction(meal._id, 'reject')}
                          className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 touch-target focus-visible-enhanced"
                          title="Reject Meal"
                        >
                          <UserX className="h-3 w-3 lg:h-4 lg:w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleMealAction(meal._id, 'delete')}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 touch-target focus-visible-enhanced"
                        title="Delete Meal"
                      >
                        <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {meals.length === 0 && (
              <div className="col-span-full text-center py-8 mobile-loading">
                <p className="text-gray-500 dark:text-gray-400">No meals found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Meal Plans Management Tab */}
      {activeTab === 'meal-plans' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Meal Plans Management</h2>
            <button
              onClick={() => exportData('meal-plans')}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Meal Plans</span>
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Week Start
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {mealPlans.map((plan) => (
                    <tr key={plan._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {plan.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {plan.generatedBy === 'ai' ? 'AI Generated' : 'Manual'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {plan.user?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {plan.user?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(plan.weekStartDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          plan.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => adminService.deleteMealPlan(plan._id).then(() => {
                            success('Meal plan deleted successfully')
                            loadMealPlansData()
                          }).catch(err => showError(err.message))}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Constraints Management Tab */}
      {activeTab === 'constraints' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Constraints Management</h2>
            <button
              onClick={() => exportData('constraints')}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Constraints</span>
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Max Cook Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Skill Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Appliances
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {constraints.map((constraint) => (
                    <tr key={constraint._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {constraint.user?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {constraint.user?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {constraint.maxCookTime} minutes
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          {constraint.skillLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {Object.entries(constraint.appliances || {})
                          .filter(([key, value]) => value)
                          .map(([key]) => key.replace('has', ''))
                          .join(', ') || 'None'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => adminService.deleteConstraint(constraint._id).then(() => {
                            success('Constraint deleted successfully')
                            loadConstraintsData()
                          }).catch(err => showError(err.message))}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Management Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications Management</h2>
            <button
              onClick={() => exportData('notifications')}
              className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Notifications</span>
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Read Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <tr key={notification._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.user?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {notification.user?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {notification.event}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          notification.status === 'sent' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : notification.status === 'failed'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        }`}>
                          {notification.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          notification.isRead 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.isRead ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => adminService.deleteNotification(notification._id).then(() => {
                            success('Notification deleted successfully')
                            loadNotificationsData()
                          }).catch(err => showError(err.message))}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Management Tab */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Feedback Management</h2>
            <button
              onClick={() => exportData('feedback')}
              className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Feedback</span>
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Comment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {feedback.map((fb) => (
                    <tr key={fb._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {fb.user?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {fb.user?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          {fb.type?.replace(/_/g, ' ') || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {fb.rating ? (
                            <>
                              <span className="text-yellow-400">{'★'.repeat(fb.rating)}</span>
                              <span className="text-gray-300">{'★'.repeat(5 - fb.rating)}</span>
                              <span className="ml-2 text-sm text-gray-500">({fb.rating}/5)</span>
                            </>
                          ) : (
                            <span className="text-gray-400">No rating</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {fb.comment || 'No comment'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => adminService.deleteFeedback(fb._id).then(() => {
                            success('Feedback deleted successfully')
                            loadFeedbackData()
                          }).catch(err => showError(err.message))}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {feedback.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No feedback found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI History Management Tab */}
      {activeTab === 'ai-history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI History & Analytics</h2>
            <button
              onClick={async () => {
                try {
                  await adminService.exportFlaskData('ai-history', 'excel')
                  success('AI History data exported successfully')
                } catch (error) {
                  showError(`Failed to export AI History data: ${error.message}`)
                }
              }}
              className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export AI History</span>
            </button>
          </div>

          {/* AI Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total AI Interactions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {aiHistory?.length || 0}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-pink-500">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chat Messages</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {chatHistory?.length || 0}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-cyan-500">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Weekly Plans Generated</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {weeklyPlans?.length || 0}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-500">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Health Risk Reports</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {healthReports?.length || 0}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-500">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* AI History Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {aiHistory.map((record, index) => (
                    <tr key={record._id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.userName || record.username || record.userId || 'Unknown User'}
                        </div>
                        {record.userEmail && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {record.userEmail}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          {record.action || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {record.type || 'AI Interaction'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => adminService.deleteFlaskAIRecord(record._id, 'ai_history').then(() => {
                            success('AI History record deleted successfully')
                            loadFlaskAIHistoryData()
                          }).catch(err => showError(err.message))}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {aiHistory.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No AI history records found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Health Reports Management Tab */}
      {activeTab === 'health-reports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Health Risk Reports</h2>
            <button
              onClick={async () => {
                try {
                  await adminService.exportFlaskData('health-reports', 'excel')
                  success('Health Reports data exported successfully')
                } catch (error) {
                  showError(`Failed to export Health Reports data: ${error.message}`)
                }
              }}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Health Reports</span>
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Report Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {healthReports.map((report, index) => (
                    <tr key={report._id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {report.userName || report.username || report.userId || 'Unknown User'}
                        </div>
                        {report.userEmail && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {report.userEmail}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          (report.data?.overallRisk || 'unknown').toLowerCase() === 'low' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : (report.data?.overallRisk || 'unknown').toLowerCase() === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {report.data?.overallRisk || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        Health Risk Assessment
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => adminService.deleteFlaskAIRecord(report._id, 'health_risk_reports').then(() => {
                            success('Health report deleted successfully')
                            loadFlaskAIHistoryData()
                          }).catch(err => showError(err.message))}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {healthReports.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No health reports found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Meal Analysis Management Tab */}
      {activeTab === 'meal-analysis' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Meal Analysis</h2>
            <button
              onClick={async () => {
                try {
                  await adminService.exportFlaskData('meal-analysis', 'excel')
                  success('Meal Analysis data exported successfully')
                } catch (error) {
                  showError(`Failed to export Meal Analysis data: ${error.message}`)
                }
              }}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Meal Analysis</span>
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Analysis Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Meals Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {mealAnalysis.map((analysis, index) => (
                    <tr key={analysis._id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {analysis.userName || analysis.username || analysis.userId || 'Unknown User'}
                        </div>
                        {analysis.userEmail && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {analysis.userEmail}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                          Meal Analysis
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {analysis.data?.meals?.length || analysis.data?.mealsAnalyzed || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {analysis.createdAt ? new Date(analysis.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => adminService.deleteFlaskAIRecord(analysis._id, 'meal_analysis').then(() => {
                            success('Meal analysis deleted successfully')
                            loadFlaskAIHistoryData()
                          }).catch(err => showError(err.message))}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {mealAnalysis.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No meal analysis records found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Weekly Plans Management Tab */}
      {activeTab === 'weekly-plans-ai' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Generated Weekly Plans</h2>
            <button
              onClick={async () => {
                try {
                  await adminService.exportFlaskData('weekly-plans', 'excel')
                  success('AI Weekly Plans data exported successfully')
                } catch (error) {
                  showError(`Failed to export AI Weekly Plans data: ${error.message}`)
                }
              }}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export AI Weekly Plans</span>
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Plan Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Days Planned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {weeklyPlans.map((plan, index) => (
                    <tr key={plan._id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {plan.userName || plan.username || plan.userId || 'Unknown User'}
                        </div>
                        {plan.userEmail && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {plan.userEmail}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                          AI Weekly Plan
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {plan.data?.weeklyPlan ? Object.keys(plan.data.weeklyPlan).length : 'N/A'} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => adminService.deleteFlaskAIRecord(plan._id, 'weekly_plans').then(() => {
                            success('Weekly plan deleted successfully')
                            loadFlaskAIHistoryData()
                          }).catch(err => showError(err.message))}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {weeklyPlans.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No AI weekly plans found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Chat History Management Tab */}
      {activeTab === 'chat-history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Chat History</h2>
            <button
              onClick={async () => {
                try {
                  await adminService.exportFlaskData('chat-history', 'excel')
                  success('AI Chat History data exported successfully')
                } catch (error) {
                  showError(`Failed to export AI Chat History data: ${error.message}`)
                }
              }}
              className="flex items-center space-x-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export AI Chat History</span>
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Message Preview
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Language
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {chatHistory.map((chat, index) => (
                    <tr key={chat._id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {chat.userName || chat.username || chat.userId || 'Unknown User'}
                        </div>
                        {chat.userEmail && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {chat.userEmail}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {chat.data?.question?.substring(0, 50) || 'Chat message'}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300">
                          {chat.data?.language || 'en-US'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {chat.createdAt ? new Date(chat.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => adminService.deleteFlaskAIRecord(chat._id, 'chat_history').then(() => {
                            success('Chat history deleted successfully')
                            loadFlaskAIHistoryData()
                          }).catch(err => showError(err.message))}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {chatHistory.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No AI chat history found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Context Management Tab */}
      {activeTab === 'user-context' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Context Store</h2>
            <button
              onClick={async () => {
                try {
                  await adminService.exportFlaskData('user-context', 'excel')
                  success('User Context data exported successfully')
                } catch (error) {
                  showError(`Failed to export User Context data: ${error.message}`)
                }
              }}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export User Context</span>
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Context Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Sync Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {userContext.map((context, index) => (
                    <tr key={context._id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {context.userName || context.username || context.userId || 'Unknown User'}
                        </div>
                        {context.userEmail && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {context.userEmail}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300">
                          User Profile Context
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {context.updatedAt ? new Date(context.updatedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                          Synchronized
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => adminService.deleteFlaskAIRecord(context._id, 'user_context').then(() => {
                            success('User context deleted successfully')
                            loadFlaskAIHistoryData()
                          }).catch(err => showError(err.message))}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {userContext.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No user context records found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity Log Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Activity Log
          </h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  <Activity className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.action || activity.description || 'Activity'}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.timestamp || activity.createdAt).toLocaleString()}
                    </p>
                    {(activity.userId || activity.email) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        User: {activity.name || activity.email || activity.userId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No activity logs available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Info Tab (Super Admin Only) */}
      {activeTab === 'system' && user?.roles?.includes('super_admin') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Server Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Server className="h-5 w-5 mr-2" />
                Server Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                  <span className="text-gray-900 dark:text-white">
                    {systemInfo?.server?.uptime ? formatUptime(systemInfo.server.uptime) : 
                     systemInfo?.uptime ? formatUptime(systemInfo.uptime) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Node Version:</span>
                  <span className="text-gray-900 dark:text-white">
                    {systemInfo?.server?.nodeVersion || systemInfo?.nodeVersion || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Environment:</span>
                  <span className="text-gray-900 dark:text-white">
                    {systemInfo?.server?.nodeEnv || systemInfo?.environment?.nodeEnv || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Port:</span>
                  <span className="text-gray-900 dark:text-white">
                    {systemInfo?.server?.port || systemInfo?.environment?.port || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Timezone:</span>
                  <span className="text-gray-900 dark:text-white">
                    {systemInfo?.server?.timezone || systemInfo?.environment?.timezone || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Memory Usage
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Used:</span>
                  <span className="text-gray-900 dark:text-white">
                    {systemInfo?.server?.memory?.rss ? formatBytes(systemInfo.server.memory.rss) : 
                     systemInfo?.memory?.rss ? formatBytes(systemInfo.memory.rss) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Heap Used:</span>
                  <span className="text-gray-900 dark:text-white">
                    {systemInfo?.server?.memory?.heapUsed ? formatBytes(systemInfo.server.memory.heapUsed) : 
                     systemInfo?.memory?.heapUsed ? formatBytes(systemInfo.memory.heapUsed) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Heap Total:</span>
                  <span className="text-gray-900 dark:text-white">
                    {systemInfo?.server?.memory?.heapTotal ? formatBytes(systemInfo.server.memory.heapTotal) : 
                     systemInfo?.memory?.heapTotal ? formatBytes(systemInfo.memory.heapTotal) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  (systemInfo?.database?.connectionState === 1 || systemInfo?.database?.status === 'connected')
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                }`}>
                  {systemInfo?.database?.connectionState === 1 ? 'Connected' : 
                   systemInfo?.database?.status || 'Unknown'}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Connection Status</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {systemInfo?.database?.name || 'N/A'}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Database Name</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {systemInfo?.database?.host ? `${systemInfo.database.host}:${systemInfo.database.port}` : 'N/A'}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Host:Port</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Codes Tab (Super Admin Only) */}
      {activeTab === 'codes' && user?.roles?.includes('super_admin') && (
        <AdminCodesTab />
      )}
      </div>
    </div>
  )
}

export default AdminDashboard