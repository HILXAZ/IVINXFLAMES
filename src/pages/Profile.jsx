import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  TrendingUp,
  Award,
  Target,
  Settings,
  Power,
  Shield,
  LogOut,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import GlassmorphismCard from '../components/GlassmorphismCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { db } from '../lib/supabase'

const Profile = () => {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState({
    display_name: '',
    bio: '',
    location: '',
    birth_date: '',
    phone: '',
    privacy_level: 'public'
  })
  const [stats, setStats] = useState({
    totalDays: 0,
    longestStreak: 0,
    habitsCreated: 0,
    badgesEarned: 0
  })
  const [badges, setBadges] = useState([])
  const [habits, setHabits] = useState([])

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      try {
        setLoading(true)
        
        const [profileData, statsData, badgesData, habitsData] = await Promise.all([
          db.getUserProfile(user.id),
          db.getUserStats(user.id),
          db.getUserBadges(user.id),
          db.getUserHabits(user.id)
        ])

        if (profileData) {
          setProfile(profileData)
        }
        
        if (statsData) {
          setStats(statsData)
        }
        
        setBadges(badgesData || [])
        setHabits(habitsData || [])
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleSave = async () => {
    if (!user) return

    try {
      await db.updateUserProfile(user.id, profile)
      setEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleSignOut = async () => {
    console.log('👤 Profile: Sign out button clicked')
    
    try {
      console.log('📞 Profile: Calling signOut from AuthContext...')
      await signOut()
      console.log('✅ Profile: signOut completed successfully')
    } catch (error) {
      console.error('❌ Profile: Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Your Profile
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage your personal information and track your progress
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <GlassmorphismCard variant="panel" intensity="strong" className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                Personal Information
              </h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Email (Read Only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Address
                </label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 text-sm sm:text-base">
                  {user?.email}
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={profile.display_name}
                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                    placeholder="Enter your display name"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm sm:text-base">
                    {profile.display_name || 'Not set'}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                {editing ? (
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm sm:text-base min-h-[72px]">
                    {profile.bio || 'No bio added yet'}
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                    placeholder="Enter your location"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm sm:text-base">
                    {profile.location || 'Not set'}
                  </div>
                )}
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Birth Date
                </label>
                {editing ? (
                  <input
                    type="date"
                    value={profile.birth_date}
                    onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm sm:text-base">
                    {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString() : 'Not set'}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm sm:text-base">
                    {profile.phone || 'Not set'}
                  </div>
                )}
              </div>

              {/* Privacy Level */}
              {editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacy Level
                  </label>
                  <select
                    value={profile.privacy_level}
                    onChange={(e) => setProfile({ ...profile, privacy_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
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
