import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Shield, 
  Key, 
  Activity, 
  Upload, 
  Trash2, 
  RefreshCw,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { userService } from '../services/userService'
import LoadingSpinner from '../components/LoadingSpinner'

const ApiTestPage = () => {
  const { user, logout } = useAuth()
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState({})
  const [results, setResults] = useState({})
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [activityHistory, setActivityHistory] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    loadActivityHistory()
  }, [])

  const setLoadingState = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }))
  }

  const setResult = (key, value) => {
    setResults(prev => ({ ...prev, [key]: value }))
  }

  const loadActivityHistory = async () => {
    try {
      setLoadingState('activity', true)
      const response = await userService.getActivityHistory()
      if (response.success) {
        setActivityHistory(response.data.activityHistory || [])
        setResult('activity', { success: true, data: response.data })
      }
    } catch (error) {
      setResult('activity', { success: false, error: error.message })
    } finally {
      setLoadingState('activity', false)
    }
  }

  const testGetMe = async () => {
    try {
      setLoadingState('getMe', true)
      const response = await userService.getMe()
      setResult('getMe', { success: true, data: response.data })
      success('Profile fetched successfully')
    } catch (error) {
      setResult('getMe', { success: false, error: error.message })
      showError('Failed to fetch profile')
    } finally {
      setLoadingState('getMe', false)
    }
  }

  const testRequestPasswordOtp = async () => {
    if (!formData.email) {
      showError('Please enter email address')
      return
    }

    try {
      setLoadingState('requestOtp', true)
      const response = await userService.requestPasswordOtp(formData.email)
      setResult('requestOtp', { success: true, data: response.data })
      success('OTP sent to email')
    } catch (error) {
      setResult('requestOtp', { success: false, error: error.message })
      showError('Failed to send OTP')
    } finally {
      setLoadingState('requestOtp', false)
    }
  }

  const testResetPassword = async () => {
    if (!formData.email || !formData.otp || !formData.newPassword) {
      showError('Please fill all password reset fields')
      return
    }

    try {
      setLoadingState('resetPassword', true)
      const response = await userService.resetPasswordWithOtp({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      })
      setResult('resetPassword', { success: true, data: response.data })
      success('Password reset successfully')
    } catch (error) {
      setResult('resetPassword', { success: false, error: error.message })
      showError('Failed to reset password')
    } finally {
      setLoadingState('resetPassword', false)
    }
  }

  const testUploadAvatar = async () => {
    if (!selectedFile) {
      showError('Please select a file')
      return
    }

    try {
      setLoadingState('uploadAvatar', true)
      const response = await userService.uploadAvatar(selectedFile)
      setResult('uploadAvatar', { success: true, data: response.data })
      success('Avatar uploaded successfully')
    } catch (error) {
      setResult('uploadAvatar', { success: false, error: error.message })
      showError('Failed to upload avatar')
    } finally {
      setLoadingState('uploadAvatar', false)
    }
  }

  const testDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      setLoadingState('deleteAccount', true)
      const response = await userService.deleteAccount()
      setResult('deleteAccount', { success: true, data: response.data })
      success('Account deleted successfully')
      // Logout after successful deletion
      setTimeout(() => logout(), 2000)
    } catch (error) {
      setResult('deleteAccount', { success: false, error: error.message })
      showError('Failed to delete account')
    } finally {
      setLoadingState('deleteAccount', false)
    }
  }

  const testRefreshToken = async () => {
    try {
      setLoadingState('refreshToken', true)
      const response = await userService.refreshToken()
      setResult('refreshToken', { success: true, data: response.data })
      success('Token refreshed successfully')
    } catch (error) {
      setResult('refreshToken', { success: false, error: error.message })
      showError('Failed to refresh token')
    } finally {
      setLoadingState('refreshToken', false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const ResultDisplay = ({ result, title }) => {
    if (!result) return null

    return (
      <div className={`mt-4 p-4 rounded-lg border ${
        result.success 
          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
          : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      }`}>
        <div className="flex items-center space-x-2 mb-2">
          {result.success ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <h4 className={`font-medium ${
            result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
          }`}>
            {title} {result.success ? 'Success' : 'Error'}
          </h4>
        </div>
        <pre className={`text-sm overflow-x-auto ${
          result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
        }`}>
          {JSON.stringify(result.success ? result.data : result.error, null, 2)}
        </pre>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            API Testing Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test all available SmartBite User APIs and view responses
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* User Profile APIs */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <User className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Profile APIs</h2>
            </div>

            <div className="space-y-4">
              {/* Get Me */}
              <div>
                <button
                  onClick={testGetMe}
                  disabled={loading.getMe}
                  className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {loading.getMe ? <LoadingSpinner size="sm" /> : <User className="h-5 w-5" />}
                  <span>GET /users/me</span>
                </button>
                <ResultDisplay result={results.getMe} title="Get Profile" />
              </div>

              {/* Upload Avatar */}
              <div>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={testUploadAvatar}
                    disabled={loading.uploadAvatar || !selectedFile}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading.uploadAvatar ? <LoadingSpinner size="sm" /> : <Upload className="h-5 w-5" />}
                    <span>Upload</span>
                  </button>
                </div>
                <ResultDisplay result={results.uploadAvatar} title="Upload Avatar" />
              </div>

              {/* Delete Account */}
              <div>
                <button
                  onClick={testDeleteAccount}
                  disabled={loading.deleteAccount}
                  className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading.deleteAccount ? <LoadingSpinner size="sm" /> : <Trash2 className="h-5 w-5" />}
                  <span>DELETE /users/me</span>
                </button>
                <ResultDisplay result={results.deleteAccount} title="Delete Account" />
              </div>
            </div>
          </div>

          {/* Authentication APIs */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Authentication APIs</h2>
            </div>

            <div className="space-y-4">
              {/* Refresh Token */}
              <div>
                <button
                  onClick={testRefreshToken}
                  disabled={loading.refreshToken}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading.refreshToken ? <LoadingSpinner size="sm" /> : <RefreshCw className="h-5 w-5" />}
                  <span>POST /users/refresh-token</span>
                </button>
                <ResultDisplay result={results.refreshToken} title="Refresh Token" />
              </div>
            </div>
          </div>

          {/* Password Reset APIs */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <Key className="h-6 w-6 text-yellow-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Password Reset APIs</h2>
            </div>

            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter email for OTP"
                  />
                </div>
              </div>

              {/* Request OTP */}
              <div>
                <button
                  onClick={testRequestPasswordOtp}
                  disabled={loading.requestOtp}
                  className="w-full flex items-center justify-center space-x-2 bg-yellow-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  {loading.requestOtp ? <LoadingSpinner size="sm" /> : <Mail className="h-5 w-5" />}
                  <span>POST /users/password/request-otp</span>
                </button>
                <ResultDisplay result={results.requestOtp} title="Request OTP" />
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  OTP Code
                </label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter 6-digit OTP"
                />
              </div>

              {/* New Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Reset Password */}
              <div>
                <button
                  onClick={testResetPassword}
                  disabled={loading.resetPassword}
                  className="w-full flex items-center justify-center space-x-2 bg-orange-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {loading.resetPassword ? <LoadingSpinner size="sm" /> : <Lock className="h-5 w-5" />}
                  <span>POST /users/password/reset</span>
                </button>
                <ResultDisplay result={results.resetPassword} title="Reset Password" />
              </div>
            </div>
          </div>

          {/* Activity History */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Activity className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Activity History</h2>
              </div>
              <button
                onClick={loadActivityHistory}
                disabled={loading.activity}
                className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading.activity ? <LoadingSpinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
                <span>Refresh</span>
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activityHistory.length > 0 ? (
                activityHistory.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No activity history found</p>
                </div>
              )}
            </div>
            <ResultDisplay result={results.activity} title="Activity History" />
          </div>
        </div>

        {/* API Summary */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">Available APIs Summary</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Authentication</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• POST /users/signup</li>
                <li>• POST /users/login</li>
                <li>• POST /users/logout</li>
                <li>• POST /users/refresh-token</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Password Reset</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• POST /users/password/request-otp</li>
                <li>• POST /users/password/reset</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">User Profile</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• GET /users/me</li>
                <li>• PUT /users/avatar</li>
                <li>• DELETE /users/me</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Activity & Internal</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• GET /users/activity</li>
                <li>• GET /users/internal/ai/user-context/:userId</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ApiTestPage
