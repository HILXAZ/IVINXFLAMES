import React, { useState, useEffect } from 'react'
import { supabase, db } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const DatabaseTest = () => {
  const { user } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState('testing...')
  const [testResults, setTestResults] = useState([])

  useEffect(() => {
    testDatabaseConnection()
  }, [user])

  const testDatabaseConnection = async () => {
    const results = []
    
    try {
      // Test 1: Basic Supabase connection
      const { data, error } = await supabase.from('profiles').select('count(*)')
      if (error) {
        results.push({ test: 'Supabase Connection', status: 'FAIL', error: error.message })
      } else {
        results.push({ test: 'Supabase Connection', status: 'PASS', data: 'Connected successfully' })
      }

      // Test 2: Authentication state
      if (user) {
        results.push({ test: 'User Authentication', status: 'PASS', data: `User: ${user.email}` })
      } else {
        results.push({ test: 'User Authentication', status: 'FAIL', error: 'No user logged in' })
      }

      // Test 3: Database helper functions
      if (user) {
        try {
          const habits = await db.getHabits(user.id)
          results.push({ test: 'Database Helpers - Habits', status: 'PASS', data: `Found ${habits.length} habits` })
        } catch (error) {
          results.push({ test: 'Database Helpers - Habits', status: 'FAIL', error: error.message })
        }

        try {
          const goals = await db.getDailyGoals(user.id, new Date().toISOString().split('T')[0])
          results.push({ test: 'Database Helpers - Goals', status: 'PASS', data: `Found ${goals.length} goals` })
        } catch (error) {
          results.push({ test: 'Database Helpers - Goals', status: 'FAIL', error: error.message })
        }
      }

      setConnectionStatus('complete')
      setTestResults(results)
    } catch (error) {
      setConnectionStatus('failed')
      results.push({ test: 'Overall Test', status: 'FAIL', error: error.message })
      setTestResults(results)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Database Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status: 
            <span className={`ml-2 ${
              connectionStatus === 'complete' ? 'text-green-600' : 
              connectionStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {connectionStatus.toUpperCase()}
            </span>
          </h2>
        </div>

        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{result.test}</h3>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  result.status === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.status}
                </span>
              </div>
              
              {result.data && (
                <p className="mt-2 text-green-600">{result.data}</p>
              )}
              
              {result.error && (
                <p className="mt-2 text-red-600 text-sm">{result.error}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Environment Variables</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</p>
            <p>Supabase Anon Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</p>
            <p>HF API Token: {import.meta.env.VITE_HF_API_TOKEN ? '✓ Set' : '✗ Missing'}</p>
            <p>Gemini API Key: {import.meta.env.VITE_GEMINI_API_KEY ? '✓ Set' : '✗ Missing'}</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={testDatabaseConnection}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Re-test Connection
          </button>
        </div>
      </div>
    </div>
  )
}

export default DatabaseTest
