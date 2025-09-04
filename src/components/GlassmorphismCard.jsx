import React from 'react'
import { motion } from 'framer-motion'

const GlassmorphismCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  intensity = 'medium',
  animated = true,
  hover3D = true,
  responsive = true,
  ...props 
}) => {
  
  // Glass intensity variants with responsive considerations
  const intensityStyles = {
    light: 'bg-white/10 backdrop-blur-sm border-white/20',
    medium: 'bg-white/20 backdrop-blur-md border-white/30',
    strong: 'bg-white/30 backdrop-blur-lg border-white/40',
    ultra: 'bg-white/40 backdrop-blur-xl border-white/50'
  }

  // Variant styles for different use cases - now responsive
  const variantStyles = {
    default: 'rounded-lg sm:rounded-xl border shadow-lg',
    hero: 'rounded-xl sm:rounded-2xl border-2 shadow-2xl',
    card: 'rounded-md sm:rounded-lg border shadow-md',
    panel: 'rounded-lg sm:rounded-xl border shadow-xl',
    floating: 'rounded-xl sm:rounded-2xl border shadow-2xl ring-1 ring-white/20',
    neon: 'rounded-lg sm:rounded-xl border-2 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/30'
  }

  // Animation variants with responsive scaling
  const animationVariants = {
    initial: { 
      opacity: 0, 
      y: responsive ? 10 : 20,
      scale: 0.95,
      rotateX: responsive ? 5 : 10
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: [0.645, 0.045, 0.355, 1.000]
      }
    },
    hover: hover3D ? {
      scale: responsive ? 1.01 : 1.02,
      rotateX: responsive ? -1 : -2,
      rotateY: responsive ? 1 : 2,
      y: responsive ? -2 : -4,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    } : {
      scale: responsive ? 1.005 : 1.01,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  }

  const baseClasses = `
    relative overflow-hidden
    ${intensityStyles[intensity]}
    ${variantStyles[variant]}
    ${responsive ? 'p-3 sm:p-4 lg:p-6' : ''}
    ${className}
  `

  if (!animated) {
    return (
      <div className={baseClasses} {...props}>
        {/* Glass reflection effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-60" />
        
        {/* Subtle animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-pulse" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className={baseClasses}
      variants={animationVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      {...props}
    >
      {/* Glass reflection effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-60"
        animate={{
          background: [
            'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, transparent 100%)',
            'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.2) 30%, transparent 100%)',
            'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, transparent 100%)'
          ]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Subtle animated background */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: [
            'linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)',
            'linear-gradient(45deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 50%, rgba(59, 130, 246, 0.1) 100%)',
            'linear-gradient(45deg, rgba(236, 72, 153, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(147, 51, 234, 0.1) 100%)'
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Border glow effect */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] border border-white/40"
        animate={{
          borderColor: [
            'rgba(255, 255, 255, 0.4)',
            'rgba(59, 130, 246, 0.6)',
            'rgba(147, 51, 234, 0.6)',
            'rgba(236, 72, 153, 0.6)',
            'rgba(255, 255, 255, 0.4)'
          ]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

export default GlassmorphismCard
