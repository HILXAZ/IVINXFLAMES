import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  Settings, 
  Edit,
  Save,
  X,
  Target,
  TrendingUp,
  Shield,
  Power,
  Sparkles,
  LogOut
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import GlassmorphismCard from '../components/GlassmorphismCard'

const Profile = () => {
  const { user, updateProfile, signOut } = useAuth()
  const [profile, setProfile] = useState({
    username: '',
    bio: '',
    goals: '',
    privacy_level: 'public'
  })
  const [habits, setHabits] = useState([])
  const [badges, setBadges] = useState([])
  const [stats, setStats] = useState({
    totalDays: 0,
    longestStreak: 0,
    habitsCreated: 0,
    badgesEarned: 0
  })
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      loadProfile()
      loadHabits()
      loadBadges()
      loadStats()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const { data, error } = await db
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const loadHabits = async () => {
    try {
      const { data, error } = await db
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setHabits(data || [])
    } catch (error) {
      console.error('Error loading habits:', error)
    }
  }

  const loadBadges = async () => {
    try {
      const { data, error } = await db
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', user.id)

      if (error) throw error
      setBadges(data || [])
    } catch (error) {
      console.error('Error loading badges:', error)
    }
  }

  const loadStats = async () => {
    try {
      // Get total days tracked
      const { data: logsData, error: logsError } = await db
        .from('habit_logs')
        .select('date')
        .eq('user_id', user.id)
        .eq('value', 1)

      if (logsError) throw logsError

      const uniqueDates = new Set(logsData?.map(log => log.date) || [])
      const totalDays = uniqueDates.size

      // Calculate longest streak
      const sortedDates = Array.from(uniqueDates).sort()
      let longestStreak = 0
      let currentStreak = 0
      
      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0 || new Date(sortedDates[i]) - new Date(sortedDates[i-1]) === 86400000) {
          currentStreak++
        } else {
          longestStreak = Math.max(longestStreak, currentStreak)
          currentStreak = 1
        }
      }
      longestStreak = Math.max(longestStreak, currentStreak)

      setStats({
        totalDays,
        longestStreak,
        habitsCreated: habits.length,
        badgesEarned: badges.length
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { error } = await updateProfile(profile)
      if (error) throw error
      setEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    // Call signOut without awaiting for immediate response
    signOut()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage your account and track your recovery journey
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <GlassmorphismCard variant="panel" intensity="strong" className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Personal Information</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center justify-center space-x-2 text-green-600 hover:text-green-700 font-medium text-sm sm:text-base"
                  >
                    {saving ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-700 font-medium text-sm sm:text-base"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 sm:h-10 sm:w-10 text-primary-600" />
                </div>
                <div className="flex-1">
                  {editing ? (
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      className="input mb-2"
                      placeholder="Display name"
                    />
                  ) : (
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{profile.username}</h3>
                  )}
                  <div className="flex items-center text-gray-500 text-sm sm:text-base">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <span className="break-all">{user.email}</span>
                  </div>
                  <div className="flex items-center text-gray-500 mt-1 text-sm sm:text-base">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About Me
                </label>
                {editing ? (
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Tell others about your journey and what motivates you..."
                  />
                ) : (
                  <p className="text-gray-600">
                    {profile.bio || 'No bio added yet.'}
                  </p>
                )}
              </div>

              {/* Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recovery Goals
                </label>
                {editing ? (
                  <textarea
                    value={profile.goals}
                    onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
                    className="input"
                    rows={2}
                    placeholder="What are you working towards?"
                  />
                ) : (
                  <p className="text-gray-600">
                    {profile.goals || 'No goals set yet.'}
                  </p>
                )}
              </div>

              {/* Privacy Settings */}
              {editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacy Level
                  </label>
                  <select
                    value={profile.privacy_level}
                    onChange={(e) => setProfile({ ...profile, privacy_level: e.target.value })}
                    className="input"
                  >
                    <option value="public">Public - Visible to community</option>
                    <option value="private">Private - Only visible to you</option>
                  </select>
                </div>
              )}
            </div>
          </GlassmorphismCard>
        </motion.div>

        {/* Stats and Achievements */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Stats Card */}
          <GlassmorphismCard variant="floating" intensity="medium" className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Your Progress
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm sm:text-base">Total Days</span>
                <span className="text-xl sm:text-2xl font-bold text-primary-600">{stats.totalDays}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm sm:text-base">Longest Streak</span>
                <span className="text-xl sm:text-2xl font-bold text-green-600">{stats.longestStreak}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm sm:text-base">Habits Created</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-600">{stats.habitsCreated}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm sm:text-base">Badges Earned</span>
                <span className="text-xl sm:text-2xl font-bold text-purple-600">{badges.length}</span>
              </div>
            </div>
          </GlassmorphismCard>

          {/* Badges */}
          <GlassmorphismCard variant="floating" intensity="medium" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Achievements
            </h3>
            
            {badges.length === 0 ? (
              <div className="text-center py-6">
                <Award className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">No badges earned yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  Keep tracking to earn your first badge!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {badges.slice(0, 6).map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <Award className="h-6 w-6 text-yellow-600 mb-1" />
                    <span className="text-xs font-medium text-gray-900 text-center">
                      {badge.badges?.name || 'Achievement'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassmorphismCard>

          {/* Current Habits */}
          <GlassmorphismCard variant="floating" intensity="medium" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Active Habits
            </h3>
            
            {habits.length === 0 ? (
              <div className="text-center py-6">
                <Target className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">No habits created yet</p>
                <a href="/tracker" className="text-primary-600 text-xs mt-1 block">
                  Create your first habit →
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                {habits.slice(0, 3).map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-900">{habit.name}</span>
                    <span className="text-xs text-gray-500">Active</span>
                  </div>
                ))}
                {habits.length > 3 && (
                  <a 
                    href="/tracker"
                    className="block text-center text-primary-600 text-xs mt-2"
                  >
                    View all {habits.length} habits →
                  </a>
                )}
              </div>
            )}
          </GlassmorphismCard>
        </motion.div>
      </div>

      {/* Account Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <GlassmorphismCard variant="panel" intensity="strong" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Account Settings
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-500">Receive daily reminders and tips</p>
              </div>
              <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm">
                Configure
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Privacy Settings</h4>
                <p className="text-sm text-gray-500">Control what others can see</p>
              </div>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">
                Manage
              </button>
            </div>
            
            <div className="flex items-center justify-between py-4 border-b border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Data Export</h4>
                <p className="text-sm text-gray-500">Download your habit data</p>
              </div>
              <button className="group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <span className="relative z-10">Export</span>
              </button>
            </div>
            
            {/* Enhanced Sign Out Section */}
            <div className="flex items-center justify-between py-6 bg-gradient-to-r from-red-50/50 to-pink-50/50 rounded-xl px-4 mt-4 border border-red-200/50">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                    <Power className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-500 rounded-full blur opacity-30 animate-pulse"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    Safe Sign Out
                  </h4>
                  <p className="text-sm text-gray-600">Securely end your session</p>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="group relative bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-red-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                
                <div className="relative">
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-300"></div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-300 delay-100"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-300 delay-200"></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-all duration-300 delay-300"></div>
                </div>
                
                <div className="relative z-10 flex items-center space-x-2">
                  <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180" />
                  <span>Sign Out Safely</span>
                  <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-spin" />
                </div>
                
                {/* Glowing border effect */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-red-400 group-hover:to-pink-400 transition-all duration-500"></div>
              </button>
            </div>
          </div>
        </GlassmorphismCard>
      </motion.div>
    </div>
  )
}

export default Profile
