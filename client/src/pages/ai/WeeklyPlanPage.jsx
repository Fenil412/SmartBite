import { useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { flaskAiService } from '../../services/flaskAi.service'
import { 
  Calendar, 
  Sparkles, 
  Clock, 
  User, 
  Target, 
  AlertTriangle, 
  Copy, 
  Volume2, 
  VolumeX,
  Check,
  ArrowRight,
  Coffee,
  Sun,
  Moon,
  Utensils
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const WeeklyPlanPage = () => {
  const { user } = useAuth()
  const [weeklyPlan, setWeeklyPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(true)
  const [copyStates, setCopyStates] = useState({}) // For copy feedback
  const [speakingDay, setSpeakingDay] = useState(null) // Track which day is being spoken
  const [currentSpeech, setCurrentSpeech] = useState(null) // Track current speech utterance
  const speechRef = useRef(null)
  
  // Constants
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Loading Arrow Animation Component
  const LoadingArrow = () => (
    <motion.div
      className="flex items-center space-x-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        animate={{ x: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="text-white"
      >
        <ArrowRight className="h-5 w-5" />
      </motion.div>
      <span>Generating Plan...</span>
    </motion.div>
  )

  const getMealTypeIcon = (type) => {
    const icons = {
      breakfast: <Coffee className="h-4 w-4" />,
      lunch: <Sun className="h-4 w-4" />,
      snack: <Utensils className="h-4 w-4" />,
      dinner: <Moon className="h-4 w-4" />
    }
    return icons[type] || <Utensils className="h-4 w-4" />
  }

  const getMealEmoji = (type) => {
    const emojis = {
      breakfast: '🌅',
      lunch: '☀️', 
      snack: '🍎',
      dinner: '🌙'
    }
    return emojis[type] || '🍽️'
  }
  
  // Profile form state
  const [profile, setProfile] = useState({
    age: 28,
    gender: 'Male',
    height: 175,
    weight: 72,
    activityLevel: 'Moderately Active',
    dietaryPreference: 'Vegetarian',
    allergies: ['peanuts'],
    diseases: ['Diabetes', 'Hypertension'],
    goals: ['Fat Loss', 'Muscle Retention']
  })

  // Targets form state
  const [targets, setTargets] = useState({
    dailyCalorieTarget: 2200,
    protein: 130,
    carbs: 240,
    fat: 70,
    fiber: 30,
    sodium: 2000,
    sugar: 50
  })

  // Preferences form state
  const [preferences, setPreferences] = useState({
    preferredIngredients: ['Quinoa', 'Lentils', 'Paneer', 'Vegetables'],
    excludedIngredients: ['Sugar', 'Deep Fried']
  })

  const generateWeeklyPlan = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const requestData = {
        userId: user._id,
        profile,
        targets,
        preferences
      }

      const response = await flaskAiService.generateWeeklyPlan(requestData.userId, requestData.profile, requestData.targets)
      
      if (response.success) {
        setWeeklyPlan(response.data)
        setShowForm(false)
      } else {
        throw new Error(response.message || 'Failed to generate weekly plan')
      }
    } catch (error) {
      setError(error.message || 'Failed to generate weekly plan')
    } finally {
      setLoading(false)
    }
  }

  const handleArrayInput = (value, setter, field) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item)
    setter(prev => ({ ...prev, [field]: items }))
  }

  const copyToClipboard = (day, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStates(prev => ({ ...prev, [day]: true }))
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [day]: false }))
      }, 2000)
    }).catch(err => {
      // Copy failed silently
    })
  }

  const toggleSpeech = (day, text) => {
    if ('speechSynthesis' in window) {
      if (speakingDay === day && currentSpeech) {
        // Stop current speech
        speechSynthesis.cancel()
        setSpeakingDay(null)
        setCurrentSpeech(null)
      } else {
        // Stop any ongoing speech and start new one
        speechSynthesis.cancel()
        
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.lang = 'en-US'
        
        utterance.onstart = () => {
          setSpeakingDay(day)
          setCurrentSpeech(utterance)
        }
        
        utterance.onend = () => {
          setSpeakingDay(null)
          setCurrentSpeech(null)
        }
        
        utterance.onerror = () => {
          setSpeakingDay(null)
          setCurrentSpeech(null)
        }
        
        speechSynthesis.speak(utterance)
        setCurrentSpeech(utterance)
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Header - Mobile Optimized */}
      <div className="mb-6 sm:mb-8 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl">
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              AI Weekly Meal Plan Generator
            </h1>
            <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400">
              Generate personalized meal plans powered by artificial intelligence
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-800 max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
            <span className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
              AI-Powered Nutrition Planning
            </span>
          </div>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            Our advanced AI analyzes your profile, dietary preferences, and nutrition goals to create 
            personalized meal plans that fit your lifestyle and health objectives.
          </p>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mr-2 flex-shrink-0" />
            <span className="text-sm sm:text-base text-red-700">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Profile Form */}
      {showForm && (
        <div className="space-y-6 mb-8">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({...profile, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={profile.height}
                  onChange={(e) => setProfile({...profile, height: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={profile.weight}
                  onChange={(e) => setProfile({...profile, weight: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activity Level
                </label>
                <select
                  value={profile.activityLevel}
                  onChange={(e) => setProfile({...profile, activityLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Sedentary">Sedentary</option>
                  <option value="Lightly Active">Lightly Active</option>
                  <option value="Moderately Active">Moderately Active</option>
                  <option value="Very Active">Very Active</option>
                  <option value="Extremely Active">Extremely Active</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dietary Preference
                </label>
                <select
                  value={profile.dietaryPreference}
                  onChange={(e) => setProfile({...profile, dietaryPreference: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Pescatarian">Pescatarian</option>
                  <option value="Keto">Keto</option>
                  <option value="Paleo">Paleo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Allergies (comma-separated)
                </label>
                <input
                  type="text"
                  value={profile.allergies.join(', ')}
                  onChange={(e) => handleArrayInput(e.target.value, setProfile, 'allergies')}
                  placeholder="e.g., peanuts, shellfish, dairy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Health Conditions (comma-separated)
                </label>
                <input
                  type="text"
                  value={profile.diseases.join(', ')}
                  onChange={(e) => handleArrayInput(e.target.value, setProfile, 'diseases')}
                  placeholder="e.g., Diabetes, Hypertension"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Goals (comma-separated)
              </label>
              <input
                type="text"
                value={profile.goals.join(', ')}
                onChange={(e) => handleArrayInput(e.target.value, setProfile, 'goals')}
                placeholder="e.g., Fat Loss, Muscle Retention, Weight Gain"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Nutrition Targets */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Target className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Nutrition Targets
              </h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Calories
                </label>
                <input
                  type="number"
                  value={targets.dailyCalorieTarget}
                  onChange={(e) => setTargets({...targets, dailyCalorieTarget: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={targets.protein}
                  onChange={(e) => setTargets({...targets, protein: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  value={targets.carbs}
                  onChange={(e) => setTargets({...targets, carbs: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fat (g)
                </label>
                <input
                  type="number"
                  value={targets.fat}
                  onChange={(e) => setTargets({...targets, fat: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fiber (g)
                </label>
                <input
                  type="number"
                  value={targets.fiber}
                  onChange={(e) => setTargets({...targets, fiber: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sodium (mg)
                </label>
                <input
                  type="number"
                  value={targets.sodium}
                  onChange={(e) => setTargets({...targets, sodium: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sugar (g)
                </label>
                <input
                  type="number"
                  value={targets.sugar}
                  onChange={(e) => setTargets({...targets, sugar: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Food Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Food Preferences
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Ingredients (comma-separated)
                </label>
                <input
                  type="text"
                  value={preferences.preferredIngredients.join(', ')}
                  onChange={(e) => handleArrayInput(e.target.value, setPreferences, 'preferredIngredients')}
                  placeholder="e.g., Quinoa, Lentils, Paneer, Vegetables"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excluded Ingredients (comma-separated)
                </label>
                <input
                  type="text"
                  value={preferences.excludedIngredients.join(', ')}
                  onChange={(e) => handleArrayInput(e.target.value, setPreferences, 'excludedIngredients')}
                  placeholder="e.g., Sugar, Deep Fried"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={generateWeeklyPlan}
              disabled={loading}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? <LoadingArrow /> : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Weekly Plan
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Weekly Plan Grid */}
      {weeklyPlan && !showForm && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Your AI-Generated Weekly Plan
            </h2>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Modify Plan
            </button>
          </div>

          <div className="space-y-8">
            {/* Weekly Plan Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                🍽️ Your AI-Generated Weekly Meal Plan
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Personalized meal recommendations based on your profile, dietary preferences, and nutrition goals.
              </p>
            </div>

            {/* Plan Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">Daily Target</h3>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{targets.dailyCalorieTarget} cal</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200">Diet Type</h3>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{profile.dietaryPreference}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-800 dark:text-purple-200">Plan Duration</h3>
                    <p className="text-lg font-bold text-purple-900 dark:text-purple-100">7 Days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Plan Grid - Horizontal Layout */}
            <div className="space-y-6">
              {days.map((day, index) => (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Day Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {day}
                        </h3>
                        <div className="text-blue-100 text-sm">
                          Day {index + 1} of 7
                        </div>
                      </div>
                      <div className="text-blue-100 text-sm">
                        <Calendar className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Meal Plan Content */}
                  <div className="p-6">
                    {weeklyPlan.weeklyPlan?.[day] ? (
                      <div className="space-y-6">
                        {/* AI Generated Content with Horizontal Meal Layout */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-2 mb-4">
                            <Sparkles className="h-5 w-5 text-yellow-500" />
                            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">AI Meal Recommendations</span>
                          </div>
                          
                          {/* Try to parse meals horizontally if possible, otherwise show as text */}
                          <div className="space-y-4">
                            {/* Check if content has structured meal format */}
                            {weeklyPlan.weeklyPlan[day].includes('Breakfast:') || 
                             weeklyPlan.weeklyPlan[day].includes('**Breakfast') ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map((mealType) => {
                                  const mealRegex = new RegExp(`\\*\\*${mealType}[:\\*]*\\*\\*([\\s\\S]*?)(?=\\*\\*|$)`, 'i')
                                  const altRegex = new RegExp(`${mealType}:([\\s\\S]*?)(?=\\n\\n|\\n[A-Z]|$)`, 'i')
                                  
                                  let mealContent = ''
                                  const match = weeklyPlan.weeklyPlan[day].match(mealRegex) || weeklyPlan.weeklyPlan[day].match(altRegex)
                                  
                                  if (match) {
                                    mealContent = match[1].trim()
                                  }
                                  
                                  if (!mealContent) return null
                                  
                                  return (
                                    <motion.div
                                      key={mealType}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.1 }}
                                      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                      <div className="flex items-center space-x-2 mb-3">
                                        <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
                                          {getMealTypeIcon(mealType.toLowerCase())}
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                            {getMealEmoji(mealType.toLowerCase())} {mealType}
                                          </h4>
                                        </div>
                                      </div>
                                      <div 
                                        className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                                        dangerouslySetInnerHTML={{ 
                                          __html: mealContent.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>')
                                        }}
                                      />
                                    </motion.div>
                                  )
                                })}
                              </div>
                            ) : (
                              /* Fallback to full text display */
                              <div 
                                className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed"
                                dangerouslySetInnerHTML={{ 
                                  __html: weeklyPlan.weeklyPlan[day].replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">$1</strong>')
                                }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Enhanced Quick Actions - Mobile Optimized */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3 sm:space-y-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                            <button
                              onClick={() => copyToClipboard(day, weeklyPlan.weeklyPlan[day])}
                              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-all ${
                                copyStates[day] 
                                  ? 'text-green-600 bg-green-50 dark:bg-green-900/20' 
                                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                              }`}
                              title="Copy meal plan"
                            >
                              {copyStates[day] ? (
                                <>
                                  <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                            
                            <button
                              onClick={() => toggleSpeech(day, weeklyPlan.weeklyPlan[day])}
                              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-all ${
                                speakingDay === day 
                                  ? 'text-red-600 bg-red-50 dark:bg-red-900/20' 
                                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                              }`}
                              title={speakingDay === day ? 'Stop reading' : 'Read aloud'}
                            >
                              {speakingDay === day ? (
                                <>
                                  <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span>Stop</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span>Listen</span>
                                </>
                              )}
                            </button>
                          </div>
                          
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                            <Sparkles className="h-3 w-3" />
                            <span className="hidden sm:inline">Generated by AI • Personalized for you</span>
                            <span className="sm:hidden">AI Generated</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="h-10 w-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                          No meal plan generated for this day
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                          Try regenerating the plan or modifying your profile
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 pt-6 sm:pt-8">
              <button
                onClick={() => setShowForm(true)}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Modify Profile</span>
              </button>
              
              <button
                onClick={generateWeeklyPlan}
                disabled={loading}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                {loading ? <LoadingArrow /> : (
                  <>
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Regenerate Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Plan Summary */}
          {weeklyPlan.summary && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Plan Summary
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {weeklyPlan.summary}
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Disclaimer:</strong> This meal plan is AI-generated based on your profile. 
              Please adjust portions and ingredients based on your specific needs, preferences, and any medical conditions. 
              Consult with a healthcare provider or registered dietitian for personalized nutrition advice.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WeeklyPlanPage