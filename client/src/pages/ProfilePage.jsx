import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Camera, Trash2, AlertTriangle, RefreshCw, Edit3, Save, X } from 'lucide-react'
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
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Fetch latest user data when component mounts
    refreshUserData()
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

  const handleEdit = () => {
    setEditData({
      fullName: user?.name || '',
      phone: user?.phone || '',
      profile: {
        age: user?.profile?.age || '',
        heightCm: user?.profile?.heightCm || '',
        weightKg: user?.profile?.weightKg || '',
        gender: user?.profile?.gender || 'other',
        activityLevel: user?.profile?.activityLevel || 'sedentary',
        goal: user?.profile?.goal || 'maintenance',
        dietaryPreferences: user?.profile?.dietaryPreferences || [],
        dietaryRestrictions: user?.profile?.dietaryRestrictions || [],
        allergies: user?.profile?.allergies || [],
        medicalNotes: user?.profile?.medicalNotes || ''
      },
      preferences: {
        units: user?.preferences?.units || 'metric',
        budgetTier: user?.preferences?.budgetTier || 'medium',
        preferredCuisines: user?.preferences?.preferredCuisines || []
      },
      favoriteMeals: user?.favoriteMeals || []
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // First, update user data with updateUserData API
      const updateResponse = await userService.updateUserData({
        fullName: editData.fullName,
        phone: editData.phone,
        profile: editData.profile,
        preferences: editData.preferences
      })

      if (!updateResponse.success) {
        throw new Error(updateResponse.message || 'Failed to update user data')
      }

      // Then, store additional data with storeAdditionalData API
      const additionalDataResponse = await userService.storeAdditionalData({
        budgetTier: editData.preferences?.budgetTier,
        preferredCuisines: editData.preferences?.preferredCuisines,
        units: editData.preferences?.units,
        dietaryPreferences: editData.profile?.dietaryPreferences,
        dietaryRestrictions: editData.profile?.dietaryRestrictions,
        allergies: editData.profile?.allergies,
        medicalNotes: editData.profile?.medicalNotes,
        favoriteMeals: editData.favoriteMeals
      })

      if (!additionalDataResponse.success) {
        throw new Error(additionalDataResponse.message || 'Failed to store additional data')
      }

      // Update local user state with the latest data
      updateUser(updateResponse.data)
      success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      showError(error.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({})
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
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <>
                <button
                  onClick={refreshUserData}
                  disabled={isRefreshing}
                  className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isRefreshing ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span>Refresh</span>
                </button>
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              </>
            )}
          </div>
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
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.fullName || ''}
                      onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-gray-900 dark:text-white">{user?.name || 'Not provided'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                    <p className="text-gray-900 dark:text-white">{user?.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                    <p className="text-gray-900 dark:text-white">{user?.username || 'Not set'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Username cannot be changed</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone || ''}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="+1234567890"
                    />
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-gray-900 dark:text-white">{user?.phone || 'Not provided'}</p>
                    </div>
                  )}
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
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.profile?.age || ''}
                        onChange={(e) => setEditData({
                          ...editData, 
                          profile: {...editData.profile, age: parseInt(e.target.value) || 0}
                        })}
                        className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        min="1"
                        max="120"
                      />
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <p className="text-gray-900 dark:text-white text-lg font-semibold">
                          {user.profile.age} years
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Height (cm)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.profile?.heightCm || ''}
                        onChange={(e) => setEditData({
                          ...editData, 
                          profile: {...editData.profile, heightCm: parseInt(e.target.value) || 0}
                        })}
                        className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        min="50"
                        max="300"
                      />
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <p className="text-gray-900 dark:text-white text-lg font-semibold">
                          {user.profile.heightCm}cm
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Weight (kg)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.profile?.weightKg || ''}
                        onChange={(e) => setEditData({
                          ...editData, 
                          profile: {...editData.profile, weightKg: parseInt(e.target.value) || 0}
                        })}
                        className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        min="20"
                        max="500"
                      />
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <p className="text-gray-900 dark:text-white text-lg font-semibold">
                          {user.profile.weightKg}kg
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gender
                    </label>
                    {isEditing ? (
                      <select
                        value={editData.profile?.gender || 'other'}
                        onChange={(e) => setEditData({
                          ...editData, 
                          profile: {...editData.profile, gender: e.target.value}
                        })}
                        className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <p className="text-gray-900 dark:text-white capitalize">
                          {user.profile.gender}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Activity Level
                    </label>
                    {isEditing ? (
                      <select
                        value={editData.profile?.activityLevel || 'sedentary'}
                        onChange={(e) => setEditData({
                          ...editData, 
                          profile: {...editData.profile, activityLevel: e.target.value}
                        })}
                        className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="sedentary">Sedentary</option>
                        <option value="light">Light</option>
                        <option value="moderate">Moderate</option>
                        <option value="active">Active</option>
                        <option value="very_active">Very Active</option>
                      </select>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <p className="text-gray-900 dark:text-white capitalize">
                          {user.profile.activityLevel?.replace('_', ' ')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Goal
                    </label>
                    {isEditing ? (
                      <select
                        value={editData.profile?.goal || 'maintenance'}
                        onChange={(e) => setEditData({
                          ...editData, 
                          profile: {...editData.profile, goal: e.target.value}
                        })}
                        className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="fat_loss">Fat Loss</option>
                        <option value="muscle_gain">Muscle Gain</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <p className="text-gray-900 dark:text-white capitalize">
                          {user.profile.goal?.replace('_', ' ')}
                        </p>
                      </div>
                    )}
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
                    {isEditing ? (
                      <select
                        value={editData.preferences?.units || 'metric'}
                        onChange={(e) => setEditData({
                          ...editData, 
                          preferences: {...editData.preferences, units: e.target.value}
                        })}
                        className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="metric">Metric</option>
                        <option value="imperial">Imperial</option>
                      </select>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <p className="text-gray-900 dark:text-white capitalize">
                          {user.preferences.units}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Budget Tier
                    </label>
                    {isEditing ? (
                      <select
                        value={editData.preferences?.budgetTier || 'medium'}
                        onChange={(e) => setEditData({
                          ...editData, 
                          preferences: {...editData.preferences, budgetTier: e.target.value}
                        })}
                        className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <p className="text-gray-900 dark:text-white capitalize">
                          {user.preferences.budgetTier}
                        </p>
                      </div>
                    )}
                  </div>

                  {(user.preferences.preferredCuisines?.length > 0 || isEditing) && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Cuisines
                      </label>
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Add cuisine (press Enter)"
                            className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.target.value.trim()) {
                                const newCuisines = [...(editData.preferences?.preferredCuisines || []), e.target.value.trim()];
                                setEditData({
                                  ...editData, 
                                  preferences: {...editData.preferences, preferredCuisines: newCuisines}
                                });
                                e.target.value = '';
                              }
                            }}
                          />
                          <div className="flex flex-wrap gap-2">
                            {(editData.preferences?.preferredCuisines || []).map((cuisine, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium flex items-center space-x-1">
                                <span>{cuisine}</span>
                                <button
                                  onClick={() => {
                                    const newCuisines = editData.preferences.preferredCuisines.filter((_, i) => i !== index);
                                    setEditData({
                                      ...editData, 
                                      preferences: {...editData.preferences, preferredCuisines: newCuisines}
                                    });
                                  }}
                                  className="text-blue-600 hover:text-blue-800 ml-1"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                          <div className="flex flex-wrap gap-2">
                            {user.preferences.preferredCuisines.map((cuisine, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium">
                                {cuisine}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dietary Information Card */}
            {(user?.profile && (user.profile.dietaryPreferences?.length > 0 || user.profile.allergies?.length > 0 || user.profile.dietaryRestrictions?.length > 0 || user.profile.medicalNotes || isEditing)) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Dietary Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dietary Preferences
                    </label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Add dietary preference (press Enter)"
                          className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              const newPrefs = [...(editData.profile?.dietaryPreferences || []), e.target.value.trim()];
                              setEditData({
                                ...editData, 
                                profile: {...editData.profile, dietaryPreferences: newPrefs}
                              });
                              e.target.value = '';
                            }
                          }}
                        />
                        <div className="flex flex-wrap gap-2">
                          {(editData.profile?.dietaryPreferences || []).map((pref, index) => (
                            <span key={index} className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg text-sm font-medium flex items-center space-x-1">
                              <span>{pref}</span>
                              <button
                                onClick={() => {
                                  const newPrefs = editData.profile.dietaryPreferences.filter((_, i) => i !== index);
                                  setEditData({
                                    ...editData, 
                                    profile: {...editData.profile, dietaryPreferences: newPrefs}
                                  });
                                }}
                                className="text-green-600 hover:text-green-800 ml-1"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      user.profile.dietaryPreferences?.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                          <div className="flex flex-wrap gap-2">
                            {user.profile.dietaryPreferences.map((pref, index) => (
                              <span key={index} className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg text-sm font-medium">
                                {pref}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dietary Restrictions
                    </label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Add dietary restriction (press Enter)"
                          className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              const newRestrictions = [...(editData.profile?.dietaryRestrictions || []), e.target.value.trim()];
                              setEditData({
                                ...editData, 
                                profile: {...editData.profile, dietaryRestrictions: newRestrictions}
                              });
                              e.target.value = '';
                            }
                          }}
                        />
                        <div className="flex flex-wrap gap-2">
                          {(editData.profile?.dietaryRestrictions || []).map((restriction, index) => (
                            <span key={index} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 rounded-lg text-sm font-medium flex items-center space-x-1">
                              <span>{restriction}</span>
                              <button
                                onClick={() => {
                                  const newRestrictions = editData.profile.dietaryRestrictions.filter((_, i) => i !== index);
                                  setEditData({
                                    ...editData, 
                                    profile: {...editData.profile, dietaryRestrictions: newRestrictions}
                                  });
                                }}
                                className="text-orange-600 hover:text-orange-800 ml-1"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      user.profile.dietaryRestrictions?.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                          <div className="flex flex-wrap gap-2">
                            {user.profile.dietaryRestrictions.map((restriction, index) => (
                              <span key={index} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 rounded-lg text-sm font-medium">
                                {restriction}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Allergies
                    </label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Add allergy (press Enter)"
                          className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              const newAllergies = [...(editData.profile?.allergies || []), e.target.value.trim()];
                              setEditData({
                                ...editData, 
                                profile: {...editData.profile, allergies: newAllergies}
                              });
                              e.target.value = '';
                            }
                          }}
                        />
                        <div className="flex flex-wrap gap-2">
                          {(editData.profile?.allergies || []).map((allergy, index) => (
                            <span key={index} className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg text-sm font-medium flex items-center space-x-1">
                              <span>{allergy}</span>
                              <button
                                onClick={() => {
                                  const newAllergies = editData.profile.allergies.filter((_, i) => i !== index);
                                  setEditData({
                                    ...editData, 
                                    profile: {...editData.profile, allergies: newAllergies}
                                  });
                                }}
                                className="text-red-600 hover:text-red-800 ml-1"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      user.profile.allergies?.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                          <div className="flex flex-wrap gap-2">
                            {user.profile.allergies.map((allergy, index) => (
                              <span key={index} className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg text-sm font-medium">
                                {allergy}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Medical Notes
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editData.profile?.medicalNotes || ''}
                        onChange={(e) => setEditData({
                          ...editData, 
                          profile: {...editData.profile, medicalNotes: e.target.value}
                        })}
                        className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows="3"
                        placeholder="Any medical notes or conditions..."
                      />
                    ) : (
                      user.profile.medicalNotes && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                          <p className="text-gray-900 dark:text-white">
                            {user.profile.medicalNotes}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Settings Card - for storeAdditionalData API */}
            {isEditing && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Additional Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Favorite Meals (IDs)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Add meal ID (press Enter)"
                        className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            const newMeals = [...(editData.favoriteMeals || []), e.target.value.trim()];
                            setEditData({
                              ...editData, 
                              favoriteMeals: newMeals
                            });
                            e.target.value = '';
                          }
                        }}
                      />
                      <div className="flex flex-wrap gap-2">
                        {(editData.favoriteMeals || []).map((mealId, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 rounded-lg text-sm font-medium flex items-center space-x-1">
                            <span>{mealId}</span>
                            <button
                              onClick={() => {
                                const newMeals = editData.favoriteMeals.filter((_, i) => i !== index);
                                setEditData({
                                  ...editData, 
                                  favoriteMeals: newMeals
                                });
                              }}
                              className="text-purple-600 hover:text-purple-800 ml-1"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Add meal IDs from your favorite meals collection
                      </p>
                    </div>
                  </div>
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
