import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getAccessToken, getRefreshToken } from '../services/api'

const AuthDebug = () => {
  const { user, isAuthenticated, loading, error } = useAuth()
  const [showDebug, setShowDebug] = useState(false)

  // Only show in development
  if (import.meta.env.PROD) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs font-mono"
      >
        Auth Debug
      </button>
      
      {showDebug && (
        <div className="absolute bottom-12 left-0 bg-gray-900 text-white p-4 rounded-lg text-xs font-mono w-80 max-h-96 overflow-auto">
          <div className="space-y-2">
            <div>
              <strong>Auth State:</strong>
              <div className="ml-2">
                <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
                <div>Loading: {loading ? '⏳' : '✅'}</div>
                <div>Error: {error || 'None'}</div>
              </div>
            </div>
            
            <div>
              <strong>User:</strong>
              <pre className="ml-2 text-xs overflow-auto">
                {user ? JSON.stringify(user, null, 2) : 'null'}
              </pre>
            </div>
            
            <div>
              <strong>Tokens:</strong>
              <div className="ml-2">
                <div>Access: {getAccessToken() ? '✅ Present' : '❌ Missing'}</div>
                <div>Refresh: {getRefreshToken() ? '✅ Present' : '❌ Missing'}</div>
              </div>
            </div>
            
            <div>
              <strong>Environment:</strong>
              <div className="ml-2">
                <div>API URL: {import.meta.env.VITE_API_URL || 'Default'}</div>
                <div>Mode: {import.meta.env.MODE}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuthDebug
