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
  RefreshCw
} from 'lucide-react'
import { motion } from 'framer-motion'

const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  
  const [stats, setStats] = useState(null)
  const [systemInfo, setSystemInfo] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [users, setUsers] = useState([])
  const [meals, setMeals] = useState([])
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
          setSystemInfo(systemResponse.data || systemResponse)
        } catch (err) {
          console.error('Failed to load system info:', err)
        }
      }

      // Load recent activity
      try {
        const activityResponse = await adminService.getRecentActivity(20)
        // Handle different possible response structures
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
      
      // Handle different response structures
      let usersData = [];
      if (usersResponse?.data?.users) {
        usersData = usersResponse.data.users;
      } else if (usersResponse?.users) {
        usersData = usersResponse.users;
      } else if (Array.isArray(usersResponse?.data)) {
        usersData = usersResponse.data;
      } else if (Array.isArray(usersResponse)) {
        usersData = usersResponse;
      }
      
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load users:', err)
      showError('Failed to load users: ' + err.message)
      setUsers([])
    }
  }

  const loadMealsData = async () => {
    try {
      const mealsResponse = await adminService.getAllMeals()
      
      // Handle different response structures
      let mealsData = [];
      if (mealsResponse?.data?.meals) {
        mealsData = mealsResponse.data.meals;
      } else if (mealsResponse?.meals) {
        mealsData = mealsResponse.meals;
      } else if (Array.isArray(mealsResponse?.data)) {
        mealsData = mealsResponse.data;
      } else if (Array.isArray(mealsResponse)) {
        mealsData = mealsResponse;
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
      const response = await adminService.exportData(type)
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      success(`${type} data exported successfully`)
    } catch (error) {
      showError(`Failed to export ${type} data`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  )

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => {
        setActiveTab(id)
        // Load data when switching to users or meals tabs
        if (id === 'users') {
          loadUsersData()
        } else if (id === 'meals') {
          loadMealsData()
        }
      }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === id
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage users, content, and system settings
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <TabButton id="overview" label="Overview" icon={TrendingUp} />
        <TabButton id="users" label="User Management" icon={Users} />
        <TabButton id="meals" label="Meal Management" icon={ChefHat} />
        <TabButton id="activity" label="Activity Log" icon={Activity} />
        {user?.roles?.includes('super_admin') && (
          <>
            <TabButton id="system" label="System Info" icon={Server} />
            <TabButton id="codes" label="Admin Codes" icon={Shield} />
          </>
        )}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              change={stats?.meals?.thisWeek}
            />
            <StatCard
              title="Active Sessions"
              value={stats?.users?.newThisWeek || 0}
              icon={Activity}
              color="bg-purple-500"
            />
            <StatCard
              title="Feedback Count"
              value={stats?.feedback?.total || 0}
              icon={MessageSquare}
              color="bg-orange-500"
              change={stats?.feedback?.thisWeek}
            />
          </div>

          {/* Charts and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-shrink-0">
                      <Activity className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {activity.action || activity.description || 'Activity'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.name && `${activity.name} - `}
                        {new Date(activity.timestamp || activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => exportData('users')}
                  className="w-full flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Users Data</span>
                </button>
                <button
                  onClick={() => exportData('meals')}
                  className="w-full flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Meals Data</span>
                </button>
                <button
                  onClick={loadDashboardData}
                  className="w-full flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Users</option>
                <option value="active">Active Users</option>
                <option value="inactive">Inactive Users</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            <button
              onClick={() => exportData('users')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Users</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
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
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/admin/users/${user._id}`)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleUserAction(user._id, 'deactivate')}
                              className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(user._id, 'activate')}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleUserAction(user._id, 'delete')}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Meals Management Tab */}
      {activeTab === 'meals' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={mealFilter}
                onChange={(e) => setMealFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Meals</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button
              onClick={() => exportData('meals')}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Meals</span>
            </button>
          </div>

          {/* Meals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meals
              .filter(meal => {
                if (mealFilter === 'all') return true
                const mealStatus = meal.status || 'approved'; // Default to approved if no status
                return mealStatus === mealFilter
              })
              .map((meal) => (
              <div key={meal._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {meal.image && (
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {meal.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    By: {meal.createdBy?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
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
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/dashboard/meals/${meal._id}`)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {(meal.status || 'approved') !== 'approved' && (
                        <button
                          onClick={() => handleMealAction(meal._id, 'approve')}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
                      {(meal.status || 'approved') !== 'rejected' && (
                        <button
                          onClick={() => handleMealAction(meal._id, 'reject')}
                          className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleMealAction(meal._id, 'delete')}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {meals.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No meals found</p>
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
  )
}

// Admin Codes Management Component
const AdminCodesTab = () => {
  const [adminCodes, setAdminCodes] = useState(null)
  const [loading, setLoading] = useState(false)
  const { success, error: showError } = useToast()

  const loadAdminCodes = async () => {
    try {
      setLoading(true)
      const response = await adminService.getAdminCodes()
      setAdminCodes(response.data || response)
    } catch (error) {
      console.error('Admin codes error:', error);
      showError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateCode = async () => {
    if (!window.confirm('Are you sure you want to regenerate admin codes? This will invalidate all existing codes.')) {
      return
    }

    try {
      setLoading(true)
      const response = await adminService.regenerateAdminCodes()
      success('Admin codes regenerated successfully')
      
      // Show the new codes in a modal or alert
      alert(`New Admin Codes Generated:\n\nAdmin Code: ${response.data.newAdminCode}\n\nSuper Admin Code: ${response.data.newSuperAdminCode}\n\nPlease update your .env file and restart the server.`)
      
      loadAdminCodes()
    } catch (error) {
      showError(error.message)
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
    <div className="space-y-6">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Security Notice
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Admin registration codes are sensitive. Only share them with trusted individuals who need admin access.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Admin Codes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Current Admin Codes
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Admin Registration Code
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 font-mono text-sm">
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
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 font-mono text-sm">
                {adminCodes?.superAdminCode || 'Loading...'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Grants super admin privileges to new users
              </p>
            </div>
          </div>
        </div>

        {/* Code Management Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 text-green-600" />
            Code Management
          </h3>
          
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Current Environment Codes
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                The codes shown above are currently active in your environment variables.
              </p>
            </div>

            <button
              onClick={handleRegenerateCode}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Generating...' : 'Regenerate Codes'}</span>
            </button>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                ⚠️ Important Notes
              </h4>
              <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                <li>• Regenerating codes will invalidate existing codes</li>
                <li>• You must update your .env file manually</li>
                <li>• Server restart is required for changes to take effect</li>
                <li>• Inform other admins about the new codes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How to Use Admin Registration Codes
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">For New Admin Registration:</h4>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>1. Go to the signup page</li>
              <li>2. Select "Administrator" as account type</li>
              <li>3. Enter the admin registration code</li>
              <li>4. Complete the registration process</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Code Security:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
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

export default AdminDashboard