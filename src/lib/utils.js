import { format, startOfDay, endOfDay, subDays, differenceInDays } from 'date-fns'

export const dateUtils = {
  formatDate(date) {
    return format(new Date(date), 'yyyy-MM-dd')
  },

  formatDisplayDate(date) {
    return format(new Date(date), 'MMM dd, yyyy')
  },

  formatTime(date) {
    return format(new Date(date), 'HH:mm')
  },

  today() {
    return this.formatDate(new Date())
  },

  yesterday() {
    return this.formatDate(subDays(new Date(), 1))
  },

  daysAgo(days) {
    return this.formatDate(subDays(new Date(), days))
  },

  daysBetween(startDate, endDate) {
    return differenceInDays(new Date(endDate), new Date(startDate))
  }
}

export const streakUtils = {
  calculateStreak(logs) {
    if (!logs || logs.length === 0) return 0

    // Sort logs by date (most recent first)
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date))
    
    let streak = 0
    let currentDate = new Date()
    
    // Check if today is logged
    const today = dateUtils.formatDate(currentDate)
    const todayLog = sortedLogs.find(log => log.date === today)
    
    if (!todayLog || todayLog.value === 0) {
      // Check yesterday
      const yesterday = dateUtils.yesterday()
      const yesterdayLog = sortedLogs.find(log => log.date === yesterday)
      if (!yesterdayLog || yesterdayLog.value === 0) {
        return 0
      }
      currentDate = subDays(currentDate, 1)
    }

    // Count consecutive days
    for (let i = 0; i < sortedLogs.length; i++) {
      const expectedDate = dateUtils.formatDate(subDays(currentDate, i))
      const log = sortedLogs.find(log => log.date === expectedDate)
      
      if (log && log.value > 0) {
        streak++
      } else {
        break
      }
    }

    return streak
  },

  getLongestStreak(logs) {
    if (!logs || logs.length === 0) return 0

    const sortedLogs = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date))
    let maxStreak = 0
    let currentStreak = 0

    for (const log of sortedLogs) {
      if (log.value > 0) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }

    return maxStreak
  }
}

export const gamificationUtils = {
  calculateLevel(totalPoints) {
    return Math.floor(totalPoints / 100) + 1
  },

  getPointsForNextLevel(totalPoints) {
    const currentLevel = this.calculateLevel(totalPoints)
    const pointsNeeded = currentLevel * 100
    return pointsNeeded - (totalPoints % 100)
  },

  getBadgeEligibility(user, habitLogs) {
    const badges = []
    const streak = streakUtils.calculateStreak(habitLogs)
    const totalDays = habitLogs.filter(log => log.value > 0).length

    // Streak badges
    if (streak >= 7) badges.push('week_warrior')
    if (streak >= 30) badges.push('month_master')
    if (streak >= 100) badges.push('century_champion')

    // Total days badges
    if (totalDays >= 10) badges.push('dedicated_starter')
    if (totalDays >= 50) badges.push('persistent_fighter')
    if (totalDays >= 365) badges.push('year_long_warrior')

    return badges
  }
}

export const statsUtils = {
  getWeeklyStats(logs) {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = dateUtils.daysAgo(i)
      const log = logs.find(l => l.date === date)
      return {
        date,
        value: log ? log.value : 0,
        day: format(subDays(new Date(), i), 'EEE')
      }
    }).reverse()

    return last7Days
  },

  getMonthlyStats(logs) {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = dateUtils.daysAgo(i)
      const log = logs.find(l => l.date === date)
      return {
        date,
        value: log ? log.value : 0
      }
    }).reverse()

    return last30Days
  },

  getSuccessRate(logs, days = 30) {
    const recentLogs = logs.filter(log => {
      const logDate = new Date(log.date)
      const cutoffDate = subDays(new Date(), days)
      return logDate >= cutoffDate
    })

    if (recentLogs.length === 0) return 0

    const successfulDays = recentLogs.filter(log => log.value > 0).length
    return Math.round((successfulDays / recentLogs.length) * 100)
  }
}
