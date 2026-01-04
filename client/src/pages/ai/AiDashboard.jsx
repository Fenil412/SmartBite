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
  Zap,
  Download,
  Activity,
  TrendingUp,
  Target,
  Database,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { flaskAiService } from '../../services/flaskAi.service'
import { useToast } from '../../contexts/ToastContext'
import { saveAs } from 'file-saver'
import ExcelJS from 'exceljs'

const AiDashboard = () => {
  const { user } = useAuth()
  const { success: showSuccess, error: showError } = useToast()
  const [recentActivity, setRecentActivity] = useState([])
  const [aiStats, setAiStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showExportDropdown, setShowExportDropdown] = useState(false)

  useEffect(() => {
    loadAiDashboardData()
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.ai-export-dropdown')) {
        setShowExportDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportDropdown])

  const loadAiDashboardData = async () => {
    if (!user?._id) return
    
    try {
      setLoading(true)
      
      // Load AI history and statistics
      const [historyResponse, weeklyPlansResponse, healthReportsResponse] = await Promise.allSettled([
        flaskAiService.getHistory(user._id),
        flaskAiService.getWeeklyPlans(user._id),
        flaskAiService.getHealthRiskReports(user._id)
      ])
      
      // Process AI history
      if (historyResponse.status === 'fulfilled' && historyResponse.value.success) {
        const transformedHistory = (historyResponse.value.data || []).map(item => ({
          ...item,
          type: item.action || item.type,
          timestamp: item.createdAt || item.timestamp,
          username: item.username || user.username || 'Unknown User'
        }))
        
        transformedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        setRecentActivity(transformedHistory.slice(0, 3))
        
        // Calculate statistics
        const stats = {
          totalInteractions: transformedHistory.length,
          weeklyPlans: weeklyPlansResponse.status === 'fulfilled' ? (weeklyPlansResponse.value.data || []).length : 0,
          healthReports: healthReportsResponse.status === 'fulfilled' ? (healthReportsResponse.value.data || []).length : 0,
          chatMessages: transformedHistory.filter(item => item.type === 'chat' || item.type === 'chat/generateResponse').length,
          mealAnalyses: transformedHistory.filter(item => item.type === 'analyze-meals' || item.type === 'meal_analysis').length,
          last7Days: transformedHistory.filter(item => {
            const itemDate = new Date(item.timestamp)
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            return itemDate > sevenDaysAgo
          }).length
        }
        
        setAiStats(stats)
      }
    } catch (error) {
      console.error('Failed to load AI dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportAiData = async (format = 'json') => {
    try {
      setShowExportDropdown(false)
      
      // Fetch comprehensive AI data
      const [historyResponse, weeklyPlansResponse, healthReportsResponse] = await Promise.allSettled([
        flaskAiService.getHistory(user._id),
        flaskAiService.getWeeklyPlans(user._id),
        flaskAiService.getHealthRiskReports(user._id)
      ])
      
      const aiHistory = historyResponse.status === 'fulfilled' ? historyResponse.value.data || [] : []
      const weeklyPlans = weeklyPlansResponse.status === 'fulfilled' ? weeklyPlansResponse.value.data || [] : []
      const healthReports = healthReportsResponse.status === 'fulfilled' ? healthReportsResponse.value.data || [] : []
      
      const timestamp = new Date().toISOString().split('T')[0]
      const userId = user._id
      
      if (format === 'excel') {
        const workbook = new ExcelJS.Workbook()
        
        // AI Summary Sheet
        const summarySheet = workbook.addWorksheet('AI Summary')
        summarySheet.addRows([
          ['SmartBite AI Data Export'],
          ['Export Date', new Date().toLocaleDateString()],
          ['User', user.fullName || user.name || 'N/A'],
          ['User ID', userId],
          [],
          ['AI Statistics'],
          ['Total AI Interactions', aiHistory.length],
          ['Chat Messages', aiHistory.filter(item => item.action === 'chat' || item.action === 'chat/generateResponse').length],
          ['Meal Analyses', aiHistory.filter(item => item.action === 'analyze-meals').length],
          ['Weekly Plans Generated', weeklyPlans.length],
          ['Health Risk Reports', healthReports.length],
          ['Last 7 Days Activity', aiHistory.filter(item => {
            const itemDate = new Date(item.createdAt)
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            return itemDate > sevenDaysAgo
          }).length]
        ])
        
        // Style headers
        summarySheet.getCell('A1').font = { bold: true, size: 14 }
        summarySheet.getCell('A6').font = { bold: true, size: 12 }
        
        // AI History Sheet
        if (aiHistory.length > 0) {
          const historySheet = workbook.addWorksheet('AI History')
          historySheet.addRow(['Date', 'Action', 'Type', 'Status'])
          historySheet.getRow(1).font = { bold: true }
          
          aiHistory.forEach(item => {
            historySheet.addRow([
              item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
              item.action || 'N/A',
              item.type || 'N/A',
              'Completed'
            ])
          })
        }
        
        // Weekly Plans Sheet
        if (weeklyPlans.length > 0) {
          const plansSheet = workbook.addWorksheet('Weekly Plans')
          plansSheet.addRow(['Date Created', 'Plan Type', 'Status'])
          plansSheet.getRow(1).font = { bold: true }
          
          weeklyPlans.forEach(plan => {
            plansSheet.addRow([
              plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'N/A',
              'Weekly Meal Plan',
              'Generated'
            ])
          })
        }
        
        // Health Reports Sheet
        if (healthReports.length > 0) {
          const reportsSheet = workbook.addWorksheet('Health Reports')
          reportsSheet.addRow(['Date', 'Report Type', 'Risk Level'])
          reportsSheet.getRow(1).font = { bold: true }
          
          healthReports.forEach(report => {
            reportsSheet.addRow([
              report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A',
              'Health Risk Assessment',
              report.data?.overallRisk || 'N/A'
            ])
          })
        }
        
        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        saveAs(blob, `smartbite-ai-data-${userId}-${timestamp}.xlsx`)
        
      } else {
        // JSON format
        const exportData = {
          exportInfo: {
            exportDate: new Date().toISOString(),
            userId: userId,
            userName: user.fullName || user.name,
            type: 'SmartBite AI Data Export',
            version: '2.0'
          },
          statistics: {
            totalInteractions: aiHistory.length,
            chatMessages: aiHistory.filter(item => item.action === 'chat' || item.action === 'chat/generateResponse').length,
            mealAnalyses: aiHistory.filter(item => item.action === 'analyze-meals').length,
            weeklyPlans: weeklyPlans.length,
            healthReports: healthReports.length,
            last7DaysActivity: aiHistory.filter(item => {
              const itemDate = new Date(item.createdAt)
              const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              return itemDate > sevenDaysAgo
            }).length
          },
          data: {
            aiHistory: aiHistory,
            weeklyPlans: weeklyPlans,
            healthReports: healthReports
          },
          readme: {
            description: 'This file contains all your SmartBite AI interaction data.',
            sections: {
              statistics: 'Summary of your AI usage patterns',
              aiHistory: 'Complete history of AI interactions including chats, analyses, and generations',
              weeklyPlans: 'AI-generated weekly meal plans',
              healthReports: 'Health risk assessment reports'
            },
            dataTypes: {
              chat: 'AI chat conversations',
              'analyze-meals': 'Nutritional meal analyses',
              'generate-weekly-plan': 'Weekly meal plan generations',
              'health-risk-report': 'Health risk assessments',
              'nutrition-impact-summary': 'Nutrition impact analyses'
            }
          }
        }
        
        const dataStr = JSON.stringify(exportData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        saveAs(dataBlob, `smartbite-ai-data-${userId}-${timestamp}.json`)
      }
      
      showSuccess(`AI data exported successfully as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Export error:', error)
      showError('Failed to export AI data')
    }
  }

  const loadRecentActivity = loadAiDashboardData // Alias for backward compatibility

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

  const getActivityIcon = (type) => {
    if (!type) return Zap
    
    const icons = {
      'meal_analysis': BarChart3,
      'weekly_plan': Calendar,
      'health_risk_report': AlertTriangle,
      'chat': Bot,
      'nutrition_impact_summary': Heart,
      'Summarize weekly meal': FileText,
      'analyze-meals': BarChart3,
      'generate-weekly-plan': Calendar,
      'health-risk-report': AlertTriangle,
      'chat/generateResponse': Bot,
      'summarize-weekly-meal': FileText,
      'nutrition-impact-summary': Heart
    }
    return icons[type] || Zap
  }

  const getActivityColor = (type) => {
    if (!type) return 'bg-gray-100 dark:bg-gray-700'
    
    const colors = {
      'meal_analysis': 'bg-blue-100 dark:bg-blue-900/20',
      'weekly_plan': 'bg-green-100 dark:bg-green-900/20',
      'health_risk_report': 'bg-red-100 dark:bg-red-900/20',
      'chat': 'bg-purple-100 dark:bg-purple-900/20',
      'nutrition_impact_summary': 'bg-pink-100 dark:bg-pink-900/20',
      'Summarize weekly meal': 'bg-yellow-100 dark:bg-yellow-900/20',
      'analyze-meals': 'bg-blue-100 dark:bg-blue-900/20',
      'generate-weekly-plan': 'bg-green-100 dark:bg-green-900/20',
      'health-risk-report': 'bg-red-100 dark:bg-red-900/20',
      'chat/generateResponse': 'bg-purple-100 dark:bg-purple-900/20',
      'summarize-weekly-meal': 'bg-yellow-100 dark:bg-yellow-900/20',
      'nutrition-impact-summary': 'bg-pink-100 dark:bg-pink-900/20'
    }
    return colors[type] || 'bg-gray-100 dark:bg-gray-700'
  }

  const getActivityIconColor = (type) => {
    if (!type) return 'text-gray-600 dark:text-gray-400'
    
    const colors = {
      'meal_analysis': 'text-blue-600 dark:text-blue-400',
      'weekly_plan': 'text-green-600 dark:text-green-400',
      'health_risk_report': 'text-red-600 dark:text-red-400',
      'chat': 'text-purple-600 dark:text-purple-400',
      'nutrition_impact_summary': 'text-pink-600 dark:text-pink-400',
      'Summarize weekly meal': 'text-yellow-600 dark:text-yellow-400',
      'analyze-meals': 'text-blue-600 dark:text-blue-400',
      'generate-weekly-plan': 'text-green-600 dark:text-green-400',
      'health-risk-report': 'text-red-600 dark:text-red-400',
      'chat/generateResponse': 'text-purple-600 dark:text-purple-400',
      'summarize-weekly-meal': 'text-yellow-600 dark:text-yellow-400',
      'nutrition-impact-summary': 'text-pink-600 dark:text-pink-400'
    }
    return colors[type] || 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
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
          
          <div className="flex items-center space-x-3">
            <div className="relative ai-export-dropdown">
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export AI Data</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showExportDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="py-2">
                    <button
                      onClick={() => exportAiData('json')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <span className="text-lg">📄</span>
                      <div>
                        <div className="font-medium">Export as JSON</div>
                        <div className="text-xs text-gray-500">AI data in JSON format</div>
                      </div>
                    </button>
                    <button
                      onClick={() => exportAiData('excel')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <span className="text-lg">📊</span>
                      <div>
                        <div className="font-medium">Export as Excel</div>
                        <div className="text-xs text-gray-500">AI data in spreadsheet</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
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

      {/* AI Statistics */}
      {aiStats && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Your AI Usage Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-full">
                  Total
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                  {aiStats.totalInteractions}
                </p>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                  AI Interactions
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  All AI conversations & analyses
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500 rounded-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded-full">
                  Chats
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">
                  {aiStats.chatMessages}
                </p>
                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                  Chat Messages
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  AI nutritionist conversations
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded-full">
                  Analysis
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                  {aiStats.mealAnalyses}
                </p>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Meal Analyses
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Nutrition breakdowns
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500 rounded-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-2 py-1 rounded-full">
                  Recent
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-1">
                  {aiStats.last7Days}
                </p>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">
                  Last 7 Days
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Recent AI activity
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      )}

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
            {recentActivity.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type)
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                        <IconComponent className={`h-4 w-4 ${getActivityIconColor(activity.type)}`} />
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
              )
            })}
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