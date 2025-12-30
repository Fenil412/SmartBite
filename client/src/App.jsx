import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ToastProvider from './contexts/ToastContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AuthDebug from './components/AuthDebug'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import DashboardHomePage from './pages/DashboardHomePage'
import ApiTestPage from './pages/ApiTestPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import ActivityPage from './pages/ActivityPage'
import ConstraintsPage from './pages/ConstraintsPage'
import FeedbackPage from './pages/FeedbackPage'
import NotificationsPage from './pages/NotificationsPage'
import RecommendationsPage from './pages/RecommendationsPage'
import RecommendationHistoryPage from './pages/RecommendationHistoryPage'
import GroceryPage from './pages/GroceryPage'
import GroceryDashboard from './pages/GroceryDashboard'
// Meal Pages
import MealsListPage from './pages/meals/MealsListPage'
import MealDetailsPage from './pages/meals/MealDetailsPage'
import CreateMealPage from './pages/meals/CreateMealPage'
import EditMealPage from './pages/meals/EditMealPage'
import MyMealsPage from './pages/meals/MyMealsPage'
// Meal Plan Pages
import MealPlannerDashboard from './pages/mealPlan/MealPlannerDashboard'
import MealPlanDetails from './pages/mealPlan/MealPlanDetails'
import CreateMealPlan from './pages/mealPlan/CreateMealPlan'
import EditMealPlan from './pages/mealPlan/EditMealPlan'
import MealAnalysisPage from './pages/ai/MealAnalysisPage'
import WeeklyPlanPage from './pages/ai/WeeklyPlanPage'
import HealthRiskPage from './pages/ai/HealthRiskPage'
import AiChatPage from './pages/ai/AiChatPage'
import WeeklySummaryPage from './pages/ai/WeeklySummaryPage'
import NutritionImpactPage from './pages/ai/NutritionImpactPage'
import AiHistoryPage from './pages/ai/AiHistoryPage'
import AiDashboard from './pages/ai/AiDashboard'
import ParticleSystem from './components/ParticleSystem'
import FloatingActionButton from './components/FloatingActionButton'
import useThemeStore from './store/themeStore'
import useCustomCursor from './hooks/useCustomCursor'

function App() {
  const { initializeTheme, isDark } = useThemeStore()
  
  useCustomCursor()

  useEffect(() => {
    initializeTheme()
    console.log('🚀 SmartBite App Started')
    console.log('🌐 Environment:', import.meta.env.MODE)
    console.log('🔗 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1')
  }, [initializeTheme])

  return (
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 relative">
          <ParticleSystem particleCount={30} theme={isDark ? 'dark' : 'light'} />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Protected Routes with Layout */}
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard/analytics" replace />} />
              <Route path="analytics" element={<DashboardPage />} />
              <Route path="home" element={<DashboardHomePage />} />
              <Route path="meal-planner" element={<MealPlannerDashboard />} />
              <Route path="meal-planner/create" element={<CreateMealPlan />} />
              <Route path="meal-planner/:planId" element={<MealPlanDetails />} />
              <Route path="meal-planner/:planId/edit" element={<EditMealPlan />} />
              <Route path="grocery" element={<GroceryDashboard />} />
              <Route path="grocery/:mealPlanId" element={<GroceryPage />} />
              <Route path="recommendations" element={<RecommendationsPage />} />
              <Route path="recommendations/history" element={<RecommendationHistoryPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="ai-recommendations" element={<div className="p-8">AI Recommendations Coming Soon</div>} />
              {/* AI Experience Routes */}
              <Route path="ai" element={<AiDashboard />} />
              <Route path="ai/meal-analysis" element={<MealAnalysisPage />} />
              <Route path="ai/weekly-plan" element={<WeeklyPlanPage />} />
              <Route path="ai/health-risk" element={<HealthRiskPage />} />
              <Route path="ai/chat" element={<AiChatPage />} />
              <Route path="ai/weekly-summary" element={<WeeklySummaryPage />} />
              <Route path="ai/nutrition-impact" element={<NutritionImpactPage />} />
              <Route path="ai/history" element={<AiHistoryPage />} />
              <Route path="goals" element={<div className="p-8">Goals Coming Soon</div>} />
              <Route path="history" element={<ActivityPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="constraints" element={<ConstraintsPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="api-test" element={<ApiTestPage />} />
              {/* Meal Routes */}
              <Route path="meals" element={<MealsListPage />} />
              <Route path="meals/create" element={<CreateMealPage />} />
              <Route path="meals/my-meals" element={<MyMealsPage />} />
              <Route path="meals/:mealId" element={<MealDetailsPage />} />
              <Route path="meals/:mealId/edit" element={<EditMealPage />} />
            </Route>

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <FloatingActionButton />
          <AuthDebug />
        </div>
      </NotificationProvider>
    </AuthProvider>
  </ToastProvider>
  )
}

export default App
