import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { userService } from '../services/userService'
import { setTokens, clearTokens } from '../services/api'

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'LOGIN_SUCCESS':
      console.log('✅ User authenticated:', action.payload.user.email)
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    case 'LOGOUT':
      console.log('🚪 User logged out')
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }
    case 'SET_ERROR':
      console.error('❌ Auth error:', action.payload)
      return {
        ...state,
        error: action.payload,
        loading: false
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    case 'UPDATE_USER':
      console.log('👤 User data updated:', action.payload)
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    default:
      return state
  }
}

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
}

// Create context
const AuthContext = createContext()

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      console.log('🔄 Initializing authentication...')
      
      // Try to get user data (this will work if there's a valid session)
      const response = await userService.getMe()
      
      if (response.success && response.data) {
        console.log('✅ User session restored:', response.data.email)
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: response.data }
        })
      } else {
        console.log('❌ No valid session found')
        dispatch({ type: 'LOGOUT' })
      }
    } catch (error) {
      console.log('❌ Session initialization failed:', error.message)
      dispatch({ type: 'LOGOUT' })
    }
  }

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })
      console.log('🔄 Attempting login for:', credentials.email)

      const response = await userService.login(credentials)
      
      if (response.success && response.data) {
        const { user, tokens } = response.data
        
        // Set both tokens in memory and localStorage
        if (tokens) {
          setTokens(tokens.accessToken, tokens.refreshToken)
          console.log('✅ Login successful for:', user.email)
        }
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user }
        })
        
        return { success: true, data: response.data }
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      console.error('❌ Login failed:', error.message)
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Login failed'
      })
      return { success: false, error: error.message }
    }
  }

  const signup = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      const response = await userService.signup(userData)
      
      if (response.success) {
        return { success: true, data: response.data }
      } else {
        throw new Error(response.message || 'Signup failed')
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Signup failed'
      })
      return { success: false, error: error.message }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const logout = async () => {
    try {
      console.log('🔄 Logging out user...')
      await userService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear tokens and state regardless of API call result
      clearTokens()
      dispatch({ type: 'LOGOUT' })
      console.log('✅ User logged out successfully')
    }
  }

  const refreshSession = async () => {
    try {
      const response = await userService.refreshToken()
      
      if (response.success && response.data?.tokens) {
        setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken)
        return true
      }
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }

  const fetchMe = async () => {
    try {
      const response = await userService.getMe()
      
      if (response.success && response.data) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data
        })
        return response.data
      }
    } catch (error) {
      console.error('Fetch user failed:', error)
      throw error
    }
  }

  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    ...state,
    login,
    signup,
    logout,
    refreshSession,
    fetchMe,
    updateUser,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext