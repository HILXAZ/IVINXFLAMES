import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { aiService } from '../lib/ai'
import { db } from '../lib/supabase'
import { motion } from 'framer-motion'
import { Lightbulb, RefreshCw, Heart, Brain, Shield, Star, Zap, Target } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import GlassmorphismCard from '../components/GlassmorphismCard'

const Tips = () => {
  const { user } = useAuth()
  const [dailyTip, setDailyTip] = useState('')
  const [motivationalQuote, setMotivationalQuote] = useState('')
  const [habits, setHabits] = useState([])
  const [loadingTip, setLoadingTip] = useState(false)
  const [loadingQuote, setLoadingQuote] = useState(false)

  // Predefined tips categories
  const tipCategories = [
    {
      title: "Mindfulness & Meditation",
      icon: Brain,
      color: "purple",
      tips: [
        "Practice deep breathing for 5 minutes when you feel a craving coming on.",
        "Try a body scan meditation to become aware of physical sensations without judgment.",
        "Use the 5-4-3-2-1 grounding technique: 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
        "Set mindfulness reminders throughout your day to check in with yourself."
      ]
    },
    {
      title: "Healthy Coping Strategies",
      icon: Heart,
      color: "red",
      tips: [
        "Keep a list of healthy activities to do when cravings hit: walk, call a friend, listen to music.",
        "Create a 'craving survival kit' with items that bring you comfort and distraction.",
        "Practice progressive muscle relaxation to release physical tension.",
        "Write in a journal about your feelings instead of acting on impulses."
      ]
    },
    {
      title: "Building Support Systems",
      icon: Shield,
      color: "green",
      tips: [
        "Share your goals with trusted friends or family members who can support you.",
        "Consider joining a support group or online community with similar goals.",
        "Have a buddy system - someone you can call when you need encouragement.",
        "Don't be afraid to ask for professional help when you need it."
      ]
    },
    {
      title: "Lifestyle Changes",
      icon: Zap,
      color: "yellow",
      tips: [
        "Establish a consistent sleep schedule to support your mental health.",
        "Stay hydrated throughout the day - dehydration can worsen mood and cravings.",
        "Incorporate regular exercise, even just a 10-minute walk can help.",
        "Plan healthy meals and snacks to maintain stable blood sugar levels."
      ]
    }
  ]

  useEffect(() => {
    loadUserData()
    generateDailyContent()
  }, [user])

  const loadUserData = async () => {
    if (!user) return
    
    try {
      const habitsData = await db.getHabits(user.id)
      setHabits(habitsData || [])
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const generateDailyContent = async () => {
    setLoadingTip(true)
    setLoadingQuote(true)

    try {
      const [tip, quote] = await Promise.all([
        aiService.generateMotivationalTip(),
        aiService.getFallbackQuote()
      ])
      
      setDailyTip(tip)
      setMotivationalQuote(quote)
    } catch (error) {
      console.error('Error generating content:', error)
      setDailyTip(aiService.getFallbackQuote())
      setMotivationalQuote(aiService.getFallbackQuote())
    } finally {
      setLoadingTip(false)
      setLoadingQuote(false)
    }
  }

  const generatePersonalizedTip = async () => {
    if (habits.length === 0) {
      generateDailyContent()
      return
    }

    setLoadingTip(true)
    try {
      const primaryHabit = habits[0]
      const tip = await aiService.generatePersonalizedTip(user, primaryHabit, 0)
      setDailyTip(tip)
    } catch (error) {
      console.error('Error generating personalized tip:', error)
      setDailyTip(aiService.getFallbackQuote())
    } finally {
      setLoadingTip(false)
    }
  }

  const refreshQuote = async () => {
    setLoadingQuote(true)
    try {
      const quote = await aiService.generateMotivationalTip()
      setMotivationalQuote(quote)
    } catch (error) {
      console.error('Error refreshing quote:', error)
      setMotivationalQuote(aiService.getFallbackQuote())
    } finally {
      setLoadingQuote(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Motivation & Tips</h1>
        <p className="text-gray-600">
          Get personalized advice and motivation to support your recovery journey.
        </p>
      </motion.div>

      {/* AI-Generated Daily Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-8 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg mr-3">
              <Lightbulb className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Today's AI Tip</h2>
              <p className="text-sm text-gray-600">Personalized motivation just for you</p>
            </div>
          </div>
          <button
            onClick={generatePersonalizedTip}
            disabled={loadingTip}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            {loadingTip ? (
              <LoadingSpinner size="small" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Refresh</span>
          </button>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-primary-100">
          {loadingTip ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="medium" />
            </div>
          ) : (
            <p className="text-gray-800 leading-relaxed italic">"{dailyTip}"</p>
          )}
        </div>
      </motion.div>

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quote of the Day</h2>
              <p className="text-sm text-gray-600">Words of encouragement</p>
            </div>
          </div>
          <button
            onClick={refreshQuote}
            disabled={loadingQuote}
            className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium"
          >
            {loadingQuote ? (
              <LoadingSpinner size="small" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>New Quote</span>
          </button>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-green-100">
          {loadingQuote ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="medium" />
            </div>
          ) : (
            <p className="text-gray-800 leading-relaxed italic text-center">"{motivationalQuote}"</p>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
      >
        <div className="card text-center">
          <Target className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Today's Goal</h3>
          <p className="text-gray-600 text-sm mb-4">
            Define a specific, achievable goal for today
          </p>
          <button className="btn-primary w-full">
            Create Goal
          </button>
        </div>

        <div className="card text-center">
          <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Support?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Connect with our community or emergency help
          </p>
          <div className="flex space-x-2">
            <a href="/community" className="flex-1 btn-secondary text-sm py-2">
              Community
            </a>
            <a href="/emergency" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg text-sm">
              SOS Help
            </a>
          </div>
        </div>
      </motion.div>

      {/* Tips Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-8"
      >
        <h2 className="text-2xl font-bold text-gray-900">Recovery Tips & Strategies</h2>
        
        {tipCategories.map((category, categoryIndex) => {
          const Icon = category.icon
          const colorClasses = {
            purple: 'from-purple-50 to-indigo-50 border-purple-200',
            red: 'from-red-50 to-pink-50 border-red-200',
            green: 'from-green-50 to-emerald-50 border-green-200',
            yellow: 'from-yellow-50 to-orange-50 border-yellow-200'
          }

          return (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + categoryIndex * 0.1 }}
              className={`card bg-gradient-to-r ${colorClasses[category.color]}`}
            >
              <div className="flex items-center mb-4">
                <div className={`p-2 bg-${category.color}-100 rounded-lg mr-3`}>
                  <Icon className={`h-6 w-6 text-${category.color}-600`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.tips.map((tip, tipIndex) => (
                  <motion.div
                    key={tipIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + categoryIndex * 0.1 + tipIndex * 0.05 }}
                    className="bg-white p-4 rounded-lg border border-gray-100"
                  >
                    <p className="text-gray-700 text-sm leading-relaxed">{tip}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Additional Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-12 card bg-gray-50"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Want More Resources?</h3>
        <p className="text-gray-600 mb-4">
          Explore our comprehensive library of articles, videos, and tools to support your recovery journey.
        </p>
        <a
          href="/library"
          className="btn-primary inline-flex items-center space-x-2"
        >
          <Lightbulb className="h-4 w-4" />
          <span>Browse Resource Library</span>
        </a>
      </motion.div>
    </div>
  )
}

export default Tips
