import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ToastProvider from './contexts/ToastContext'
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
// Meal Pages
import MealsListPage from './pages/meals/MealsListPage'
import MealDetailsPage from './pages/meals/MealDetailsPage'
import CreateMealPage from './pages/meals/CreateMealPage'
import EditMealPage from './pages/meals/EditMealPage'
import MyMealsPage from './pages/meals/MyMealsPage'
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
              <Route path="meal-planner" element={<div className="p-8">Meal Planner Coming Soon</div>} />
              <Route path="ai-recommendations" element={<div className="p-8">AI Recommendations Coming Soon</div>} />
              <Route path="goals" element={<div className="p-8">Goals Coming Soon</div>} />
              <Route path="history" element={<ActivityPage />} />
              <Route path="profile" element={<ProfilePage />} />
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
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
