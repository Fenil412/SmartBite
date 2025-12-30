import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { mealService } from '../../services/mealService'
import { flaskAiService } from '../../services/flaskAi.service'
import { 
  AlertTriangle, 
  ShieldCheck, 
  Heart,
  Eye 
} from 'lucide-react'

const HealthRiskPage = () => {
  const { user } = useAuth()
  const [meals, setMeals] = useState([])
  const [selectedMeals, setSelectedMeals] = useState([])
  const [riskReport, setRiskReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mealsLoading, setMealsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadMeals()
  }, [])

  const loadMeals = async () => {
    try {
      setMealsLoading(true)
      const response = await mealService.getAllMeals()
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

  const generateRiskReport = async () => {
    if (!selectedMeals.length) {
      setError('Please select at least one meal to analyze')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await flaskAiService.getHealthRiskReport(user._id, selectedMeals)
      
      if (response.success) {
        setRiskReport(response.data)
      } else {
        throw new Error(response.message || 'Risk analysis failed')
      }
    } catch (error) {
      console.error('Risk analysis failed:', error)
      setError(error.message || 'Failed to generate risk report')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    const colors = {
      'High': 'text-red-600 bg-red-100',
      'Medium': 'text-yellow-600 bg-yellow-100',
      'Low': 'text-green-600 bg-green-100'
    }
    return colors[severity] || 'text-gray-600 bg-gray-100'
  }

  const getSeverityIcon = (severity) => {
    if (severity === 'High') return <AlertTriangle className="h-5 w-5" />
    if (severity === 'Medium') return <Eye className="h-5 w-5" />
    return <ShieldCheck className="h-5 w-5" />
  }

  const getRiskTypeIcon = (type) => {
    const icons = {
      'cardiovascular': '❤️',
      'diabetes': '🩸',
      'obesity': '⚖️',
      'digestive': '🫃',
      'nutritional': '🥗',
      'metabolic': '⚡'
    }
    return icons[type.toLowerCase()] || '⚠️'
  }

  if (mealsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
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
          AI Health Risk Report
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Get AI-powered health risk analysis for your selected meals
        </p>
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
          ⚠️ AI-generated analysis • Not medical advice • Consult healthcare providers
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
          Select Meals for Risk Analysis ({selectedMeals.length} selected)
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
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {meal.name}
                    </h3>
                    {isSelected && (
                      <div className="h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
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
          onClick={generateRiskReport}
          disabled={loading || selectedMeals.length === 0}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Heart className="h-5 w-5 mr-2" />
          {loading ? 'Analyzing Risks...' : 'Generate Risk Report'}
        </button>
      </div>

      {/* Risk Report Results */}
      {riskReport && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Health Risk Analysis
          </h2>

          {/* Summary Totals */}
          {riskReport.summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">
                  {riskReport.summary.highRisk || 0}
                </div>
                <div className="text-sm text-red-700 dark:text-red-400">High Risk Issues</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {riskReport.summary.mediumRisk || 0}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-400">Medium Risk Issues</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {riskReport.summary.lowRisk || 0}
                </div>
                <div className="text-sm text-green-700 dark:text-green-400">Low Risk Issues</div>
              </div>
            </div>
          )}

          {/* Risk Cards */}
          {riskReport.risks && riskReport.risks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Identified Risks
              </h3>
              
              {riskReport.risks.map((risk, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getRiskTypeIcon(risk.type)}</span>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {risk.type} Risk
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {risk.description}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getSeverityColor(risk.severity)}`}>
                      {getSeverityIcon(risk.severity)}
                      <span className="ml-1">{risk.severity}</span>
                    </div>
                  </div>

                  {/* Affected Meals */}
                  {risk.affectedMeals && risk.affectedMeals.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Affected Meals:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {risk.affectedMeals.map((mealName, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            {mealName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {risk.recommendations && risk.recommendations.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recommendations:
                      </div>
                      <ul className="space-y-1">
                        {risk.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400">
                            • {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Insights List */}
          {riskReport.insights && riskReport.insights.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Health Insights
              </h3>
              <ul className="space-y-2">
                {riskReport.insights.map((insight, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medical Disclaimer */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  Important Medical Disclaimer
                </h3>
                <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                  <p>
                    This health risk analysis is AI-generated and for informational purposes only. 
                    It is not intended as medical advice, diagnosis, or treatment.
                  </p>
                  <p>
                    Always consult with qualified healthcare professionals before making dietary changes, 
                    especially if you have existing health conditions or concerns.
                  </p>
                  <p>
                    Individual health needs vary significantly, and this analysis cannot account for 
                    your complete medical history, current medications, or personal health circumstances.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HealthRiskPage