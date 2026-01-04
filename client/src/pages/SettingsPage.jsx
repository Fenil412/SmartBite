import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Shield, 
  Key, 
  RefreshCw, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Sun,
  Moon,
  Monitor,
  Save,
  User,
  Heart,
  DollarSign
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { userService } from '../services/userService'
import useThemeStore from '../store/themeStore'
import LoadingSpinner from '../components/LoadingSpinner'

const SettingsPage = () => {
  const { user, updateUser } = useAuth()
  const { success, error: showError } = useToast()
  const { theme, setTheme } = useThemeStore()
  
  // Password Reset State
  const [passwordResetData, setPasswordResetData] = useState({
    email: user?.email || '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false
  })
  const [passwordResetStep, setPasswordResetStep] = useState(1) // 1: request OTP, 2: reset password
  
  // Additional Data State
  const [additionalData, setAdditionalData] = useState({
    budgetTier: user?.preferences?.budgetTier || 'medium',
    preferredCuisines: user?.preferences?.preferredCuisines || [],
    units: user?.preferences?.units || 'metric',
    dietaryPreferences: user?.preferences?.dietaryPreferences || [],
    dietaryRestrictions: user?.preferences?.dietaryRestrictions || [],
    allergies: user?.preferences?.allergies || [],
    medicalNotes: user?.preferences?.medicalNotes || '',
    favoriteMeals: user?.preferences?.favoriteMeals || []
  })

  // User Data Update State
  const [userData, setUserData] = useState({
    fullName: user?.name || user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  const [loading, setLoading] = useState({
    requestOtp: false,
    resetPassword: false,
    refreshToken: false,
    storeAdditionalData: false,
    updateUserData: false
  })

  const setLoadingState = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPasswordResetData(prev => ({ ...prev, [name]: value }))
  }

  const handleAdditionalDataChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setAdditionalData(prev => ({
        ...prev,
        [name]: checked 
          ? [...(prev[name] || []), value]
          : (prev[name] || []).filter(item => item !== value)
      }))
    } else {
      setAdditionalData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleUserDataChange = (e) => {
    const { name, value } = e.target
    setUserData(prev => ({ ...prev, [name]: value }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleRequestOtp = async () => {
    if (!passwordResetData.email) {
      showError('Please enter your email address')
      return
    }

    setLoadingState('requestOtp', true)

    try {
      const response = await userService.requestPasswordOtp(passwordResetData.email)
      
      if (response.success) {
        success('OTP sent to your email address')
        setPasswordResetStep(2)
      } else {
        showError(response.message || 'Failed to send OTP')
      }
    } catch (error) {
      showError(error.message || 'Failed to send OTP')
    } finally {
      setLoadingState('requestOtp', false)
    }
  }

  const handleResetPassword = async () => {
    if (!passwordResetData.otp || !passwordResetData.newPassword || !passwordResetData.confirmPassword) {
      showError('Please fill in all fields')
      return
    }

    if (passwordResetData.newPassword !== passwordResetData.confirmPassword) {
      showError('Passwords do not match')
      return
    }

    if (passwordResetData.newPassword.length < 8) {
      showError('Password must be at least 8 characters long')
      return
    }

    setLoadingState('resetPassword', true)

    try {
      const response = await userService.resetPasswordWithOtp({
        email: passwordResetData.email,
        otp: passwordResetData.otp,
        newPassword: passwordResetData.newPassword
      })
      
      if (response.success) {
        success('Password reset successfully! Please log in with your new password.')
        // Reset form
        setPasswordResetData({
          email: user?.email || '',
          otp: '',
          newPassword: '',
          confirmPassword: ''
        })
        setPasswordResetStep(1)
      } else {
        showError(response.message || 'Failed to reset password')
      }
    } catch (error) {
      showError(error.message || 'Failed to reset password')
    } finally {
      setLoadingState('resetPassword', false)
    }
  }

  const handleRefreshToken = async () => {
    setLoadingState('refreshToken', true)

    try {
      const response = await userService.refreshToken()
      
      if (response.success) {
        success('Authentication token refreshed successfully')
      } else {
        showError(response.message || 'Failed to refresh token')
      }
    } catch (error) {
      showError(error.message || 'Failed to refresh token')
    } finally {
      setLoadingState('refreshToken', false)
    }
  }

  const handleStoreAdditionalData = async () => {
    setLoadingState('storeAdditionalData', true)

    try {
      const response = await userService.storeAdditionalData(additionalData)
      
      if (response.success) {
        updateUser(response.data)
        success('Additional preferences saved successfully')
      } else {
        showError(response.message || 'Failed to save additional data')
      }
    } catch (error) {
      showError(error.message || 'Failed to save additional data')
    } finally {
      setLoadingState('storeAdditionalData', false)
    }
  }

  const handleUpdateUserData = async () => {
    if (!userData.fullName || !userData.email) {
      showError('Full name and email are required')
      return
    }

    setLoadingState('updateUserData', true)

    try {
      const response = await userService.updateUserData(userData)
      
      if (response.success) {
        updateUser(response.data)
        success('Profile information updated successfully')
      } else {
        showError(response.message || 'Failed to update profile')
      }
    } catch (error) {
      showError(error.message || 'Failed to update profile')
    } finally {
      setLoadingState('updateUserData', false)
    }
  }

  const themes = [
    { value: 'light', icon: Sun, label: 'Light Mode', description: 'Clean and bright interface' },
    { value: 'dark', icon: Moon, label: 'Dark Mode', description: 'Easy on the eyes' },
    { value: 'system', icon: Monitor, label: 'System', description: 'Follow system preference' },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account security and preferences
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appearance</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {themes.map(({ value, icon: Icon, label, description }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  theme === value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Icon className={`h-5 w-5 ${
                    theme === value ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'
                  }`} />
                  <span className={`font-medium ${
                    theme === value ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'
                  }`}>
                    {label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security</h2>
          </div>

          {/* Refresh Token */}
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Refresh Authentication Token
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Refresh your session token for enhanced security
                </p>
              </div>
              <button
                onClick={handleRefreshToken}
                disabled={loading.refreshToken}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {loading.refreshToken ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>Refresh Token</span>
              </button>
            </div>
          </div>

          {/* Password Reset */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center space-x-2 mb-4">
              <Key className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                Reset Password
              </h3>
            </div>

            {passwordResetStep === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={passwordResetData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRequestOtp}
                  disabled={loading.requestOtp}
                  className="w-full flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {loading.requestOtp ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Mail className="h-5 w-5" />
                  )}
                  <span>Send Reset OTP</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-800 dark:text-green-200">
                    OTP sent to {passwordResetData.email}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={passwordResetData.otp}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPasswords.newPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordResetData.newPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('newPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPasswords.newPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPasswords.confirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordResetData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPasswords.confirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setPasswordResetStep(1)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleResetPassword}
                    disabled={loading.resetPassword}
                    className="flex-1 flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {loading.resetPassword ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Key className="h-5 w-5" />
                    )}
                    <span>Reset Password</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3 mb-6">
            <AlertCircle className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Information</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Account Status</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${user?.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-gray-600 dark:text-gray-400">
                  {user?.isVerified ? 'Verified Account' : 'Pending Verification'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Member Since</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Not available'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Account Type</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.roles?.includes('premium') ? 'Premium User' : 'Free User'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Last Active</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : 'Not available'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SettingsPage
