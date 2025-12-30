import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { mealService } from '../../services/mealService'
import { flaskAiService } from '../../services/flaskAi.service'
import { BarChart3, AlertTriangle, CheckCircle } from 'lucide-react'

const MealAnalysisPage = () => {
  const { user } = useAuth()
  const [meals, setMeals] = useState([])
  const [selectedMeals, setSelectedMeals] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mealsLoading, setMealsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load available meals
  useEffect(() => {
    loadMeals()
  }, [])

  const loadMeals = async () => {
    try {
      setMealsLoading(true)
      const response = await mealService.getMeals()
      if (response.success) {
        setMeals(response.data || [])
      }
    } catch (error) {
      console.error('Failed to load meals:', error)
      setError('Failed to load meals')
    } finally {
      setMealsLoading(false)
    }
  }

  const handleMealToggle = (meal) => {
    setSelectedMeals(prev => {
      const isSelected = prev.find(m => m._id === meal._id)
      if (isSelected) {
        return prev.filter(m => m._id !== meal._id)
      } else {
        return [...prev, meal]
      }
    })
  }

  const analyzeMeals = async () => {
    if (!selectedMeals.length) {
      setError('Please select at least one meal to analyze')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await flaskAiService.analyzeMeals(user._id, selectedMeals)
      
      if (response.success) {
        setAnalysis(response.data)
      } else {
        throw new Error(response.message || 'Analysis failed')
      }
    } catch (error) {
      console.error('Meal analysis failed:', error)
      setError(error.message || 'Failed to analyze meals')
    } finally {
      setLoading(false)
    }
  }

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getVerdictBadge = (verdict) => {
    const colors = {
      'Excellent': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Fair': 'bg-yellow-100 text-yellow-800',
      'Poor': 'bg-red-100 text-red-800'
    }
    return colors[verdict] || 'bg-gray-100 text-gray-800'
  }

  if (mealsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Meal Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select meals to get AI-powered nutritional analysis and health insights
        </p>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          ⚠️ AI-generated analysis • Not medical advice
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Meal Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Select Meals to Analyze ({selectedMeals.length} selected)
        </h2>
        
        {meals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No meals available. Create some meals first.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {meals.map((meal) => {
              const isSelected = selectedMeals.find(m => m._id === meal._id)
              return (
                <div
                  key={meal._id}
                  onClick={() => handleMealToggle(meal)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {meal.name}
                    </h3>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {meal.cuisine} • {meal.mealType}
                  </p>
                  <div className="text-sm text-gray-500">
                    {meal.nutrition?.calories || 'N/A'} cal • {meal.cookTime || 'N/A'} min
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button
          onClick={analyzeMeals}
          disabled={loading || selectedMeals.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <BarChart3 className="h-5 w-5 mr-2" />
          {loading ? 'Analyzing...' : 'Analyze Selected Meals'}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Analysis Results
          </h2>

          {/* Results per meal */}
          {analysis.results?.map((result, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {result.mealName || `Meal ${index + 1}`}
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Health Score</div>
                    <div className={`text-2xl font-bold ${getHealthScoreColor(result.healthScore || 0)}`}>
                      {result.healthScore || 0}/100
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getVerdictBadge(result.verdict)}`}>
                    {result.verdict || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Warnings */}
              {result.warnings && result.warnings.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                    Warnings
                  </h4>
                  <ul className="space-y-1">
                    {result.warnings.map((warning, i) => (
                      <li key={i} className="text-sm text-yellow-700 dark:text-yellow-400">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nutrition Breakdown */}
              {result.nutrition && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Nutrition Breakdown
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Calories</div>
                      <div className="font-medium">{result.nutrition.calories || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Protein</div>
                      <div className="font-medium">{result.nutrition.protein || 'N/A'}g</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Carbs</div>
                      <div className="font-medium">{result.nutrition.carbs || 'N/A'}g</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Fat</div>
                      <div className="font-medium">{result.nutrition.fat || 'N/A'}g</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Overall Summary */}
          {analysis.summary && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Overall Summary
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {analysis.summary}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MealAnalysisPage