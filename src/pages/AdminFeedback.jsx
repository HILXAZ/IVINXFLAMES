import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageCircle, 
  Star, 
  Clock, 
  User, 
  Mail, 
  Tag,
  Filter,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { db } from '../lib/supabase'
import OppenheimerBackground from '../components/OppenheimerBackground'

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([])
  const [filteredFeedback, setFilteredFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterRating, setFilterRating] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    featureRequests: 0,
    averageRating: 0,
    responseRate: 0
  })

  useEffect(() => {
    loadFeedback()
    loadStats()
  }, [])

  useEffect(() => {
    filterFeedbackData()
  }, [feedback, filterType, filterRating])

  const loadFeedback = async () => {
    try {
      const data = await db.getAllFeedback()
      setFeedback(data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading feedback:', error)
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await db.getFeedbackStats()
      setStats(statsData)
    } catch (error) {
      console.error('Error loading feedback stats:', error)
    }
  }

  const filterFeedbackData = () => {
    let filtered = feedback

    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType)
    }

    if (filterRating !== 'all') {
      filtered = filtered.filter(item => item.rating === parseInt(filterRating))
    }

    setFilteredFeedback(filtered)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeColor = (type) => {
    const colors = {
      'feature-request': 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      'bug-report': 'bg-red-500/20 text-red-300 border-red-400/30',
      'general-feedback': 'bg-green-500/20 text-green-300 border-green-400/30',
      'user-experience': 'bg-purple-500/20 text-purple-300 border-purple-400/30',
      'suggestion': 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
      'compliment': 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
    }
    return colors[type] || 'bg-gray-500/20 text-gray-300 border-gray-400/30'
  }

  const renderStars = (rating) => {
    if (!rating) return <span className="text-gray-400">No rating</span>
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
            }`}
          />
        ))}
        <span className="text-yellow-400 ml-2">{rating}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <OppenheimerBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/80">Loading feedback...</p>
          </div>
        </div>
      </OppenheimerBackground>
    )
  }

  return (
    <OppenheimerBackground>
      <div className="min-h-screen pt-20 pb-10">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Feedback Dashboard
            </h1>
            <p className="text-xl text-white/80">
              Manage and review user feedback submissions
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-white/80 text-sm">Total Feedback</p>
                  <p className="text-white text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-white/80 text-sm">Feature Requests</p>
                  <p className="text-white text-2xl font-bold">{stats.featureRequests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <Star className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-white/80 text-sm">Average Rating</p>
                  <p className="text-white text-2xl font-bold">{stats.averageRating}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-white/80 text-sm">Response Rate</p>
                  <p className="text-white text-2xl font-bold">{stats.responseRate}%</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-white/80" />
                <span className="text-white font-semibold">Filters:</span>
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-400"
              >
                <option value="all" className="bg-gray-800">All Types</option>
                <option value="feature-request" className="bg-gray-800">Feature Request</option>
                <option value="bug-report" className="bg-gray-800">Bug Report</option>
                <option value="general-feedback" className="bg-gray-800">General Feedback</option>
                <option value="user-experience" className="bg-gray-800">User Experience</option>
                <option value="suggestion" className="bg-gray-800">Suggestion</option>
                <option value="compliment" className="bg-gray-800">Compliment</option>
              </select>

              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-400"
              >
                <option value="all" className="bg-gray-800">All Ratings</option>
                <option value="5" className="bg-gray-800">5 Stars</option>
                <option value="4" className="bg-gray-800">4 Stars</option>
                <option value="3" className="bg-gray-800">3 Stars</option>
                <option value="2" className="bg-gray-800">2 Stars</option>
                <option value="1" className="bg-gray-800">1 Star</option>
              </select>

              <span className="text-white/60 ml-auto">
                Showing {filteredFeedback.length} of {feedback.length} feedback items
              </span>
            </div>
          </motion.div>

          {/* Feedback List */}
          <div className="space-y-6">
            {filteredFeedback.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-white/60" />
                      <span className="text-white font-semibold">
                        {item.name || 'Anonymous'}
                      </span>
                    </div>
                    {item.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-white/60" />
                        <span className="text-white/80 text-sm">{item.email}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    {item.type && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(item.type)}`}>
                        {item.type.replace('-', ' ').toUpperCase()}
                      </span>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-white/60" />
                      <span className="text-white/60 text-sm">{formatDate(item.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-white/90 leading-relaxed">{item.message}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {renderStars(item.rating)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white/60 text-sm">ID: {item.id.slice(0, 8)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredFeedback.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <MessageCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <p className="text-white/60 text-lg">No feedback found matching your filters.</p>
            </motion.div>
          )}
        </div>
      </div>
    </OppenheimerBackground>
  )
}

export default AdminFeedback
