import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { flaskAiService } from '../../services/flaskAi.service'
import { pdfService } from '../../services/pdfService'
import { useToast } from '../../contexts/ToastContext'
import { 
  Heart, 
  Zap, 
  Scale, 
  Clock,
  AlertTriangle,
  Calendar,
  FileText,
  Download
} from 'lucide-react'

const NutritionImpactPage = () => {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const [weeklyPlans, setWeeklyPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [healthRiskReports, setHealthRiskReports] = useState([])
  const [selectedHealthRisk, setSelectedHealthRisk] = useState(null)
  const [impactSummary, setImpactSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [plansLoading, setPlansLoading] = useState(true)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(1) // 1: select plan, 2: select health risk, 3: show impact

  useEffect(() => {
    loadWeeklyPlans()
  }, [user])

  const loadWeeklyPlans = async () => {
    if (!user?._id) return
    
    try {
      setPlansLoading(true)
      setError(null)
      const response = await flaskAiService.getWeeklyPlans(user._id)
      
      if (response.success && response.data) {
        // The data should already be filtered for weekly plans
        const weeklyPlanEntries = response.data.filter(item => 
          item.data && (item.data.weeklyPlan || item.data.Monday || item.data.Tuesday)
        )
        
        // Sort by newest first (should already be sorted by backend)
        weeklyPlanEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        setWeeklyPlans(weeklyPlanEntries)
      } else {
        setWeeklyPlans([])
      }
    } catch (error) {
      setError('Failed to load weekly plans. Please try again.')
      setWeeklyPlans([])
    } finally {
      setPlansLoading(false)
    }
  }

  const loadHealthRiskReports = async () => {
    if (!user?._id) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await flaskAiService.getHealthRiskReports(user._id)
      
      if (response.success && response.data) {
        // The data should already be filtered for health risk reports
        const healthRiskEntries = response.data.filter(item => 
          item.data && (item.data.detectedRisks !== undefined || item.data.summary)
        )
        
        // Sort by newest first (should already be sorted by backend)
        healthRiskEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        setHealthRiskReports(healthRiskEntries)
        setStep(2)
      } else {
        setHealthRiskReports([])
        setStep(2)
      }
    } catch (error) {
      console.error('Failed to load health risk reports:', error)
      setError('Failed to load health risk reports. Please try again.')
      setHealthRiskReports([])
    } finally {
      setLoading(false)
    }
  }

  const generateNutritionImpact = async () => {
    if (!selectedPlan || !selectedHealthRisk) return

    try {
      setLoading(true)
      setError(null)
      
      // Use the exact data structure as specified by the user
      const weeklyPlanData = {
        data: {
          userId: user._id,
          weeklyPlan: selectedPlan.data
        },
        message: "OK",
        success: true
      }

      const healthRiskData = {
        data: selectedHealthRisk.data,
        message: "OK", 
        success: true
      }
      
      const response = await flaskAiService.getNutritionImpactSummary(
        user._id, 
        weeklyPlanData,
        healthRiskData
      )
      
      if (response.success) {
        setImpactSummary(response.data)
        setStep(3)
      } else {
        throw new Error(response.message || 'Failed to generate nutrition impact summary')
      }
    } catch (error) {
      setError(error.message || 'Failed to generate nutrition impact summary')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!selectedPlan || !selectedHealthRisk || !impactSummary) {
      showError('Please generate an impact summary first before downloading PDF')
      return
    }

    try {
      const result = await pdfService.generateNutritionImpactPDF(selectedPlan, selectedHealthRisk, impactSummary)
      if (result.success) {
        success(`PDF downloaded successfully: ${result.filename}`)
      }
    } catch (error) {
      showError(`Failed to generate PDF: ${error.message}`)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderMarkdown = (text) => {
    if (!text) return null
    
    // Simple markdown rendering for basic formatting
    return text
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{line.slice(2)}</h1>
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{line.slice(3)}</h2>
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-medium text-gray-900 dark:text-white mb-2">{line.slice(4)}</h3>
        }
        
        // Bold text
        const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        
        // Bullet points
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <li key={index} className="text-gray-700 dark:text-gray-300 mb-1" 
                dangerouslySetInnerHTML={{ __html: boldText.slice(2) }} />
          )
        }
        
        // Regular paragraphs
        if (line.trim()) {
          return (
            <p key={index} className="text-gray-700 dark:text-gray-300 mb-3" 
               dangerouslySetInnerHTML={{ __html: boldText }} />
          )
        }
        
        return <br key={index} />
      })
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
          Select from your existing AI-generated weekly meal plans and get comprehensive health impact analysis
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
            <span className="ml-2">Health Risk Selection</span>
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

      {/* Step 1: Weekly Plan Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Step 1: Select an AI-Generated Weekly Plan
          </h2>
          
          {weeklyPlans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No AI Weekly Plans Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate a weekly meal plan first using the AI Weekly Plan feature
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {weeklyPlans.map((plan, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPlan === plan
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          AI Weekly Meal Plan #{index + 1}
                        </h3>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <Clock className="h-4 w-4 mr-1" />
                        Generated on {formatDate(plan.createdAt || plan.timestamp)}
                      </div>
                      
                      {/* Preview of the plan */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Plan Preview:
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday'].map(day => (
                            <div key={day} className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">{day.slice(0,3)}:</span>
                              <div className="truncate">
                                {plan.data?.[day]?.split('\n')[0]?.replace(/\*\*/g, '') || 'No plan'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {plan.username && (
                        <div className="text-xs text-gray-500 mt-2">
                          Created by: {plan.username}
                        </div>
                      )}
                    </div>
                    
                    {selectedPlan === plan && (
                      <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center ml-4">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              if (selectedPlan) {
                loadHealthRiskReports()
              } else {
                setError('Please select a weekly plan first')
              }
            }}
            disabled={!selectedPlan}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Heart className="h-5 w-5 mr-2" />
            Continue to Health Risk Selection
          </button>
        </div>
      )}

      {/* Step 2: Select Health Risk Report */}
      {step === 2 && selectedPlan && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Step 2: Select a Health Risk Report
          </h2>
          
          {/* Selected Weekly Plan Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Selected Weekly Plan:
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              Generated: {formatDate(selectedPlan.createdAt || selectedPlan.timestamp)}
            </div>
          </div>

          {healthRiskReports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Health Risk Reports Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate a health risk report first using the Health Risk Report feature
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Select a Health Risk Report:
              </h3>
              {healthRiskReports.map((report, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedHealthRisk(report)}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedHealthRisk === report
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Heart className="h-5 w-5 text-red-600 mr-2" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Health Risk Report #{index + 1}
                        </h4>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <Clock className="h-4 w-4 mr-1" />
                        Generated on {formatDate(report.createdAt)}
                      </div>
                      
                      {/* Preview of the report */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Report Summary:
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                          <div className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Risks:</span>
                            <div>{Array.isArray(report.data?.detectedRisks) ? report.data.detectedRisks.length : 0}</div>
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Calories:</span>
                            <div>{report.data?.summary?.totalCalories || 0}</div>
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Protein:</span>
                            <div>{report.data?.summary?.totalProtein || 0}g</div>
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Fiber:</span>
                            <div>{report.data?.summary?.totalFiber || 0}g</div>
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Sodium:</span>
                            <div>{report.data?.summary?.totalSodium || 0}mg</div>
                          </div>
                        </div>
                      </div>
                      
                      {report.username && (
                        <div className="text-xs text-gray-500 mt-2">
                          Created by: {report.username}
                        </div>
                      )}
                    </div>
                    
                    {selectedHealthRisk === report && (
                      <div className="h-6 w-6 bg-red-500 rounded-full flex items-center justify-center ml-4">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={generateNutritionImpact}
            disabled={loading || !selectedHealthRisk}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Zap className="h-5 w-5 mr-2" />
            {loading ? 'Generating Impact Summary...' : 'Generate Nutrition Impact Summary'}
          </button>
        </div>
      )}

      {/* Step 3: Nutrition Impact Summary */}
      {step === 3 && selectedHealthRisk && impactSummary && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Step 3: Nutrition Impact Analysis
          </h2>
          
          {/* Selected Plan and Risk Report Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Selected Weekly Plan:
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                Generated: {formatDate(selectedPlan.createdAt)}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                Selected Health Risk Report:
              </h3>
              <div className="text-sm text-red-800 dark:text-red-200">
                Generated: {formatDate(selectedHealthRisk.createdAt)}
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Health Risk Analysis Summary
            </h3>
            
            {selectedHealthRisk.data?.summary && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedHealthRisk.data.summary.totalCalories || 0}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-400">Total Calories</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedHealthRisk.data.summary.totalProtein || 0}g
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-400">Protein</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {selectedHealthRisk.data.summary.totalFiber || 0}g
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-400">Fiber</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {selectedHealthRisk.data.summary.totalSodium || 0}mg
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-400">Sodium</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedHealthRisk.data.summary.totalSugar || 0}g
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-400">Sugar</div>
                </div>
              </div>
            )}
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Ready to generate comprehensive nutrition impact summary using selected weekly plan and health risk report.
            </p>
          </div>

          {!impactSummary && (
            <button
              onClick={generateNutritionImpact}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Zap className="h-5 w-5 mr-2" />
              {loading ? 'Generating Impact Summary...' : 'Generate Nutrition Impact Summary'}
            </button>
          )}

          {/* Nutrition Impact Summary Results */}
          {impactSummary && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Comprehensive Nutrition Impact Analysis
                </h3>
                
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </button>
              </div>

              {/* Main AI Summary */}
              {impactSummary.summary && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      AI Nutrition Impact Summary
                    </h4>
                  </div>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="space-y-4">
                      {renderMarkdown(impactSummary.summary)}
                    </div>
                  </div>
                </div>
              )}

              {/* Timeframe */}
              {impactSummary.timeframe && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Clock className="h-6 w-6 text-purple-600 mr-2" />
                    <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                      Expected Timeline
                    </h4>
                  </div>
                  <p className="text-purple-800 dark:text-purple-200">
                    {impactSummary.timeframe}
                  </p>
                </div>
              )}

              {/* Medical Disclaimer */}
              {impactSummary.note && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                      {impactSummary.note}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reset Button */}
          <div className="text-center">
            <button
              onClick={() => {
                setStep(1)
                setSelectedPlan(null)
                setSelectedHealthRisk(null)
                setImpactSummary(null)
                setError(null)
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Analyze Another Plan
            </button>
          </div>

          {/* Non-Medical Disclaimer */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
              <div>
                <h4 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  Important Health Disclaimer
                </h4>
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
        </div>
      )}
    </div>
  )
}

export default NutritionImpactPage