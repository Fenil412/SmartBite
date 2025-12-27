import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Trash2, Clock, ChefHat, Zap, Calendar } from 'lucide-react'
import { constraintService } from '../services/constraintService'
import { useToast } from '../contexts/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'

const ConstraintsPage = () => {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [formData, setFormData] = useState({
    maxCookTime: 30,
    skillLevel: 'beginner',
    appliances: {
      hasGasStove: true,
      hasOven: false,
      hasMicrowave: true,
      hasAirFryer: false,
      hasBlender: false
    },
    cookingDays: []
  })

  const skillLevels = [
    { value: 'beginner', label: 'Beginner', description: 'Simple recipes with basic techniques' },
    { value: 'intermediate', label: 'Intermediate', description: 'Moderate complexity with some advanced techniques' },
    { value: 'advanced', label: 'Advanced', description: 'Complex recipes requiring advanced skills' }
  ]

  const appliances = [
    { key: 'hasGasStove', label: 'Gas Stove', icon: '🔥' },
    { key: 'hasOven', label: 'Oven', icon: '🔥' },
    { key: 'hasMicrowave', label: 'Microwave', icon: '📡' },
    { key: 'hasAirFryer', label: 'Air Fryer', icon: '💨' },
    { key: 'hasBlender', label: 'Blender', icon: '🌪️' }
  ]

  const weekdays = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' }
  ]

  useEffect(() => {
    loadConstraints()
  }, [])

  const loadConstraints = async () => {
    try {
      setLoading(true)
      console.log('🔍 DEBUG: Loading constraints')
      
      const response = await constraintService.getMyConstraints()
      
      console.log('🔍 DEBUG: Load response:', response)
      
      if (response.success) {
        const constraints = response.data.constraint
        console.log('🔍 DEBUG: Constraints data:', constraints)
        
        setFormData({
          maxCookTime: constraints.maxCookTime || 30,
          skillLevel: constraints.skillLevel || 'beginner',
          appliances: {
            hasGasStove: constraints.appliances?.hasGasStove ?? true,
            hasOven: constraints.appliances?.hasOven ?? false,
            hasMicrowave: constraints.appliances?.hasMicrowave ?? true,
            hasAirFryer: constraints.appliances?.hasAirFryer ?? false,
            hasBlender: constraints.appliances?.hasBlender ?? false
          },
          cookingDays: constraints.cookingDays || []
        })
      }
    } catch (err) {
      console.error('🔍 DEBUG: Load error:', err)
      error(err.message || 'Failed to load constraints')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      console.log('🔍 DEBUG: Saving constraints:', formData)
      
      const response = await constraintService.upsertConstraints(formData)
      
      console.log('🔍 DEBUG: Save response:', response)
      
      if (response.success) {
        success('Constraints saved successfully!')
      }
    } catch (err) {
      console.error('🔍 DEBUG: Save error:', err)
      error(err.message || 'Failed to save constraints')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      console.log('🔍 DEBUG: Deleting constraints')
      
      const response = await constraintService.deleteConstraints()
      
      console.log('🔍 DEBUG: Delete response:', response)
      
      if (response.success) {
        success('Constraints deleted successfully!')
        // Reset to defaults
        setFormData({
          maxCookTime: 30,
          skillLevel: 'beginner',
          appliances: {
            hasGasStove: true,
            hasOven: false,
            hasMicrowave: true,
            hasAirFryer: false,
            hasBlender: false
          },
          cookingDays: []
        })
        setShowDeleteConfirm(false)
      }
    } catch (err) {
      console.error('🔍 DEBUG: Delete error:', err)
      error(err.message || 'Failed to delete constraints')
    } finally {
      setDeleting(false)
    }
  }

  const handleApplianceToggle = (applianceKey) => {
    setFormData(prev => ({
      ...prev,
      appliances: {
        ...prev.appliances,
        [applianceKey]: !prev.appliances[applianceKey]
      }
    }))
  }

  const handleCookingDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      cookingDays: prev.cookingDays.includes(day)
        ? prev.cookingDays.filter(d => d !== day)
        : [...prev.cookingDays, day]
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="Loading constraints..." />
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Cooking Constraints
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Set your cooking preferences to help our AI generate personalized meal recommendations
        </p>
      </motion.div>

      <div className="space-y-8">
        {/* Max Cook Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Maximum Cooking Time
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">
                {formData.maxCookTime} minutes
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                How long are you willing to spend cooking?
              </span>
            </div>
            
            <input
              type="range"
              min="10"
              max="180"
              step="5"
              value={formData.maxCookTime}
              onChange={(e) => setFormData(prev => ({ ...prev, maxCookTime: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>10 min</span>
              <span>3 hours</span>
            </div>
          </div>
        </motion.div>

        {/* Skill Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-2 mb-6">
            <ChefHat className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Cooking Skill Level
            </h2>
          </div>
          
          <div className="space-y-4">
            {skillLevels.map(skill => (
              <label
                key={skill.value}
                className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  formData.skillLevel === skill.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="skillLevel"
                  value={skill.value}
                  checked={formData.skillLevel === skill.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, skillLevel: e.target.value }))}
                  className="mt-1 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {skill.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {skill.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Appliances */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-2 mb-6">
            <Zap className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Available Appliances
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appliances.map(appliance => (
              <label
                key={appliance.key}
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  formData.appliances[appliance.key]
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.appliances[appliance.key]}
                  onChange={() => handleApplianceToggle(appliance.key)}
                  className="text-green-600 focus:ring-green-500 rounded"
                />
                <span className="text-2xl">{appliance.icon}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {appliance.label}
                </span>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Cooking Days */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Preferred Cooking Days
            </h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Select the days when you prefer to cook meals
          </p>
          
          <div className="flex flex-wrap gap-3">
            {weekdays.map(day => (
              <button
                key={day.value}
                onClick={() => handleCookingDayToggle(day.value)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  formData.cookingDays.includes(day.value)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
          
          {formData.cookingDays.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              No specific preference - any day is fine
            </p>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex justify-between items-center"
        >
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="flex items-center space-x-2 px-6 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
            <span>Reset to Defaults</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Constraints'}</span>
          </button>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reset Constraints?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will delete your current constraints and reset them to default values. This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConstraintsPage