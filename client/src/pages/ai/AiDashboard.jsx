import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Bot, 
  BarChart3, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  Heart, 
  Clock,
  Sparkles,
  ArrowRight,
  Brain,
  Zap
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { flaskAiService } from '../../services/flaskAi.service'

const AiDashboard = () => {
  const { user } = useAuth()
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentActivity()
  }, [user])

  const loadRecentActivity = async () => {
    if (!user?._id) return
    
    try {
      const response = await flaskAiService.getHistory(user._id)
      if (response.success) {
        // Get last 3 activities
        setRecentActivity((response.data || []).slice(0, 3))
      }
    } catch (error) {
      console.error('Failed to load recent AI activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const aiFeatures = [
    {
      name: 'AI Chat',
      description: 'Chat with our AI nutritionist for personalized advice',
      icon: Bot,
      href: '/dashboard/ai/chat',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      name: 'Meal Analysis',
      description: 'Get detailed nutritional analysis of your meals',
      icon: BarChart3,
      href: '/dashboard/ai/meal-analysis',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      name: 'Weekly Planner',
      description: 'Generate AI-powered weekly meal plans',
      icon: Calendar,
      href: '/dashboard/ai/weekly-plan',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-700 dark:text-purple-300',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      name: 'Health Risk Report',
      description: 'Assess potential health risks from your diet',
      icon: AlertTriangle,
      href: '/dashboard/ai/health-risk',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-700 dark:text-red-300',
      iconColor: 'text-red-600 dark:text-red-400'
    },
    {
      name: 'Weekly Summary',
      description: 'Get AI-generated summaries of your meal plans',
      icon: FileText,
      href: '/dashboard/ai/weekly-summary',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      name: 'Nutrition Impact',
      description: 'Analyze the health impact of your nutrition choices',
      icon: Heart,
      href: '/dashboard/ai/nutrition-impact',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      textColor: 'text-pink-700 dark:text-pink-300',
      iconColor: 'text-pink-600 dark:text-pink-400'
    },
    {
      name: 'AI History',
      description: 'View all your AI interactions and generated content',
      icon: Clock,
      href: '/dashboard/ai/history',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      textColor: 'text-gray-700 dark:text-gray-300',
      iconColor: 'text-gray-600 dark:text-gray-400'
    }
  ]

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityTitle = (type) => {
    const titles = {
      'meal_analysis': 'Meal Analysis',
      'weekly_plan': 'Weekly Plan',
      'health_risk_report': 'Health Risk Report',
      'chat': 'AI Chat',
      'Summarize weekly meal': 'Weekly Summary',
      'nutrition_impact_summary': 'Nutrition Impact'
    }
    return titles[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Powered by advanced AI to optimize your nutrition journey
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
              AI-Powered Features • Science-Based Recommendations • Personalized Insights
            </span>
          </div>
        </div>
      </div>

      {/* AI Features Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          AI Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link
                to={feature.href}
                className={`block p-6 rounded-xl border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 hover:shadow-lg ${feature.bgColor} group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm`}>
                    <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </div>
                
                <h3 className={`text-lg font-semibold mb-2 ${feature.textColor}`}>
                  {feature.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {feature.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent AI Activity
          </h2>
          <Link
            to="/dashboard/ai/history"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-lg"></div>
            ))}
          </div>
        ) : recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {getActivityTitle(activity.type)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard/ai/history"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No AI activity yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start using AI features to see your activity here
            </p>
            <Link
              to="/dashboard/ai/chat"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Bot className="h-4 w-4 mr-2" />
              Start with AI Chat
            </Link>
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          💡 AI Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <p className="text-gray-700 dark:text-gray-300">
              Start with <strong>AI Chat</strong> for personalized nutrition advice
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <p className="text-gray-700 dark:text-gray-300">
              Use <strong>Meal Analysis</strong> to understand your nutrition intake
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <p className="text-gray-700 dark:text-gray-300">
              Generate <strong>Weekly Plans</strong> for consistent healthy eating
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            <p className="text-gray-700 dark:text-gray-300">
              Check <strong>Health Risks</strong> to prevent nutrition-related issues
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiDashboard