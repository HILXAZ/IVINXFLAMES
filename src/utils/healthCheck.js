                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      // Comprehensive application health check and fixes
import { performSystemCheck } from '../utils/systemCheck'
import { autoFixes, runAllFixes } from '../utils/autoFix'

export const runCompleteHealthCheck = async () => {
  console.log('🏥 Starting comprehensive health check...')
  
  const healthReport = {
    timestamp: new Date().toISOString(),
    checks: {},
    fixes: {},
    recommendations: [],
    severity: 'healthy' // healthy, warning, critical
  }

  // 1. System Configuration Check
  console.log('📋 Checking system configuration...')
  healthReport.checks.system = await performSystemCheck()
  
  // 2. Component Loading Check
  console.log('🔧 Checking component integrity...')
  healthReport.checks.components = await checkComponentIntegrity()
  
  // 3. Database Connectivity
  console.log('💾 Testing database connectivity...')
  healthReport.checks.database = await autoFixes.testConnectivity()
  
  // 4. Authentication Flow
  console.log('🔐 Verifying authentication flow...')
  healthReport.checks.auth = await autoFixes.fixAuthSession()
  
  // 5. Automatic Fixes
  if (healthReport.checks.system.errors.length > 0) {
    console.log('🔧 Running automatic fixes...')
    healthReport.fixes.auto = await runAllFixes()
  }
  
  // Calculate severity
  const criticalIssues = healthReport.checks.system.errors.length
  const warnings = healthReport.checks.system.warnings.length
  
  if (criticalIssues > 0) {
    healthReport.severity = 'critical'
    healthReport.recommendations.push('Critical issues found - immediate attention required')
  } else if (warnings > 0) {
    healthReport.severity = 'warning'
    healthReport.recommendations.push('Minor issues found - recommended to fix')
  } else {
    healthReport.severity = 'healthy'
    healthReport.recommendations.push('All systems operational')
  }
  
  // Generate summary
  healthReport.summary = {
    totalChecks: Object.keys(healthReport.checks).length,
    passedChecks: Object.values(healthReport.checks).filter(check => 
      check.success || check.connected || check.hasSession || (check.errors && check.errors.length === 0)
    ).length,
    criticalIssues,
    warnings,
    fixesApplied: healthReport.fixes.auto ? Object.keys(healthReport.fixes.auto.results || {}).length : 0
  }
  
  console.log(`✅ Health check complete: ${healthReport.severity.toUpperCase()}`)
  console.log(`📊 Summary: ${healthReport.summary.passedChecks}/${healthReport.summary.totalChecks} checks passed`)
  
  return healthReport
}

const checkComponentIntegrity = async () => {
  const components = [
    'Landing',
    'Login', 
    'Dashboard',
    'Tracker',
    'Tips',
    'Library',
    'Emergency',
    'Community',
    'Profile',
    'Assistant'
  ]
  
  const results = {
    total: components.length,
    loaded: 0,
    failed: [],
    success: true
  }
  
  for (const component of components) {
    try {
      // Try to dynamically import each component
      await import(`../pages/${component}.jsx`)
      results.loaded++
    } catch (error) {
      results.failed.push({ component, error: error.message })
      results.success = false
    }
  }
  
  return results
}

export const getHealthBadge = (severity) => {
  const badges = {
    healthy: { color: 'green', text: '✅ Healthy', bg: 'bg-green-100' },
    warning: { color: 'yellow', text: '⚠️ Warning', bg: 'bg-yellow-100' },
    critical: { color: 'red', text: '🚨 Critical', bg: 'bg-red-100' }
  }
  
  return badges[severity] || badges.critical
}

export const generateHealthReport = (healthData) => {
  const report = []
  
  report.push(`# Application Health Report`)
  report.push(`Generated: ${new Date(healthData.timestamp).toLocaleString()}`)
  report.push(`Status: ${healthData.severity.toUpperCase()}`)
  report.push(``)
  
  report.push(`## Summary`)
  report.push(`- Total Checks: ${healthData.summary.totalChecks}`)
  report.push(`- Passed: ${healthData.summary.passedChecks}`)
  report.push(`- Critical Issues: ${healthData.summary.criticalIssues}`)
  report.push(`- Warnings: ${healthData.summary.warnings}`)
  report.push(`- Fixes Applied: ${healthData.summary.fixesApplied}`)
  report.push(``)
  
  if (healthData.checks.system.errors.length > 0) {
    report.push(`## Critical Issues`)
    healthData.checks.system.errors.forEach((error, i) => {
      report.push(`${i + 1}. ${error}`)
    })
    report.push(``)
  }
  
  if (healthData.recommendations.length > 0) {
    report.push(`## Recommendations`)
    healthData.recommendations.forEach((rec, i) => {
      report.push(`${i + 1}. ${rec}`)
    })
    report.push(``)
  }
  
  return report.join('\n')
}
