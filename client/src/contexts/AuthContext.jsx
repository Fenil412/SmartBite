import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { userService } from '../services/userService'
import { setTokens, clearTokens } from '../services/api'

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }
    case 'SET_ERROR':
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
      
      // Try to get user data (this will work if there's a valid session)
      const response = await userService.getMe()
      
      if (response.success && response.data) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: response.data }
        })
      } else {
        dispatch({ type: 'LOGOUT' })
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' })
    }
  }

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      const response = await userService.login(credentials)
      
      if (response.success && response.data) {
        const { user, tokens } = response.data
        
        // Set both tokens in memory and localStorage
        if (tokens) {
          setTokens(tokens.accessToken, tokens.refreshToken)
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
      await userService.logout()
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      // Clear tokens and state regardless of API call result
      clearTokens()
      dispatch({ type: 'LOGOUT' })
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
