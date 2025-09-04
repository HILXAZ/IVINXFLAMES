// System diagnostics and automatic fixes
import { supabase } from '../lib/supabase'

export const performSystemCheck = async () => {
  const results = {
    environment: {},
    database: {},
    authentication: {},
    errors: [],
    warnings: [],
    fixes: [],
    autoFixAvailable: true
  }

  // Check environment variables
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ]

  const optionalEnvVars = [
    'VITE_HF_API_TOKEN',
    'VITE_GOOGLE_CLIENT_ID'
  ]

  requiredEnvVars.forEach(varName => {
    const value = import.meta.env[varName]
    if (!value || value.includes('your-') || value.includes('here')) {
      results.errors.push(`Missing or invalid ${varName}`)
      results.environment[varName] = false
    } else {
      results.environment[varName] = true
    }
  })

  optionalEnvVars.forEach(varName => {
    const value = import.meta.env[varName]
    if (!value || value.includes('your-') || value.includes('here')) {
      results.warnings.push(`Optional ${varName} not configured`)
      results.environment[varName] = false
    } else {
      results.environment[varName] = true
    }
  })

  // Test database connectivity
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (error) {
      if (error.message.includes('relation "profiles" does not exist')) {
        results.errors.push('Database schema not installed. Please run database-schema-updated.sql in Supabase SQL Editor.')
        results.fixes.push('Install database schema from database-schema-updated.sql')
      } else {
        results.errors.push(`Database error: ${error.message}`)
      }
      results.database.connected = false
    } else {
      results.database.connected = true
    }
  } catch (error) {
    results.errors.push(`Database connection failed: ${error.message}`)
    results.database.connected = false
  }

  // Test authentication
  try {
    const { data: { session } } = await supabase.auth.getSession()
    results.authentication.hasSession = !!session
    results.authentication.sessionValid = session?.expires_at ? new Date(session.expires_at * 1000) > new Date() : false
  } catch (error) {
    results.errors.push(`Authentication check failed: ${error.message}`)
    results.authentication.hasSession = false
  }

  return results
}

export const getQuickFixes = (systemCheck) => {
  const fixes = []

  if (!systemCheck.environment.VITE_SUPABASE_URL) {
    fixes.push({
      title: 'Configure Supabase URL',
      description: 'Add your Supabase project URL to .env.local',
      action: 'Add VITE_SUPABASE_URL=https://your-project.supabase.co to .env.local'
    })
  }

  if (!systemCheck.environment.VITE_SUPABASE_ANON_KEY) {
    fixes.push({
      title: 'Configure Supabase Anon Key',
      description: 'Add your Supabase anonymous key to .env.local',
      action: 'Add VITE_SUPABASE_ANON_KEY=your-anon-key to .env.local'
    })
  }

  if (!systemCheck.database.connected) {
    fixes.push({
      title: 'Install Database Schema',
      description: 'Create the required database tables',
      action: 'Run database-schema-updated.sql in Supabase SQL Editor'
    })
  }

  if (!systemCheck.environment.VITE_HF_API_TOKEN) {
    fixes.push({
      title: 'Configure AI Features',
      description: 'Add Hugging Face token for AI-powered features',
      action: 'Get token from huggingface.co/settings/tokens and add to .env.local'
    })
  }

  return fixes
}
