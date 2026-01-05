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
  Eye,
  Filter,
  ChevronDown,
  RefreshCw
} from 'lucide-react'

const AiHistoryPage = () => {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeFilter, setTimeFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    loadHistory()
    
    // Set up auto-refresh every 30 seconds to show latest data
    const interval = setInterval(() => {
      loadHistory()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [user])

  // Add manual refresh function
  const refreshHistory = () => {
    loadHistory()
  }

  const loadHistory = async () => {
    if (!user?._id) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await flaskAiService.getHistory(user._id)
      
      if (response.success && response.data) {
        // Transform API response to match frontend expectations
        const transformedHistory = (response.data || []).map(item => {
          const transformed = {
            ...item,
            type: item.action || item.type, // Map 'action' to 'type', fallback to existing type
            timestamp: item.createdAt || item.timestamp, // Map 'createdAt' to 'timestamp', fallback to existing
            username: item.username || user.username || 'Unknown User'
          }
          return transformed
        })
        
        // Sort by timestamp in descending order (newest first)
        transformedHistory.sort((a, b) => {
          const dateA = new Date(a.timestamp)
          const dateB = new Date(b.timestamp)
          return dateB - dateA // Newest first
        })
        
        setHistory(transformedHistory)
        setLastUpdated(new Date())
      } else {
        setHistory([])
      }
    } catch (error) {
      console.error('Failed to load AI history:', error)
      setError(error.message || 'Failed to load AI history')
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type) => {
    if (!type) return <FileText className="h-5 w-5" />
    
    const icons = {
      'meal_analysis': BarChart3,
      'weekly_plan': Calendar,
      'health_risk_report': AlertTriangle,
      'chat': MessageSquare,
      'nutrition_impact_summary': Heart,
      'Summarize weekly meal': FileText,
      'analyze-meals': BarChart3,
      'generate-weekly-plan': Calendar,
      'health-risk-report': AlertTriangle,
      'chat/generateResponse': MessageSquare,
      'summarize-weekly-meal': FileText,
      'nutrition-impact-summary': Heart
    }
    const IconComponent = icons[type] || FileText
    return <IconComponent className="h-5 w-5" />
  }

  const getActivityColor = (type) => {
    if (!type) return 'text-gray-600 bg-gray-100'
    
    const colors = {
      'meal_analysis': 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
      'weekly_plan': 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
      'health_risk_report': 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
      'chat': 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20',
      'nutrition_impact_summary': 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/20',
      'Summarize weekly meal': 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
      'analyze-meals': 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
      'generate-weekly-plan': 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
      'health-risk-report': 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
      'chat/generateResponse': 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20',
      'summarize-weekly-meal': 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
      'nutrition-impact-summary': 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/20'
    }
    return colors[type] || 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid date'
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
  }

  const getActivityTitle = (type) => {
    if (!type) return 'Unknown Activity'
    
    const titles = {
      'meal_analysis': 'Meal Analysis',
      'weekly_plan': 'Weekly Plan Generation', 
      'health_risk_report': 'Health Risk Report',
      'chat': 'AI Chat',
      'Summarize weekly meal': 'Weekly Meal Summary',
      'nutrition_impact_summary': 'Nutrition Impact Summary',
      'analyze-meals': 'Meal Analysis',
      'generate-weekly-plan': 'Weekly Plan Generation',
      'health-risk-report': 'Health Risk Report',
      'chat/generateResponse': 'AI Chat',
      'summarize-weekly-meal': 'Weekly Meal Summary',
      'nutrition-impact-summary': 'Nutrition Impact Summary'
    }
    
    return titles[type] || type.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Time-based filtering - Fixed logic
  const filterByTime = (items) => {
    if (timeFilter === 'all') return items
    
    const now = new Date()
    
    return items.filter(item => {
      const itemDate = new Date(item.timestamp)
      if (isNaN(itemDate.getTime())) return false // Skip invalid dates
      
      switch (timeFilter) {
        case 'today': {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          return itemDate >= today
        }
        case 'week': {
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
          weekStart.setHours(0, 0, 0, 0)
          return itemDate >= weekStart
        }
        case 'month': {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          monthStart.setHours(0, 0, 0, 0)
          return itemDate >= monthStart
        }
        default:
          return true
      }
    })
  }

  // Type-based filtering
  const filterByType = (items) => {
    if (typeFilter === 'all') return items
    return items.filter(item => item.type === typeFilter)
  }

  // Apply both filters
  const filteredHistory = filterByType(filterByTime(history))

  const uniqueTypes = [...new Set(history.map(item => item.type))]

  // Fixed time filter options with proper counting
  const timeFilterOptions = [
    { value: 'all', label: 'All Time', count: history.length },
    { 
      value: 'today', 
      label: 'Today', 
      count: history.filter(item => {
        const itemDate = new Date(item.timestamp)
        const today = new Date()
        return itemDate.toDateString() === today.toDateString()
      }).length 
    },
    { 
      value: 'week', 
      label: 'This Week', 
      count: history.filter(item => {
        const itemDate = new Date(item.timestamp)
        const now = new Date()
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        weekStart.setHours(0, 0, 0, 0)
        return itemDate >= weekStart
      }).length 
    },
    { 
      value: 'month', 
      label: 'This Month', 
      count: history.filter(item => {
        const itemDate = new Date(item.timestamp)
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        return itemDate >= monthStart
      }).length 
    }
  ]

  const clearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all AI history? This action cannot be undone.')) {
      return
    }
    
    try {
      // Clear history functionality would be implemented here
    } catch (error) {
      // Handle clear history error
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
              {lastUpdated && (
                <span className="block text-xs text-gray-500 mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshHistory}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
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
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Time Filter Dropdown */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Time Filter */}
          <div className="relative">
            <button
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="flex items-center justify-between w-48 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  {timeFilterOptions.find(opt => opt.value === timeFilter)?.label || 'All Time'}
                </span>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showTimeDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showTimeDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                {timeFilterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTimeFilter(option.value)
                      setShowTimeDropdown(false)
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      timeFilter === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      <span className="text-sm text-gray-500">({option.count})</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Type Filter Pills */}
          {uniqueTypes.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                All Types ({history.length})
              </button>
              {uniqueTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    typeFilter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {getActivityTitle(type)} ({history.filter(item => item.type === type).length})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Clock className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {history.length === 0 ? 'No AI history yet' : 'No activities found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {history.length === 0 
              ? 'Start using AI features to see your history here'
              : 'Try adjusting your filters to see more activities'
            }
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
                      {(item.type === 'chat' || item.type === 'chat/generateResponse') && item.data?.question && (
                        <p className="line-clamp-2">
                          <span className="font-medium">Q:</span> {item.data.question}
                        </p>
                      )}
                      {(item.type === 'meal_analysis' || item.type === 'analyze-meals') && item.data && (
                        <p>
                          Analyzed meal: {item.data.analysis?.[0]?.mealName || 'Meal analysis completed'}
                        </p>
                      )}
                      {(item.type === 'weekly_plan' || item.type === 'generate-weekly-plan') && item.data?.weeklyPlan && (
                        <p>
                          Generated weekly meal plan with {Object.keys(item.data.weeklyPlan).length} days
                        </p>
                      )}
                      {(item.type === 'health_risk_report' || item.type === 'health-risk-report') && item.data && (
                        <p>
                          Health risk assessment: {Array.isArray(item.data.detectedRisks) ? item.data.detectedRisks.length : 0} risks detected
                        </p>
                      )}
                      {(item.type === 'Summarize weekly meal' || item.type === 'summarize-weekly-meal' || item.type === 'nutrition_impact_summary' || item.type === 'nutrition-impact-summary') && item.data && (
                        <p className="line-clamp-2">
                          {typeof item.data.summary === 'string' ? item.data.summary.substring(0, 100) + '...' : 'Summary generated'}
                        </p>
                      )}
                      {item.username && (
                        <p className="text-xs text-gray-500 mt-1">
                          User: {item.username}
                        </p>
                      )}
                      {!item.data && (
                        <p className="text-gray-500 italic">No preview available</p>
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
                {selectedItem?.data ? JSON.stringify(selectedItem.data, null, 2) : 'No data available'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AiHistoryPage