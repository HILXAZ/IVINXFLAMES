import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, useAnimation, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { 
  Brain, 
  Target, 
  Shield, 
  Users, 
  Heart, 
  Smartphone,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle,
  Zap,
  Award,
  X,
  Sunrise,
  Sun,
  Moon,
  MapPin,
  Navigation
} from 'lucide-react'
import SupportMap from '../components/SupportMap'
import VantaBirds from '../components/VantaBirds'
import { supabase, db } from '../lib/supabase'

const Landing = () => {
  const [activeFeature, setActiveFeature] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [showSupportMap, setShowSupportMap] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    type: '',
    rating: 0,
    message: ''
  })
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [feedbackStats, setFeedbackStats] = useState({
    total: 2847,
    featureRequests: 524,
    averageRating: 4.8,
    responseRate: 98
  })
  
  // Advanced animation refs and values
  const heroRef = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { stiffness: 400, damping: 40 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)
  
  // Particle system for interactive effects
  const [particles, setParticles] = useState([])
  const particleRef = useRef(null)
  
  // Advanced mouse tracking for 3D effects
  const handleMouseMove = useCallback((e) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      mouseX.set((e.clientX - centerX) / 25)
      mouseY.set((e.clientY - centerY) / 25)
    }
  }, [mouseX, mouseY])
  
  // Load feedback statistics on component mount
  useEffect(() => {
    const loadFeedbackStats = async () => {
      try {
        const stats = await db.getFeedbackStats()
        setFeedbackStats(stats)
      } catch (error) {
        console.error('Error loading feedback stats:', error)
      }
    }
    
    loadFeedbackStats()
  }, [])
  
  // Feedback form handlers
  const handleFeedbackChange = (field, value) => {
    setFeedbackForm(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleRatingClick = (rating) => {
    setFeedbackForm(prev => ({
      ...prev,
      rating
    }))
  }
  
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    setIsSubmittingFeedback(true)
    
    try {
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser()
      
      // Prepare feedback data
      const feedbackData = {
        user_id: user?.id || null,
        name: feedbackForm.name || null,
        email: feedbackForm.email || null,
        type: feedbackForm.type,
        rating: feedbackForm.rating || null,
        message: feedbackForm.message
      }
      
      // Submit to Supabase
      await db.submitFeedback(feedbackData)
      
      console.log('Feedback submitted successfully:', feedbackData)
      setFeedbackSubmitted(true)
      
      // Update feedback stats
      const newStats = await db.getFeedbackStats()
      setFeedbackStats(newStats)
      
      // Reset form after successful submission
      setTimeout(() => {
        setFeedbackForm({
          name: '',
          email: '',
          type: '',
          rating: 0,
          message: ''
        })
        setFeedbackSubmitted(false)
      }, 3000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }
  
  const handleQuickFeedback = (type) => {
    setFeedbackForm(prev => ({
      ...prev,
      type: type,
      message: `Quick feedback: ${type}`
    }))
  }
  
  // Create floating particles on click
  const createParticles = useCallback((e) => {
    const newParticles = []
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200 - 100,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        size: 2 + Math.random() * 4,
        color: `hsl(${200 + Math.random() * 60}, 70%, 60%)`
      })
    }
    setParticles(prev => [...prev, ...newParticles])
  }, [])
  
  // Animate particles
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx * 0.016,
          y: particle.y + particle.vy * 0.016,
          vy: particle.vy + 300 * 0.016, // gravity
          life: particle.life - particle.decay
        })).filter(particle => particle.life > 0)
      )
    }
    
    const interval = setInterval(animateParticles, 16)
    return () => clearInterval(interval)
  }, [])
  
  // 3D transform variants for cards
  const cardVariants = {
    initial: { 
      rotateX: 0, 
      rotateY: 0, 
      z: 0,
      scale: 1,
      boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
    },
    hover: { 
      rotateX: -10, 
      rotateY: 10, 
      z: 50,
      scale: 1.05,
      boxShadow: "0 25px 60px rgba(59, 130, 246, 0.3)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  }

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('.animate-on-scroll')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Recovery Coach",
      description: "Personalized guidance using advanced AI to support your journey with real-time insights and motivation.",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Habit Tracking & Analytics",
      description: "Track your progress with detailed analytics, streak counters, and achievement milestones to stay motivated.",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Crisis Support System",
      description: "Emergency rescue tools including breathing exercises, mindfulness guides, and instant access to help resources.",
      color: "from-red-500 to-pink-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Supportive Community",
      description: "Connect with others on similar journeys in a safe, anonymous environment for shared support and encouragement.",
      color: "from-orange-500 to-yellow-600"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Wellness Library",
      description: "Access curated resources, articles, and tools designed by addiction specialists and mental health experts.",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile-First Design",
      description: "Beautiful, responsive interface that works seamlessly across all devices with offline capabilities.",
      color: "from-teal-500 to-blue-600"
    }
  ]

  const stats = [
    { label: "Recovery Success Rate", value: "89%", icon: <CheckCircle className="w-6 h-6" /> },
    { label: "Daily Active Users", value: "12K+", icon: <Users className="w-6 h-6" /> },
    { label: "Crisis Interventions", value: "2.3K+", icon: <Shield className="w-6 h-6" /> },
    { label: "Support Communities", value: "150+", icon: <Heart className="w-6 h-6" /> }
  ]

  const timelineEvents = [
    {
      time: "Morning",
      icon: <Sunrise className="w-6 h-6 text-yellow-400" />,
      title: "Mindful Morning Check-in",
      description: "Start your day with a positive mindset. Log your mood, review your goals, and get a motivational tip from your AI coach.",
    },
    {
      time: "Afternoon",
      icon: <Sun className="w-6 h-6 text-orange-400" />,
      title: "Midday Mindfulness Break",
      description: "Feeling stressed? Access a 5-minute guided breathing exercise or a mindfulness session to reset and refocus.",
    },
    {
      time: "Evening",
      icon: <Moon className="w-6 h-6 text-indigo-400" />,
      title: "Reflect & Connect",
      description: "Log your day's achievements, journal your thoughts, and connect with the community for support and shared experiences.",
    },
    {
      time: "Anytime",
      icon: <Shield className="w-6 h-6 text-red-400" />,
      title: "24/7 Crisis Support",
      description: "Whenever you feel overwhelmed, our emergency tools and AI coach are available instantly to guide you through tough moments.",
    }
  ]

  return (
    <VantaBirds>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ 
              scale: 1.02,
              transition: { type: "spring", stiffness: 300, damping: 10 }
            }}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <motion.div 
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
              whileHover={{ 
                rotateY: 360,
                boxShadow: "0 10px 30px rgba(59, 130, 246, 0.5)",
                transition: { duration: 0.6 }
              }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                  "0 0 30px rgba(147, 51, 234, 0.4)",
                  "0 0 20px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>
            <motion.span 
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              style={{
                backgroundSize: "200% 200%"
              }}
              transition={{
                backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
              }}
            >
              MindBalance
            </motion.span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-6"
          >
            <motion.div
              whileHover={{ 
                scale: 1.05,
                color: "#ffffff"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/login"
                className="text-white/80 hover:text-white transition-colors relative group"
              >
                <span className="relative z-10">Sign In</span>
                <motion.div
                  className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 10px 20px rgba(59, 130, 246, 0.2)",
                  "0 15px 30px rgba(147, 51, 234, 0.3)",
                  "0 10px 20px rgba(59, 130, 246, 0.2)"
                ]
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform shadow-lg relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10">Get Started Free</span>
              </Link>
            </motion.div>
          </motion.div>
        </nav>
      </header>

      {/* A Day with MindBalance Modal */}
      {showTimeline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTimeline(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="relative bg-gray-900/70 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white">A Day with MindBalance</h2>
                  <p className="text-white/60 mt-1">See how our app integrates into your daily life.</p>
                </div>
                <button 
                  onClick={() => setShowTimeline(false)}
                  className="text-white/70 hover:text-white"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="relative pl-8">
                {/* Vertical line */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-white/20"></div>

                {timelineEvents.map((event, index) => (
                  <motion.div 
                    key={index}
                    className="relative mb-8"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <div className="absolute left-[-28px] top-1 w-8 h-8 bg-gray-800 rounded-full border-2 border-white/20 flex items-center justify-center">
                      {event.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white">{event.title}</h3>
                    <p className="text-white/70 mt-1">{event.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-5">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full"
            style={{
              backgroundColor: particle.color,
              width: particle.size,
              height: particle.size,
              x: particle.x,
              y: particle.y,
              opacity: particle.life,
              filter: `blur(${(1 - particle.life) * 2}px)`
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative z-10 container mx-auto px-6 py-20"
        onMouseMove={handleMouseMove}
        onClick={createParticles}
        style={{ perspective: "1000px" }}
      >
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          style={{
            transform: useTransform(
              [x, y],
              ([latestX, latestY]) => `rotateY(${latestX}deg) rotateX(${latestY}deg)`
            )
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
            style={{
              transform: useTransform(
                [x, y],
                ([latestX, latestY]) => `translateX(${latestX * 2}px) translateY(${latestY * 2}px)`
              )
            }}
          >
            <motion.span 
              className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.1)",
                  "0 0 40px rgba(59,130,246,0.2)", 
                  "0 0 20px rgba(255,255,255,0.1)"
                ]
              }}
              style={{
                backgroundSize: "200% 200%",
                filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))"
              }}
              transition={{
                backgroundPosition: { duration: 4, repeat: Infinity, ease: "linear" },
                textShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              whileHover={{
                scale: 1.02,
                filter: "drop-shadow(0 0 20px rgba(255,255,255,0.5))"
              }}
            >
              Reclaim Your Life with
            </motion.span>
            <br />
            <motion.span 
              className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                scale: [1, 1.02, 1],
                textShadow: [
                  "0 0 30px rgba(59,130,246,0.3)",
                  "0 0 60px rgba(147,51,234,0.4)",
                  "0 0 30px rgba(59,130,246,0.3)"
                ]
              }}
              style={{
                backgroundSize: "200% 200%",
                filter: "drop-shadow(0 0 15px rgba(59,130,246,0.4))"
              }}
              transition={{
                backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                textShadow: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
              }}
              whileHover={{
                scale: 1.05,
                filter: "drop-shadow(0 0 25px rgba(59,130,246,0.6))"
              }}
            >
              AI-Powered Recovery
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/80 mb-12 leading-relaxed"
            style={{
              transform: useTransform(
                [x, y],
                ([latestX, latestY]) => `translateX(${latestX}px) translateY(${latestY}px)`
              )
            }}
          >
            <motion.span
              animate={{
                opacity: [0.8, 1, 0.8],
                textShadow: [
                  "0 0 10px rgba(255,255,255,0.1)",
                  "0 0 20px rgba(255,255,255,0.2)",
                  "0 0 10px rgba(255,255,255,0.1)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileHover={{
                scale: 1.02,
                opacity: 1,
                textShadow: "0 0 25px rgba(255,255,255,0.3)"
              }}
            >
              Join thousands who've transformed their lives with our intelligent addiction recovery platform.
            </motion.span>
            <br />
            <motion.span
              animate={{
                opacity: [0.6, 0.9, 0.6],
                y: [0, -2, 0]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              whileHover={{
                scale: 1.02,
                opacity: 1,
                y: -3
              }}
            >
              Get personalized support, track progress, and build lasting habits that stick.
            </motion.span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            style={{
              transform: useTransform(
                [x, y],
                ([latestX, latestY]) => `translateX(${latestX * 0.5}px) translateY(${latestY * 0.5}px)`
              )
            }}
          >
            <motion.div
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                rotateX: -5,
                boxShadow: "0 25px 50px rgba(59, 130, 246, 0.5)",
                filter: "brightness(1.1)"
              }}
              whileTap={{ 
                scale: 0.95,
                rotateY: 0,
                rotateX: 0
              }}
              animate={{
                boxShadow: [
                  "0 15px 30px rgba(59, 130, 246, 0.3)",
                  "0 20px 40px rgba(147, 51, 234, 0.4)",
                  "0 15px 30px rgba(59, 130, 246, 0.3)"
                ],
                y: [0, -2, 0],
                rotateZ: [0, 0.5, -0.5, 0]
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotateZ: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              style={{ perspective: "1000px" }}
            >
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform shadow-2xl flex items-center space-x-2 relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/30 to-transparent"
                  initial={{ x: "-100%", skewX: -20 }}
                  whileHover={{ x: "100%", skewX: -20 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ 
                    x: ["-100%", "100%"],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: Math.random() * 2
                  }}
                />
                <motion.span 
                  className="relative z-10"
                  animate={{
                    textShadow: [
                      "0 0 5px rgba(255,255,255,0.2)",
                      "0 0 15px rgba(255,255,255,0.4)",
                      "0 0 5px rgba(255,255,255,0.2)"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Start Your Recovery Journey
                </motion.span>
                <motion.div
                  animate={{ 
                    x: [0, 3, 0],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  whileHover={{
                    x: 5,
                    scale: 1.1
                  }}
                >
                  <ArrowRight className="w-5 h-5 relative z-10" />
                </motion.div>
              </Link>
            </motion.div>
            
            <motion.button 
              onClick={() => setShowTimeline(true)}
              whileHover={{ 
                scale: 1.02,
                borderColor: "rgba(255, 255, 255, 0.8)",
                boxShadow: "0 10px 25px rgba(255, 255, 255, 0.1)",
                rotateY: -3,
                rotateX: 2
              }}
              whileTap={{ 
                scale: 0.98,
                rotateY: 0,
                rotateX: 0
              }}
              animate={{
                borderColor: [
                  "rgba(255, 255, 255, 0.3)",
                  "rgba(255, 255, 255, 0.5)",
                  "rgba(255, 255, 255, 0.3)"
                ],
                boxShadow: [
                  "0 5px 15px rgba(255, 255, 255, 0.05)",
                  "0 8px 25px rgba(255, 255, 255, 0.1)",
                  "0 5px 15px rgba(255, 255, 255, 0.05)"
                ]
              }}
              transition={{
                borderColor: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                boxShadow: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
              }}
              className="text-white/80 hover:text-white px-8 py-4 border border-white/30 rounded-xl font-semibold text-lg hover:border-white/50 transition-all duration-300 flex items-center space-x-2 relative overflow-hidden group"
              style={{ perspective: "1000px" }}
            >
              <motion.div
                className="absolute inset-0 bg-white/5"
                initial={{ scale: 0, opacity: 0, borderRadius: "50%" }}
                whileHover={{ 
                  scale: 1, 
                  opacity: 1, 
                  borderRadius: "12px",
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{ 
                  x: ["-100%", "100%"],
                  opacity: [0, 0.5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1
                }}
              />
              <motion.span 
                className="relative z-10"
                animate={{
                  textShadow: [
                    "0 0 5px rgba(255,255,255,0.1)",
                    "0 0 15px rgba(255,255,255,0.2)",
                    "0 0 5px rgba(255,255,255,0.1)"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                A Day with MindBalance
              </motion.span>
              <motion.div
                animate={{ 
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.1, 1],
                  filter: [
                    "drop-shadow(0 0 2px rgba(255,255,255,0.3))",
                    "drop-shadow(0 0 8px rgba(255,255,255,0.5))",
                    "drop-shadow(0 0 2px rgba(255,255,255,0.3))"
                  ]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                whileHover={{
                  rotate: 45,
                  scale: 1.2,
                  filter: "drop-shadow(0 0 10px rgba(255,255,255,0.8))"
                }}
              >
                <Zap className="w-5 h-5 relative z-10" />
              </motion.div>
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8"
            style={{
              transform: useTransform(
                [x, y],
                ([latestX, latestY]) => `translateX(${latestX * 0.3}px) translateY(${latestY * 0.3}px)`
              )
            }}
          >
            <motion.button 
              onClick={() => setShowSupportMap(true)}
              whileHover={{ 
                scale: 1.05,
                rotateY: 3,
                boxShadow: "0 20px 40px rgba(34, 197, 94, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 10px 20px rgba(34, 197, 94, 0.2)",
                  "0 15px 30px rgba(16, 185, 129, 0.3)",
                  "0 10px 20px rgba(34, 197, 94, 0.2)"
                ],
                y: [0, -1, 0]
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform shadow-2xl flex items-center space-x-2 mx-auto relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <MapPin className="w-5 h-5 relative z-10" />
              </motion.div>
              <span className="relative z-10">Find Support Near You</span>
              <motion.div
                animate={{ 
                  x: [0, 2, 0],
                  rotate: [0, 10, 0]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Navigation className="w-5 h-5 relative z-10" />
              </motion.div>
            </motion.button>
            <motion.p 
              className="text-white/60 text-sm mt-2"
              animate={{
                opacity: [0.6, 0.8, 0.6]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Locate hospitals, pharmacies, and support groups in your area
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.8 + index * 0.1,
                type: "spring",
                stiffness: 100 
              }}
              whileHover={{ 
                scale: 1.05,
                y: -5,
                transition: { type: "spring", stiffness: 300, damping: 10 }
              }}
            >
              <div className="flex justify-center mb-4">
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl flex items-center justify-center text-blue-400"
                  whileHover={{
                    scale: 1.1,
                    rotate: 360,
                    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)"
                  }}
                  animate={{
                    boxShadow: [
                      "0 5px 15px rgba(59, 130, 246, 0.1)",
                      "0 8px 25px rgba(147, 51, 234, 0.2)",
                      "0 5px 15px rgba(59, 130, 246, 0.1)"
                    ]
                  }}
                  transition={{
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 0.6 }
                  }}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: index * 0.5 
                    }}
                  >
                    {stat.icon}
                  </motion.div>
                </motion.div>
              </div>
              <motion.div 
                className="text-3xl font-bold text-white mb-2"
                animate={{
                  scale: [1, 1.02, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3
                }}
              >
                {stat.value}
              </motion.div>
              <motion.div 
                className="text-white/60 text-sm"
                animate={{
                  opacity: [0.6, 0.8, 0.6]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.4
                }}
              >
                {stat.label}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Comprehensive Recovery Support
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/70 max-w-3xl mx-auto"
          >
            Every tool you need for successful recovery, backed by science and powered by AI
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative group cursor-pointer ${
                activeFeature === index ? 'z-10' : ''
              }`}
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
              
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 h-full">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Coach Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-4xl font-bold text-white mb-6"
              >
                Meet Your AI Recovery Coach
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-xl text-white/80 mb-8 leading-relaxed"
              >
                Experience personalized support 24/7 with our advanced AI coach. Get real-time guidance, 
                crisis intervention, and motivation exactly when you need it most.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                {[
                  "Instant crisis support and breathing exercises",
                  "Personalized recovery strategies and tips",
                  "24/7 availability with intelligent responses",
                  "Progress tracking and milestone celebrations"
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">{item}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="relative mx-auto w-64 h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-black rounded-[2.5rem] p-6 flex flex-col">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">AI Coach</div>
                      <div className="text-green-400 text-sm">● Online</div>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4 overflow-hidden">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="bg-blue-500/20 rounded-2xl p-4"
                    >
                      <p className="text-white/90 text-sm">
                        How are you feeling today? I'm here to support your recovery journey.
                      </p>
                    </motion.div>
                    
                    <div className="bg-purple-500/20 rounded-2xl p-4">
                      <p className="text-white/90 text-sm">
                        You've maintained your streak for 7 days! That's amazing progress. 🎉
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Real Stories, Real Recovery
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/70 max-w-3xl mx-auto"
          >
            Join thousands who've transformed their lives with MindBalance
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah M.",
              story: "After 6 months with MindBalance, I've maintained my longest streak ever. The AI coach helped me through my darkest moments.",
              achievement: "180 days clean",
              avatar: "👩‍💼"
            },
            {
              name: "Mike R.",
              story: "The crisis support tools literally saved my life. Having 24/7 access to help when I needed it most changed everything.",
              achievement: "1 year sober",
              avatar: "👨‍🔧"
            },
            {
              name: "Alex T.",
              story: "The community support and AI insights helped me understand my triggers and build lasting habits. I'm finally free.",
              achievement: "2 years strong",
              avatar: "👨‍🎨"
            }
          ].map((story, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-4xl">{story.avatar}</div>
                <div>
                  <div className="text-white font-semibold">{story.name}</div>
                  <div className="text-green-400 text-sm font-medium">{story.achievement}</div>
                </div>
              </div>
              <p className="text-white/80 italic leading-relaxed">
                "{story.story}"
              </p>
              <div className="flex items-center space-x-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="relative z-10 container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-xl border border-red-300/30 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Need Immediate Help?</h3>
                <p className="text-white/80">24/7 crisis support available now</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <a
                href="tel:988"
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Call 988
              </a>
              <Link
                to="/emergency"
                className="border border-red-300 hover:bg-red-500/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Crisis Tools
              </Link>
              <button
                onClick={() => setShowSupportMap(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <MapPin className="w-4 h-4" />
                <span>Find Help Near Me</span>
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feedback Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-emerald-500/10 to-teal-600/10 backdrop-blur-xl border border-emerald-300/20 rounded-3xl p-12"
        >
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Your Voice Matters
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/80 max-w-3xl mx-auto"
            >
              Help us improve MindBalance by sharing your thoughts, suggestions, or feedback. 
              Together, we can build a better recovery platform for everyone.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Feedback Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {feedbackSubmitted ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                  <p className="text-white/80">Your feedback has been submitted successfully. We appreciate your input!</p>
                </motion.div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">Your Name (Optional)</label>
                    <input
                      type="text"
                      value={feedbackForm.name}
                      onChange={(e) => handleFeedbackChange('name', e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Email (Optional)</label>
                    <input
                      type="email"
                      value={feedbackForm.email}
                      onChange={(e) => handleFeedbackChange('email', e.target.value)}
                      placeholder="Enter your email for follow-up"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Feedback Type</label>
                    <select 
                      value={feedbackForm.type}
                      onChange={(e) => handleFeedbackChange('type', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-xl"
                    >
                      <option value="" className="bg-gray-800">Select feedback type</option>
                      <option value="feature-request" className="bg-gray-800">Feature Request</option>
                      <option value="bug-report" className="bg-gray-800">Bug Report</option>
                      <option value="general-feedback" className="bg-gray-800">General Feedback</option>
                      <option value="user-experience" className="bg-gray-800">User Experience</option>
                      <option value="suggestion" className="bg-gray-800">Suggestion</option>
                      <option value="compliment" className="bg-gray-800">Compliment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Rate Your Experience</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <motion.button
                          key={rating}
                          type="button"
                          onClick={() => handleRatingClick(rating)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 group"
                        >
                          <Star 
                            className={`w-8 h-8 transition-colors cursor-pointer ${
                              rating <= feedbackForm.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-400 group-hover:text-yellow-400'
                            }`} 
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Your Message</label>
                    <textarea
                      rows="6"
                      value={feedbackForm.message}
                      onChange={(e) => handleFeedbackChange('message', e.target.value)}
                      placeholder="Share your thoughts, suggestions, or any feedback you have about MindBalance..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-xl resize-none"
                    ></textarea>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmittingFeedback}
                    whileHover={{ 
                      scale: isSubmittingFeedback ? 1 : 1.02,
                      boxShadow: isSubmittingFeedback ? "none" : "0 20px 40px rgba(16, 185, 129, 0.4)"
                    }}
                    whileTap={{ scale: isSubmittingFeedback ? 1 : 0.98 }}
                    className={`w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-xl flex items-center justify-center space-x-2 ${
                      isSubmittingFeedback ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmittingFeedback ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5" />
                        <span>Send Feedback</span>
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>

            {/* Feedback Stats & Quick Options */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Feedback Stats */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Community Feedback</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Total Feedback Received</span>
                    <span className="text-emerald-400 font-bold">{feedbackStats.total.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Feature Requests</span>
                    <span className="text-blue-400 font-bold">{feedbackStats.featureRequests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Average Rating</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400 font-bold">{feedbackStats.averageRating}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Response Rate</span>
                    <span className="text-green-400 font-bold">{feedbackStats.responseRate}%</span>
                  </div>
                </div>
              </div>

              {/* Quick Feedback Options */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Quick Feedback</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: "👍", text: "Love it!", color: "from-green-500 to-emerald-600", type: "compliment" },
                    { icon: "💡", text: "Have an idea", color: "from-yellow-500 to-orange-600", type: "feature-request" },
                    { icon: "🐛", text: "Found a bug", color: "from-red-500 to-pink-600", type: "bug-report" },
                    { icon: "❓", text: "Need help", color: "from-blue-500 to-purple-600", type: "general-feedback" },
                  ].map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleQuickFeedback(option.type)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`bg-gradient-to-r ${option.color} p-4 rounded-xl text-white font-medium transition-all duration-300 hover:shadow-lg flex flex-col items-center space-y-2`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <span className="text-sm">{option.text}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Recent Improvements */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Recent Improvements</h3>
                <div className="space-y-3">
                  {[
                    { text: "Enhanced AI Coach responses based on user feedback", icon: "🤖" },
                    { text: "Added dark mode support (most requested feature)", icon: "🌙" },
                    { text: "Improved mobile app performance", icon: "📱" },
                    { text: "New meditation and breathing exercises", icon: "🧘" },
                  ].map((improvement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg"
                    >
                      <span className="text-xl">{improvement.icon}</span>
                      <span className="text-white/80 text-sm">{improvement.text}</span>
                      <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Contact Methods */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Other Ways to Reach Us</h3>
                <div className="space-y-3">
                  <a
                    href="mailto:feedback@mindbalance.app"
                    className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <Mail className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                    <div>
                      <div className="text-white font-medium">Email Us</div>
                      <div className="text-white/60 text-sm">feedback@mindbalance.app</div>
                    </div>
                  </a>
                  <a
                    href="#"
                    className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <MessageCircle className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                    <div>
                      <div className="text-white font-medium">Live Chat</div>
                      <div className="text-white/60 text-sm">Available 24/7</div>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands who've already started their recovery journey with MindBalance. 
            Your future self will thank you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/login"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center space-x-2"
            >
              <span>Start Free Today</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <div className="text-white/60 text-sm">
              No credit card required • Available 24/7 • Secure & Private
            </div>
          </div>
        </motion.div>
      </section>

  {/* Footer */}
  <footer className="relative z-10 container mx-auto px-6 py-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              MindBalance
            </span>
          </div>
          
          <div className="flex items-center space-x-8">
            <a href="/emergency" className="text-white/60 hover:text-white transition-colors">
              Crisis Support
            </a>
            <a href="#" className="text-white/60 hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-white/60 hover:text-white transition-colors">
              Terms
            </a>
          </div>
        </div>
        
        <div className="text-center mt-8 pt-8 border-t border-white/10">
          <p className="text-white/60">
            © 2025 MindBalance. Empowering recovery through technology.
          </p>
        </div>
      </footer>

      {/* Support Map Modal */}
      <SupportMap 
        isOpen={showSupportMap} 
        onClose={() => setShowSupportMap(false)} 
      />
  </VantaBirds>
  )
}

export default Landing
