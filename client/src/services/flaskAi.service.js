import axios from 'axios'

// Create Flask AI axios instance
const flaskAi = axios.create({
  baseURL: import.meta.env.VITE_FLASK_AI_URL || 'http://localhost:5000',
  timeout: 30000, // 30 seconds for AI operations
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
flaskAi.interceptors.request.use(
  (config) => {
    console.log('🤖 Flask AI Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('❌ Flask AI Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
flaskAi.interceptors.response.use(
  (response) => {
    console.log('✅ Flask AI Response:', response.status, response.config.url)
    return response.data
  },
  (error) => {
    console.error('❌ Flask AI Error:', error.response?.status, error.config?.url, error.response?.data?.message)
    
    const errorMessage = error.response?.data?.message || error.message || 'AI service error'
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    })
  }
)

// Flask AI Service
export const flaskAiService = {
  // Health check
  async health() {
    return await flaskAi.get('/health')
  },

  // Meal Analysis
  async analyzeMeals(userId, meals) {
    return await flaskAi.post('/analyze-meals', {
      userId,
      meals
    })
  },

  // Weekly Plan Generation
  async generateWeeklyPlan(userId, profile, targets) {
    return await flaskAi.post('/generate-weekly-plan', {
      userId,
      profile,
      targets
    })
  },

  // Health Risk Report
  async getHealthRiskReport(userId, meals) {
    return await flaskAi.post('/health-risk-report', {
      userId,
      meals
    })
  },

  // AI Chat
  async generateChatResponse(userId, message, language = 'en-US') {
    return await flaskAi.post('/chat/generateResponse', {
      userId,
      message,
      language
    })
  },

  // Get AI History
  async getHistory(userId) {
    return await flaskAi.get(`/history/${userId}`)
  },

  // Weekly Meal Summary
  async summarizeWeeklyMeal(userId, weeklyPlan) {
    return await flaskAi.post('/summarize-weekly-meal', {
      userId,
      weeklyPlan
    })
  },

  // Nutrition Impact Summary
  async getNutritionImpactSummary(userId, weeklyPlan, healthRiskReport) {
    return await flaskAi.post('/nutrition-impact-summary', {
      userId,
      weeklyPlan,
      healthRiskReport
    })
  }
}

export default flaskAiService