// Automatic fixes for common issues
import { supabase } from '../lib/supabase'
import { clearAllData } from './errorUtils'

export const autoFixes = {
  async fixDatabaseSchema() {
    try {
      // Try to create missing tables with basic structure
      const fixes = []
      
      // Check if profiles table exists
      const { error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (profilesError && profilesError.message.includes('does not exist')) {
        fixes.push('Database schema missing - please run database-schema-updated.sql')
      }
      
      return { success: fixes.length === 0, fixes }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async fixAuthSession() {
    try {
      // Clear invalid auth tokens
      const authKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('auth')
      )
      
      authKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key)
          if (value && value.includes('expired')) {
            localStorage.removeItem(key)
          }
        } catch {}
      })
      
      // Refresh session
      const { data: { session } } = await supabase.auth.getSession()
      return { success: true, hasSession: !!session }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async clearCorruptedData() {
    try {
      // Remove potentially corrupted data
      const keysToCheck = ['habits', 'goals', 'progress', 'settings']
      let fixed = 0
      
      keysToCheck.forEach(key => {
        try {
          const data = localStorage.getItem(key)
          if (data) {
            JSON.parse(data)  // Test if valid JSON
          }
        } catch {
          localStorage.removeItem(key)
          fixed++
        }
      })
      
      return { success: true, fixed }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async resetToDefaults() {
    try {
      clearAllData()
      window.location.reload()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async testConnectivity() {
    try {
      // Test Supabase connection
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (error) {
        return { 
          success: false, 
          connectivity: false, 
          error: error.message,
          suggestion: error.message.includes('does not exist') 
            ? 'Run database schema' 
            : 'Check Supabase configuration'
        }
      }
      
      return { success: true, connectivity: true }
    } catch (error) {
      return { 
        success: false, 
        connectivity: false, 
        error: error.message,
        suggestion: 'Check internet connection and Supabase credentials'
      }
    }
  }
}

export const runAllFixes = async () => {
  const results = {}
  
  console.log('🔧 Running automatic fixes...')
  
  // Test connectivity first
  results.connectivity = await autoFixes.testConnectivity()
  
  // Fix auth session
  results.auth = await autoFixes.fixAuthSession()
  
  // Clear corrupted data
  results.data = await autoFixes.clearCorruptedData()
  
  // Check database
  if (results.connectivity.success) {
    results.database = await autoFixes.fixDatabaseSchema()
  }
  
  const successCount = Object.values(results).filter(r => r.success).length
  const totalCount = Object.keys(results).length
  
  console.log(`✅ Automatic fixes completed: ${successCount}/${totalCount} successful`)
  
  return {
    results,
    summary: {
      successful: successCount,
      total: totalCount,
      allFixed: successCount === totalCount
    }
  }
}
