import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { aiService } from '../lib/ai'
import { 
  AlertTriangle, 
  Phone, 
  MessageCircle, 
  Heart, 
  Wind, 
  RefreshCw,
  Clock,
  Users,
  BookOpen,
  Zap
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import GlassmorphismCard from '../components/GlassmorphismCard'

const Emergency = () => {
  const [supportMessage, setSupportMessage] = useState('')
  const [loadingMessage, setLoadingMessage] = useState(false)
  const [breathingActive, setBreathingActive] = useState(false)
  const [breathingCount, setBreathingCount] = useState(0)

  useEffect(() => {
    generateSupportMessage()
  }, [])

  const generateSupportMessage = async () => {
    setLoadingMessage(true)
    try {
      const message = aiService.getEmergencyMessage()
      setSupportMessage(message)
    } catch (error) {
      console.error('Error generating support message:', error)
      setSupportMessage("You are stronger than you know. This feeling will pass. Take it one moment at a time.")
    } finally {
      setLoadingMessage(false)
    }
  }

  const startBreathingExercise = () => {
    setBreathingActive(true)
    setBreathingCount(0)
    
    // Breathing cycle: 4 seconds in, 4 seconds hold, 4 seconds out, 4 seconds hold
    const cycle = () => {
      if (breathingCount >= 4) {
        setBreathingActive(false)
        return
      }
      
      setTimeout(() => {
        setBreathingCount(prev => prev + 1)
        if (breathingCount < 3) {
          cycle()
        } else {
          setBreathingActive(false)
        }
      }, 16000) // Full cycle is 16 seconds
    }
    
    cycle()
  }

  const emergencyContacts = [
    {
      name: "Crisis Text Line",
      number: "Text HOME to 741741",
      description: "24/7 crisis support via text",
      type: "text"
    },
    {
      name: "National Suicide Prevention Lifeline",
      number: "988",
      description: "24/7 suicide prevention hotline",
      type: "call"
    },
    {
      name: "SAMHSA National Helpline",
      number: "1-800-662-HELP (4357)",
      description: "24/7 treatment referral service",
      type: "call"
    }
  ]

  const quickCopingStrategies = [
    {
      title: "5-4-3-2-1 Grounding",
      description: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste",
      icon: Wind,
      action: "Try Now"
    },
    {
      title: "Box Breathing",
      description: "Breathe in for 4, hold for 4, out for 4, hold for 4",
      icon: Heart,
      action: "Start Exercise"
    },
    {
      title: "Call Someone",
      description: "Reach out to a trusted friend, family member, or counselor",
      icon: Phone,
      action: "Open Contacts"
    },
    {
      title: "Safe Space",
      description: "Go to your designated safe space or remove yourself from triggers",
      icon: Zap,
      action: "Get Safe"
    }
  ]

  return (
    <div className="min-h-screen bg-red-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency Support</h1>
          <p className="text-gray-700 text-lg">
            You're not alone. Help is available right now.
          </p>
        </motion.div>

        {/* Immediate Support Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card mb-8 bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Immediate Support</h2>
                <p className="text-sm text-gray-600">AI-generated encouragement</p>
              </div>
            </div>
            <button
              onClick={generateSupportMessage}
              disabled={loadingMessage}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium"
            >
              {loadingMessage ? (
                <LoadingSpinner size="small" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>New Message</span>
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-red-100">
            {loadingMessage ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="medium" />
              </div>
            ) : (
              <p className="text-gray-800 text-lg leading-relaxed text-center font-medium">
                "{supportMessage}"
              </p>
            )}
          </div>
        </motion.div>

        {/* Crisis Hotlines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card mb-8 bg-blue-50 border-blue-200"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Phone className="h-6 w-6 text-blue-600 mr-2" />
            Crisis Support - Available 24/7
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyContacts.map((contact, index) => (
              <motion.div
                key={contact.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white p-4 rounded-lg border border-blue-100"
              >
                <div className="flex items-center mb-2">
                  {contact.type === 'call' ? (
                    <Phone className="h-5 w-5 text-blue-600 mr-2" />
                  ) : (
                    <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />
                  )}
                  <h3 className="font-semibold text-gray-900 text-sm">{contact.name}</h3>
                </div>
                <p className="text-blue-600 font-bold text-lg mb-1">{contact.number}</p>
                <p className="text-gray-600 text-xs">{contact.description}</p>
                <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors">
                  {contact.type === 'call' ? 'Call Now' : 'Text Now'}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Breathing Exercise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card mb-8 bg-green-50 border-green-200"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Wind className="h-6 w-6 text-green-600 mr-2" />
            Guided Breathing Exercise
          </h2>
          
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <motion.div
                className={`w-32 h-32 rounded-full bg-gradient-to-r from-green-400 to-blue-500 ${
                  breathingActive ? 'breathe-animation' : ''
                }`}
                animate={breathingActive ? {
                  scale: [1, 1.2, 1.2, 1, 1],
                } : {}}
                transition={breathingActive ? {
                  duration: 16,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {}}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white font-bold text-lg">
                  {breathingActive ? (
                    <div className="text-center">
                      <div>Breathe</div>
                      <div className="text-sm">Cycle {breathingCount + 1}/4</div>
                    </div>
                  ) : (
                    <Wind className="h-8 w-8" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                {breathingActive 
                  ? "Follow the circle. Breathe in as it grows, out as it shrinks."
                  : "Box breathing helps calm your nervous system and reduce anxiety."
                }
              </p>
              <p className="text-sm text-gray-600">
                Inhale for 4 seconds → Hold for 4 → Exhale for 4 → Hold for 4
              </p>
            </div>
            
            <button
              onClick={startBreathingExercise}
              disabled={breathingActive}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {breathingActive ? 'Breathing Exercise Active...' : 'Start Breathing Exercise'}
            </button>
          </div>
        </motion.div>

        {/* Quick Coping Strategies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Zap className="h-6 w-6 text-yellow-600 mr-2" />
            Quick Coping Strategies
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickCopingStrategies.map((strategy, index) => {
              const Icon = strategy.icon
              return (
                <motion.div
                  key={strategy.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Icon className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{strategy.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{strategy.description}</p>
                      <button className="text-yellow-600 hover:text-yellow-700 font-medium text-sm">
                        {strategy.action} →
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="card text-center">
            <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Support</h3>
            <p className="text-gray-600 text-sm mb-4">
              Connect with others who understand your journey
            </p>
            <a href="/community" className="btn-primary w-full">
              Join Community
            </a>
          </div>

          <div className="card text-center">
            <BookOpen className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Resource Library</h3>
            <p className="text-gray-600 text-sm mb-4">
              Access articles, videos, and recovery tools
            </p>
            <a href="/library" className="btn-primary w-full">
              Browse Resources
            </a>
          </div>
        </motion.div>

        {/* Professional Help Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">When to Seek Professional Help</h4>
              <p className="text-gray-700 text-sm">
                If you're having thoughts of self-harm or suicide, please reach out for professional help immediately. 
                You can also go to your nearest emergency room or call 911. Remember, seeking help is a sign of strength, not weakness.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Emergency
