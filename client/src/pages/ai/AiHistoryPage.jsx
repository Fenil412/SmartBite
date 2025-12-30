import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { flaskAiService } from '../../services/flaskAi.service'
import { 
  Clock, 
  BarChart3, 
  MessageSquare,
  FileText,
  Heart,
  AlertTriangle,
  Calendar,
  Trash2,
  Eye
} from 'lucide-react'

const AiHistoryPage = () => {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    loadHistory()
  }, [user])

  const loadHistory = async () => {
    if (!user?._id) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await flaskAiService.getHistory(user._id)
      
      if (response.success) {
        setHistory(response.data || [])
      } else {
        throw new Error(response.message || 'Failed to load history')
      }
    } catch (error) {
      console.error('Failed to load AI history:', error)
      setError(error.message || 'Failed to load AI history')
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type) => {
    const icons = {
      'meal_analysis': BarChart3,
      'weekly_plan': Calendar,
      'health_risk_report': AlertTriangle,
      'chat': MessageSquare,
      'Summarize weekly meal': FileText,
      'nutrition_impact_summary': Heart
    }
    const IconComponent = icons[type] || FileText
    return <IconComponent className="h-5 w-5" />
  }

  const getActivityColor = (type) => {
    const colors = {
      'meal_analysis': 'text-blue-600 bg-blue-100',
      'weekly_plan': 'text-green-600 bg-green-100',
      'health_risk_report': 'text-red-600 bg-red-100',
      'chat': 'text-purple-600 bg-purple-100',
      'Summarize weekly meal': 'text-yellow-600 bg-yellow-100',
      'nutrition_impact_summary': 'text-pink-600 bg-pink-100'
    }
    return colors[type] || 'text-gray-600 bg-gray-100'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityTitle = (type) => {
    const titles = {
      'meal_analysis': 'Meal Analysis',
      'weekly_plan': 'Weekly Plan Generation',
      'health_risk_report': 'Health Risk Report',
      'chat': 'AI Chat',
      'Summarize weekly meal': 'Weekly Meal Summary',
      'nutrition_impact_summary': 'Nutrition Impact Summary'
    }
    return titles[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true
    return item.type === filter
  })

  const uniqueTypes = [...new Set(history.map(item => item.type))]

  const clearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all AI history? This action cannot be undone.')) {
      return
    }
    
    try {
      // Note: This would need to be implemented in the Flask service
      console.log('Clear history functionality would be implemented here')
      // await flaskAiService.clearHistory(user._id)
      // setHistory([])
    } catch (error) {
      console.error('Failed to clear history:', error)
    }
  }

  const viewDetails = (item) => {
    setSelectedItem(item)
  }

  const closeDetails = () => {
    setSelectedItem(null)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              AI History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View your AI interactions and generated content
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </button>
          )}
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

      {/* Filters */}
      {uniqueTypes.length > 1 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              All ({history.length})
            </button>
            {uniqueTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {getActivityTitle(type)} ({history.filter(item => item.type === type).length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Clock className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No AI history yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start using AI features to see your history here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-2 rounded-lg ${getActivityColor(item.type)}`}>
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {getActivityTitle(item.type)}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(item.timestamp)}
                      </div>
                    </div>
                    
                    {/* Preview content based on type */}
                    <div className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {item.type === 'chat' && item.data?.question && (
                        <p className="line-clamp-2">
                          <span className="font-medium">Q:</span> {item.data.question}
                        </p>
                      )}
                      {item.type === 'meal_analysis' && item.data?.results && (
                        <p>
                          Analyzed {item.data.results.length} meal{item.data.results.length !== 1 ? 's' : ''}
                        </p>
                      )}
                      {item.type === 'weekly_plan' && item.data?.weeklyPlan && (
                        <p>
                          Generated weekly meal plan with {Object.keys(item.data.weeklyPlan).length} days
                        </p>
                      )}
                      {item.type === 'health_risk_report' && item.data?.overallRisk && (
                        <p>
                          Health risk assessment: {item.data.overallRisk} risk level
                        </p>
                      )}
                      {(item.type === 'Summarize weekly meal' || item.type === 'nutrition_impact_summary') && item.data?.summary && (
                        <p className="line-clamp-2">
                          {typeof item.data.summary === 'string' ? item.data.summary : 'Summary generated'}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => viewDetails(item)}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {getActivityTitle(selectedItem.type)}
                </h2>
                <button
                  onClick={closeDetails}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatDate(selectedItem.timestamp)}
              </p>
            </div>
            <div className="p-6">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(selectedItem.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AiHistoryPage