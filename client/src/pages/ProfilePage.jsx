import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Camera, Trash2, Save, AlertTriangle, RefreshCw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { userService } from '../services/userService'
import LoadingSpinner from '../components/LoadingSpinner'

const ProfilePage = () => {
  const { user, updateUser, logout, fetchMe } = useAuth()
  const { success, error: showError } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activityStats, setActivityStats] = useState({
    totalActivities: 0,
    activeDays: 0,
    thisWeek: 0,
    lastActive: null
  })
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Fetch latest user data when component mounts
    refreshUserData()
    fetchActivityStats()
  }, [])

  const refreshUserData = async () => {
    setIsRefreshing(true)
    try {
      await fetchMe()
      success('Profile data refreshed')
    } catch (error) {
      showError('Failed to refresh profile data')
    } finally {
      setIsRefreshing(false)
    }
  }

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

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size must be less than 5MB')
      return
    }

    setIsUploading(true)

    try {
      const response = await userService.uploadAvatar(file)
      
      if (response.success) {
        updateUser({ avatar: response.data.avatar })
        success('Profile picture updated successfully!')
      } else {
        showError(response.message || 'Failed to upload avatar')
      }
    } catch (error) {
      showError(error.message || 'Failed to upload avatar')
    } finally {
      setIsUploading(false)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)

    try {
      const response = await userService.deleteAccount()
      
      if (response.success) {
        success('Account deleted successfully')
        await logout()
      } else {
        showError(response.message || 'Failed to delete account')
      }
    } catch (error) {
      showError(error.message || 'Failed to delete account')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Profile Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account information and preferences
            </p>
          </div>
          <button
            onClick={refreshUserData}
            disabled={isRefreshing}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Refresh</span>
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Profile Picture Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Profile Picture
            </h3>
            
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  {user?.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-white" />
                  )}
                </div>
                
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
              >
                <Camera className="h-4 w-4" />
                <span>{user?.avatar ? 'Change Picture' : 'Upload Picture'}</span>
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                JPG, PNG up to 5MB
              </p>
            </div>
          </div>
        </motion.div>

        {/* Basic Information Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-3"
        >
          <div className="grid gap-6">
            {/* Basic Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Basic Information
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                    <p className="text-gray-900 dark:text-white">{user?.name || 'Not provided'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                    <p className="text-gray-900 dark:text-white">{user?.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                    <p className="text-gray-900 dark:text-white">{user?.username || 'Not set'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                    <p className="text-gray-900 dark:text-white">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Status
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user?.isVerified 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                    }`}>
                      {user?.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Member Since
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                    <p className="text-gray-900 dark:text-white">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Information Card */}
            {user?.profile && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Physical Information
                </h3>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Age
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-gray-900 dark:text-white text-lg font-semibold">
                        {user.profile.age} years
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Height
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-gray-900 dark:text-white text-lg font-semibold">
                        {user.profile.heightCm}cm
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Weight
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-gray-900 dark:text-white text-lg font-semibold">
                        {user.profile.weightKg}kg
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gender
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-gray-900 dark:text-white capitalize">
                        {user.profile.gender}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Activity Level
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-gray-900 dark:text-white capitalize">
                        {user.profile.activityLevel?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Goal
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-gray-900 dark:text-white capitalize">
                        {user.profile.goal?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Card */}
            {user?.preferences && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Preferences
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Units
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-gray-900 dark:text-white capitalize">
                        {user.preferences.units}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Budget Tier
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-gray-900 dark:text-white capitalize">
                        {user.preferences.budgetTier}
                      </p>
                    </div>
                  </div>

                  {user.preferences.preferredCuisines?.length > 0 && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Cuisines
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <div className="flex flex-wrap gap-2">
                          {user.preferences.preferredCuisines.map((cuisine, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium">
                              {cuisine}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dietary Information Card */}
            {user?.profile && (user.profile.dietaryPreferences?.length > 0 || user.profile.allergies?.length > 0 || user.profile.dietaryRestrictions?.length > 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Dietary Information
                </h3>

                <div className="space-y-4">
                  {user.profile.dietaryPreferences?.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Dietary Preferences
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <div className="flex flex-wrap gap-2">
                          {user.profile.dietaryPreferences.map((pref, index) => (
                            <span key={index} className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg text-sm font-medium">
                              {pref}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {user.profile.dietaryRestrictions?.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Dietary Restrictions
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <div className="flex flex-wrap gap-2">
                          {user.profile.dietaryRestrictions.map((restriction, index) => (
                            <span key={index} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 rounded-lg text-sm font-medium">
                              {restriction}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {user.profile.allergies?.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Allergies
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <div className="flex flex-wrap gap-2">
                          {user.profile.allergies.map((allergy, index) => (
                            <span key={index} className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg text-sm font-medium">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {user.profile.medicalNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Medical Notes
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <p className="text-gray-900 dark:text-white">
                          {user.profile.medicalNotes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Constraints Card */}
            {user?.constraints && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Cooking Constraints
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Cook Time
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-gray-900 dark:text-white">
                        {user.constraints.maxCookTime} minutes
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Skill Level
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-gray-900 dark:text-white capitalize">
                        {user.constraints.skillLevel}
                      </p>
                    </div>
                  </div>

                  {user.constraints.appliances?.length > 0 && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Available Appliances
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <div className="flex flex-wrap gap-2">
                          {user.constraints.appliances.map((appliance, index) => (
                            <span key={index} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 rounded-lg text-sm font-medium">
                              {appliance}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Danger Zone Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-red-200 dark:border-red-700">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                Danger Zone
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      {/* Activity Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Activity Overview
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Activities</p>
                  <p className="text-2xl font-bold">
                    {isLoadingStats ? '...' : activityStats.totalActivities}
                  </p>
                </div>
                <div className="text-blue-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Active Days</p>
                  <p className="text-2xl font-bold">
                    {isLoadingStats ? '...' : activityStats.activeDays}
                  </p>
                </div>
                <div className="text-green-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">This Week</p>
                  <p className="text-2xl font-bold">
                    {isLoadingStats ? '...' : activityStats.thisWeek}
                  </p>
                </div>
                <div className="text-purple-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Last Active</p>
                  <p className="text-lg font-bold">
                    {isLoadingStats ? '...' : (activityStats.lastActive ? 
                      new Date(activityStats.lastActive).toLocaleDateString() : 'N/A')}
                  </p>
                </div>
                <div className="text-orange-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Account
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Account</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage