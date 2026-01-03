import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { flaskAiService } from '../../services/flaskAi.service'
import { pdfService } from '../../services/pdfService'
import { useToast } from '../../contexts/ToastContext'
import { FileText, Sparkles, Calendar, Clock, Download } from 'lucide-react'

const WeeklySummaryPage = () => {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const [weeklyPlans, setWeeklyPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [plansLoading, setPlansLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const generateSummary = async () => {
    if (!selectedPlan) {
      setError('Please select a weekly plan to summarize')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Use the selected AI-generated weekly plan data structure
      const weeklyPlanData = {
        data: {
          userId: user._id,
          weeklyPlan: selectedPlan.data
        },
        message: "OK",
        success: true
      }
      
      const response = await flaskAiService.summarizeWeeklyMeal(user._id, weeklyPlanData)
      
      if (response.success) {
        setSummary(response.data)
      } else {
        throw new Error(response.message || 'Failed to generate summary')
      }
    } catch (error) {
      setError(error.message || 'Failed to generate weekly summary')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!selectedPlan || !summary) {
      showError('Please generate a summary first before downloading PDF')
      return
    }

    try {
      const result = await pdfService.generateWeeklySummaryPDF(selectedPlan, summary)
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

  const renderWeeklyPlan = (planData) => {
    if (!planData) return null
    
    // Handle different data structures
    const weeklyPlan = planData.weeklyPlan || planData
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map(day => (
          <div key={day} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {day}
            </h4>
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {weeklyPlan[day] || 'No plan for this day'}
            </div>
          </div>
        ))}
      </div>
    )
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
          AI Weekly Meal Summary
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select from your existing AI-generated weekly meal plans and get comprehensive summaries
        </p>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          ⚠️ AI-generated content • Review and adapt to your needs
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Weekly Plan Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Select an AI-Generated Weekly Plan
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
          <div className="space-y-4 mb-6">
            {weeklyPlans.map((plan, index) => (
              <div
                key={index}
                onClick={() => setSelectedPlan(plan)}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPlan === plan
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-green-600 mr-2" />
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
                    <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center ml-4">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={generateSummary}
          disabled={loading || !selectedPlan}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          {loading ? 'Generating Summary...' : 'Generate AI Summary'}
        </button>
      </div>

      {/* Selected Plan Display */}
      {selectedPlan && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Selected Weekly Plan
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Weekly Meal Plan
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Generated: {formatDate(selectedPlan.createdAt || selectedPlan.timestamp)}
              </div>
            </div>
            {renderWeeklyPlan(selectedPlan.data)}
          </div>
        </div>
      )}

      {/* Summary Results */}
      {summary && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                AI Weekly Meal Plan Summary
              </h2>
            </div>
            
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
          </div>

          {/* AI Summary Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              {summary.summary ? (
                <div className="space-y-4">
                  {renderMarkdown(summary.summary)}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  No summary content available.
                </p>
              )}
            </div>
          </div>

          {/* Key Improvements Highlight */}
          {summary.keyImprovements && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                🎯 Key Improvements Identified
              </h4>
              <ul className="space-y-2">
                {summary.keyImprovements.map((improvement, index) => (
                  <li key={index} className="text-blue-800 dark:text-blue-200 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Nutritional Highlights */}
          {summary.nutritionalHighlights && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                🥗 Nutritional Highlights
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(summary.nutritionalHighlights).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <div className="font-medium text-green-800 dark:text-green-200 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-green-700 dark:text-green-300">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset Button */}
          <div className="text-center">
            <button
              onClick={() => {
                setSelectedPlan(null)
                setSummary(null)
                setError(null)
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Select Different Plan
            </button>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Disclaimer:</strong> This summary is AI-generated based on your meal plan data. 
              Use it as guidance and adapt recommendations to your personal preferences, dietary needs, 
              and health conditions. For personalized nutrition advice, consult with a registered dietitian 
              or healthcare provider.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WeeklySummaryPage