import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    redirectTo: `${window.location.origin}/auth/callback`
  }
})

// Database helper functions
export const db = {
  // Habits
  async getHabits(userId) {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createHabit(habit) {
    const { data, error } = await supabase
      .from('habits')
      .insert(habit)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateHabit(id, updates) {
    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteHabit(id) {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Habit Logs
  async getHabitLogs(habitId, startDate, endDate) {
    let query = supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .order('date', { ascending: true })

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async logHabit(log) {
    const { data, error } = await supabase
      .from('habit_logs')
      .upsert(log, { onConflict: 'habit_id,date' })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Daily Goals
  async getDailyGoals(userId, date) {
    const { data, error } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
    
    if (error) throw error
    return data || []
  },

  async createDailyGoal(goal) {
    const { data, error } = await supabase
      .from('daily_goals')
      .insert(goal)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateDailyGoal(id, updates) {
    const { data, error } = await supabase
      .from('daily_goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteDailyGoal(id) {
    const { error } = await supabase
      .from('daily_goals')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Resources
  async getResources() {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('category', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createResource(resource) {
    const { data, error } = await supabase
      .from('resources')
      .insert(resource)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // User Badges
  async getUserBadges(userId) {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges (*)
      `)
      .eq('user_id', userId)
      .order('awarded_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async awardBadge(userId, badgeId) {
    const { data, error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId,
        awarded_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Chat Messages
  async getChatMessages(room = 'general') {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .eq('room', room)
      .order('created_at', { ascending: true })
      .limit(100)
    
    if (error) throw error
    return data || []
  },

  async sendMessage(message) {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // User Profiles
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async getUserProfile(userId) {
    return this.getProfile(userId)
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateUserProfile(userId, updates) {
    return this.updateProfile(userId, updates)
  },

  // User Statistics
  async getUserStats(userId) {
    try {
      // Get user habits and logs for stats calculation
      const [habits, logs] = await Promise.all([
        this.getHabits(userId),
        this.getAllHabitLogs(userId)
      ])

      // Calculate basic stats
      const totalHabits = habits.length
      const totalLogs = logs.length
      const successfulLogs = logs.filter(log => log.value > 0).length
      const successRate = totalLogs > 0 ? Math.round((successfulLogs / totalLogs) * 100) : 0

      // Calculate current streak (assuming most recent habit)
      let currentStreak = 0
      if (logs.length > 0) {
        const sortedLogs = logs.sort((a, b) => new Date(b.date) - new Date(a.date))
        for (const log of sortedLogs) {
          if (log.value > 0) {
            currentStreak++
          } else {
            break
          }
        }
      }

      return {
        totalHabits,
        totalLogs,
        successfulLogs,
        successRate,
        currentStreak,
        badges: await this.getUserBadges(userId)
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      return {
        totalHabits: 0,
        totalLogs: 0,
        successfulLogs: 0,
        successRate: 0,
        currentStreak: 0,
        badges: []
      }
    }
  },

  // Get all habit logs for a user
  async getAllHabitLogs(userId) {
    const { data, error } = await supabase
      .from('habit_logs')
      .select(`
        *,
        habits!inner(user_id)
      `)
      .eq('habits.user_id', userId)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get user habits (alias for getHabits)
  async getUserHabits(userId) {
    return this.getHabits(userId)
  },

  // Mood Logs
  async getMoodLogs(userId, startDate, endDate) {
    let query = supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async logMood(moodLog) {
    const { data, error } = await supabase
      .from('mood_logs')
      .upsert(moodLog, { onConflict: 'user_id,date' })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Reflections
  async getReflections(userId, startDate, endDate) {
    let query = supabase
      .from('reflections')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async createReflection(reflection) {
    const { data, error } = await supabase
      .from('reflections')
      .upsert(reflection, { onConflict: 'user_id,date' })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Feedback
  async submitFeedback(feedback) {
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedback)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getFeedback(userId) {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getAllFeedback() {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getFeedbackStats() {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('type, rating')
      
      if (error) throw error
      
      const stats = {
        total: data.length,
        featureRequests: data.filter(f => f.type === 'feature-request').length,
        averageRating: data.length > 0 ? 
          (data.filter(f => f.rating).reduce((sum, f) => sum + f.rating, 0) / 
           data.filter(f => f.rating).length).toFixed(1) : 0,
        responseRate: 98 // This could be calculated based on actual response data
      }
      
      return stats
    } catch (error) {
      console.error('Error getting feedback stats:', error)
      return {
        total: 0,
        featureRequests: 0,
        averageRating: 0,
        responseRate: 0
      }
    }
  }
}
