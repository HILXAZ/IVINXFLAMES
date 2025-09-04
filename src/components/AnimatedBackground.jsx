import React from 'react'
import { motion } from 'framer-motion'

const AnimatedBackground = ({ children, variant = 'default' }) => {
  const variants = {
    default: {
      background: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50',
      overlay: 'from-blue-500/5 via-purple-500/5 to-pink-500/5'
    },
    dark: {
      background: 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900',
      overlay: 'from-blue-500/10 via-purple-500/10 to-pink-500/10'
    },
    recovery: {
      background: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50',
      overlay: 'from-emerald-500/5 via-teal-500/5 to-cyan-500/5'
    }
  }

  const currentVariant = variants[variant] || variants.default

  // Floating particles
  const particles = Array.from({ length: 30 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute rounded-full opacity-20"
      style={{
        width: Math.random() * 10 + 5,
        height: Math.random() * 10 + 5,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        background: `linear-gradient(45deg, 
          ${i % 3 === 0 ? '#3B82F6' : i % 3 === 1 ? '#8B5CF6' : '#EC4899'}, 
          ${i % 3 === 0 ? '#1D4ED8' : i % 3 === 1 ? '#7C3AED' : '#DB2777'})`
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, Math.random() * 20 - 10, 0],
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.6, 0.2],
      }}
      transition={{
        duration: 4 + Math.random() * 4,
        repeat: Infinity,
        delay: Math.random() * 2,
        ease: "easeInOut"
      }}
    />
  ))

  // Geometric shapes
  const shapes = Array.from({ length: 8 }, (_, i) => (
    <motion.div
      key={`shape-${i}`}
      className="absolute opacity-10"
      style={{
        left: `${Math.random() * 90}%`,
        top: `${Math.random() * 90}%`,
      }}
      animate={{
        rotate: [0, 360],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8 + Math.random() * 4,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      {i % 3 === 0 ? (
        <div className="w-20 h-20 border-2 border-blue-400 rounded-full" />
      ) : i % 3 === 1 ? (
        <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 transform rotate-45" />
      ) : (
        <div className="w-12 h-12 border-2 border-emerald-400 transform rotate-45" />
      )}
    </motion.div>
  ))

  return (
    <div className={`min-h-screen relative overflow-hidden ${currentVariant.background}`}>
      {/* Animated gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentVariant.overlay}`}>
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              `linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))`,
              `linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))`,
              `linear-gradient(225deg, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))`,
              `linear-gradient(315deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))`
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Glass morphism layer */}
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles}
      </div>

      {/* Geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {shapes}
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Floating light orbs */}
      <div className="absolute inset-0">
        {Array.from({ length: 5 }, (_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-32 h-32 rounded-full opacity-10 blur-xl"
            style={{
              background: `radial-gradient(circle, 
                ${i % 3 === 0 ? '#3B82F6' : i % 3 === 1 ? '#8B5CF6' : '#EC4899'} 0%, 
                transparent 70%)`,
              left: `${20 + i * 15}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -100, 50, 0],
              scale: [1, 1.3, 0.8, 1],
            }}
            transition={{
              duration: 12 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default AnimatedBackground
