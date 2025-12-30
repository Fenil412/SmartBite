import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { mealPlanService } from '../../services/mealPlanService'
import { flaskAiService } from '../../services/flaskAi.service'
import { 
  Heart, 
  Zap, 
  Scale, 
  Clock,
  AlertTriangle 
} from 'lucide-react'

const NutritionImpactPage = () => {
  const { user } = useAuth()
  const [mealPlans, setMealPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [healthRiskData, setHealthRiskData] = useState(null)
  const [impactSummary, setImpactSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [plansLoading, setPlansLoading] = useState(true)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(1) // 1: select plan, 2: get risk data, 3: show impact

  useEffect(() => {
    loadMealPlans()
  }, [])

  const loadMealPlans = async () => {
    try {
      setPlansLoading(true)
      const response = await mealPlanService.getUserMealPlans()
      if (response.success) {
        setMealPlans(response.data || [])
      }
    } catch (error) {
      console.error('Failed to load meal plans:', error)
      setError('Failed to load meal plans')
    } finally {
      setPlansLoading(false)
    }
  }

  const generateHealthRisk = async () => {
    if (!selectedPlan) return

    try {
      setLoading(true)
      setError(null)

      // Extract meals from the selected plan
      const meals = []
      selectedPlan.days?.forEach(day => {
        day.meals?.forEach(mealEntry => {
          if (mealEntry.meal) {
            meals.push(mealEntry.meal)
          }
        })
      })

      if (meals.length === 0) {
        throw new Error('No meals found in the selected plan')
      }

      const response = await flaskAiService.getHealthRiskReport(user._id, meals)
      
      if (response.success) {
        setHealthRiskData(response)
        setStep(2)
      } else {
        throw new Error(response.message || 'Failed to generate health risk report')
      }
    } catch (error) {
      console.error('Health risk generation failed:', error)
      setError(error.message || 'Failed to generate health risk report')
    } finally {
      setLoading(false)
    }
  }

  const generateNutritionImpact = async () => {
    if (!selectedPlan || !healthRiskData) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await flaskAiService.getNutritionImpactSummary(
        user._id, 
        { data: { weeklyPlan: selectedPlan } }, 
        healthRiskData
      )
      
      if (response.success) {
        setImpactSummary(response.data)
        setStep(3)
      } else {
        throw new Error(response.message || 'Failed to generate nutrition impact summary')
      }
    } catch (error) {
      console.error('Nutrition impact generation failed:', error)
      setError(error.message || 'Failed to generate nutrition impact summary')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getImpactIcon = (category) => {
    const icons = {
      energy: <Zap className="h-6 w-6" />,
      digestion: <Heart className="h-6 w-6" />,
      weight: <Scale className="h-6 w-6" />,
      muscle: <Scale className="h-6 w-6" />,
      sugar: <Heart className="h-6 w-6" />,
      bp: <Heart className="h-6 w-6" />
    }
    return icons[category] || <Heart className="h-6 w-6" />
  }

  const getImpactColor = (impact) => {
    if (impact?.toLowerCase().includes('positive') || impact?.toLowerCase().includes('good')) {
      return 'text-green-600 bg-green-100'
    }
    if (impact?.toLowerCase().includes('negative') || impact?.toLowerCase().includes('concern')) {
      return 'text-red-600 bg-red-100'
    }
    return 'text-blue-600 bg-blue-100'
  }

  if (plansLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Nutrition Impact Summary
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Get comprehensive insights on how your meal plan affects your health and wellness
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

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2">Select Plan</span>
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2">Risk Analysis</span>
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2">Impact Summary</span>
          </div>
        </div>
      </div>

      {/* Step 1: Meal Plan Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Step 1: Select a Meal Plan
          </h2>
          
          {mealPlans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No meal plans found. Create a meal plan first.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mealPlans.map((plan) => (
                <div
                  key={plan._id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPlan?._id === plan._id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(plan.weekStartDate)} - {formatDate(plan.weekEndDate)}
                      </p>
                      <div className="text-sm text-gray-500 mt-1">
                        {plan.days?.length || 0} days • {plan.totalMeals || 0} meals
                      </div>
                    </div>
                    {selectedPlan?._id === plan._id && (
                      <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={generateHealthRisk}
            disabled={loading || !selectedPlan}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Heart className="h-5 w-5 mr-2" />
            {loading ? 'Analyzing Health Risks...' : 'Continue to Risk Analysis'}
          </button>
        </div>
      )}

      {/* Step 2: Health Risk Analysis */}
      {step === 2 && healthRiskData && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Step 2: Health Risk Analysis Complete
          </h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Risk Analysis Summary
            </h3>
            
            {healthRiskData.data?.summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {healthRiskData.data.summary.highRisk || 0}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-400">High Risk Issues</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {healthRiskData.data.summary.mediumRisk || 0}
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-400">Medium Risk Issues</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {healthRiskData.data.summary.lowRisk || 0}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-400">Low Risk Issues</div>
                </div>
              </div>
            )}
            
            <p className="text-gray-600 dark:text-gray-400">
              Health risk analysis completed. Ready to generate comprehensive nutrition impact summary.
            </p>
          </div>

          <button
            onClick={generateNutritionImpact}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Zap className="h-5 w-5 mr-2" />
            {loading ? 'Generating Impact Summary...' : 'Generate Nutrition Impact Summary'}
          </button>
        </div>
      )}

      {/* Step 3: Nutrition Impact Summary */}
      {step === 3 && impactSummary && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Comprehensive Nutrition Impact Analysis
          </h2>

          {/* Combined Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Energy Impact */}
            {impactSummary.energy && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                    <Zap className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Energy & Metabolism
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {impactSummary.energy}
                </p>
              </div>
            )}

            {/* Digestion Impact */}
            {impactSummary.digestion && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Digestive Health
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {impactSummary.digestion}
                </p>
              </div>
            )}

            {/* Sugar & Blood Pressure */}
            {impactSummary.sugarAndBP && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-red-100 rounded-lg mr-3">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Blood Sugar & Pressure
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {impactSummary.sugarAndBP}
                </p>
              </div>
            )}

            {/* Muscle & Fat */}
            {impactSummary.muscleAndFat && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Scale className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Body Composition
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {impactSummary.muscleAndFat}
                </p>
              </div>
            )}
          </div>

          {/* Estimated Timeframe */}
          {impactSummary.timeframe && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  Expected Timeline
                </h3>
              </div>
              <p className="text-purple-800 dark:text-purple-200">
                {impactSummary.timeframe}
              </p>
            </div>
          )}

          {/* Overall Summary */}
          {impactSummary.overallSummary && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                Overall Health Impact
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                {impactSummary.overallSummary}
              </p>
            </div>
          )}

          {/* Non-Medical Disclaimer */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  Important Health Disclaimer
                </h3>
                <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                  <p>
                    This nutrition impact analysis is AI-generated for informational purposes only. 
                    It is not intended as medical advice, diagnosis, or treatment.
                  </p>
                  <p>
                    Individual responses to dietary changes vary significantly based on genetics, 
                    health status, lifestyle, and other factors not considered in this analysis.
                  </p>
                  <p>
                    Always consult with qualified healthcare professionals, registered dietitians, 
                    or your doctor before making significant dietary changes, especially if you have 
                    existing health conditions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="text-center">
            <button
              onClick={() => {
                setStep(1)
                setSelectedPlan(null)
                setHealthRiskData(null)
                setImpactSummary(null)
                setError(null)
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Analyze Another Plan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NutritionImpactPage