import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, XCircle, Info, Database, Wifi, RefreshCw, Settings } from 'lucide-react'
import { supabase } from '../lib/supabase'

const DebugPanel = () => {
  const { user, session } = useAuth()
  const [debugInfo, setDebugInfo] = useState({
    supabaseConfig: false,
    databaseConnection: false,
    userAuthenticated: false,
    errors: []
  })
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkSystemStatus()
  }, [user, session])

  const checkSystemStatus = async () => {
    setIsLoading(true)
    const errors = []
    let supabaseConfig = false
    let databaseConnection = false
    let userAuthenticated = false

    try {
      // Check Supabase configuration
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (supabaseUrl && supabaseKey && 
          !supabaseUrl.includes('your-project.supabase.co') && 
          !supabaseKey.includes('your-anon-key-here')) {
        supabaseConfig = true
      } else {
        errors.push('Supabase configuration missing or invalid. Check your .env.local file.')
      }

      // Check database connection
      if (supabaseConfig) {
        try {
          const { data, error } = await supabase.from('profiles').select('count').limit(1)
          if (!error) {
            databaseConnection = true
          } else {
            errors.push(`Database connection failed: ${error.message}`)
          }
        } catch (error) {
          errors.push(`Database error: ${error.message}`)
        }
      }

      // Check user authentication
      if (user && session) {
        userAuthenticated = true
      }

      setDebugInfo({
        supabaseConfig,
        databaseConnection,
        userAuthenticated,
        errors
      })

  // Do not auto-open the panel; only show the floating button to avoid blocking UI interactions
  // if (errors.length > 0 && !databaseConnection) {
  //   setIsVisible(true)
  // }
    } catch (error) {
      console.error('System check failed:', error)
      setDebugInfo({
        supabaseConfig: false,
        databaseConnection: false,
        userAuthenticated: false,
        errors: [`System check failed: ${error.message}`]
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handleKeypress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(!isVisible)
      }
    }

    document.addEventListener('keydown', handleKeypress)
    return () => document.removeEventListener('keydown', handleKeypress)
  }, [isVisible])

  const StatusCard = ({ title, status, icon, details }) => (
    <div className={`p-4 rounded-lg border ${status ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`${status ? 'text-green-600' : 'text-red-600'} mr-2`}>
            {icon}
          </div>
          <span className="font-medium">{title}</span>
        </div>
        <div className={`${status ? 'text-green-600' : 'text-red-600'}`}>
          {status ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        </div>
      </div>
      {details && <p className="text-sm text-gray-600 mt-2">{details}</p>}
    </div>
  )

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className={`p-2 rounded-full transition-colors ${
            debugInfo.errors.length > 0 
              ? 'bg-red-500 text-white animate-pulse hover:bg-red-600' 
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
          title={`Debug Panel (Ctrl+Shift+D) ${debugInfo.errors.length > 0 ? '- Issues Found!' : ''}`}
        >
          {debugInfo.errors.length > 0 ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-4 bg-black bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Debug Panel</h2>
            <p className="text-gray-600">Application diagnostics and troubleshooting</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={checkSystemStatus}
              disabled={isLoading}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              title="Refresh Check"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 text-xl px-3"
            >
              ×
            </button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatusCard
            title="Supabase Config"
            status={debugInfo.supabaseConfig}
            icon={<Settings className="w-5 h-5" />}
            details={debugInfo.supabaseConfig ? "Configuration valid" : "Missing or invalid configuration"}
          />
          <StatusCard
            title="Database Connection"
            status={debugInfo.databaseConnection}
            icon={<Database className="w-5 h-5" />}
            details={debugInfo.databaseConnection ? "Connected successfully" : "Connection failed - check schema"}
          />
          <StatusCard
            title="User Authentication"
            status={debugInfo.userAuthenticated}
            icon={<Wifi className="w-5 h-5" />}
            details={debugInfo.userAuthenticated ? "User logged in" : "Not authenticated"}
          />
        </div>

        {/* Error Messages */}
        {debugInfo.errors.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Issues Found ({debugInfo.errors.length})
            </h3>
            <div className="space-y-2">
              {debugInfo.errors.map((error, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Environment Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Environment Status</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✓ Configured' : '✗ Missing'}
              </div>
              <div>
                <strong>Supabase Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Configured' : '✗ Missing'}
              </div>
              <div>
                <strong>HF API Token:</strong> {import.meta.env.VITE_HF_API_TOKEN ? '✓ Configured' : '⚠ Optional'}
              </div>
              <div>
                <strong>Google OAuth:</strong> {import.meta.env.VITE_GOOGLE_CLIENT_ID ? '✓ Configured' : '⚠ Optional'}
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200 mt-3">
              <div><strong>User ID:</strong> {user?.id || 'Not authenticated'}</div>
              <div><strong>User Email:</strong> {user?.email || 'Not authenticated'}</div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {debugInfo.errors.length === 0 && debugInfo.supabaseConfig && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">All systems operational!</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Your application is properly configured and ready to use.
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Reload Page
          </button>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
          >
            Clear Cache & Reload
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            Close Panel
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default DebugPanel
