import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Zap, Star, Heart } from 'lucide-react'

const WonderButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  className = '',
  disabled = false,
  isLoading = false,
  ...props 
}) => {
  const variants = {
    primary: {
      base: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white',
      glow: 'from-blue-400 to-purple-500',
      particles: ['#3B82F6', '#8B5CF6', '#EC4899']
    },
    secondary: {
      base: 'bg-gradient-to-r from-gray-500/20 to-gray-700/20 backdrop-blur-sm border-2 border-gray-300/50 hover:from-gray-500/40 hover:to-gray-700/40 text-gray-700 hover:text-gray-900',
      glow: 'from-gray-400 to-gray-600',
      particles: ['#6B7280', '#374151', '#1F2937']
    },
    success: {
      base: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white',
      glow: 'from-emerald-400 to-teal-500',
      particles: ['#10B981', '#14B8A6', '#0D9488']
    },
    danger: {
      base: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white',
      glow: 'from-red-400 to-pink-500',
      particles: ['#EF4444', '#EC4899', '#DC2626']
    },
    warning: {
      base: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white',
      glow: 'from-yellow-400 to-orange-500',
      particles: ['#F59E0B', '#EA580C', '#D97706']
    },
    magic: {
      base: 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-700 text-white',
      glow: 'from-purple-400 via-pink-400 to-indigo-500',
      particles: ['#8B5CF6', '#EC4899', '#6366F1']
    }
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  }

  const currentVariant = variants[variant] || variants.primary
  const currentSize = sizes[size] || sizes.md

  return (
    <motion.button
      className={`
        group relative font-bold rounded-2xl transition-all duration-500 transform 
        hover:scale-105 hover:rotate-1 shadow-lg hover:shadow-2xl overflow-hidden
        ${currentVariant.base} ${currentSize} ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={disabled ? undefined : onClick}
      disabled={disabled || isLoading}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      {...props}
    >
      {/* Glowing background effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${currentVariant.glow} rounded-2xl blur opacity-0 group-hover:opacity-50 transition-all duration-500`} />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        {!disabled && currentVariant.particles.map((color, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-0 group-hover:opacity-100"
            style={{ 
              backgroundColor: color,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-700" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center space-x-2">
        {isLoading ? (
          <motion.div
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <>
            {Icon && <Icon className="w-5 h-5" />}
            <span>{children}</span>
            {variant === 'magic' && !disabled && (
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Corner sparkles */}
      {!disabled && (
        <>
          <motion.div
            className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100"
            animate={{ scale: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100"
            animate={{ scale: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
          <motion.div
            className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100"
            animate={{ scale: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
          />
          <motion.div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100"
            animate={{ scale: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.8 }}
          />
        </>
      )}

      {/* Ripple effect on click */}
      <motion.div
        className="absolute inset-0 bg-white/20 rounded-2xl opacity-0"
        whileTap={{ scale: [1, 1.2], opacity: [0, 0.3, 0] }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  )
}

// Specialized button variants
export const SignOutButton = ({ onClick, children = "Sign Out", ...props }) => (
  <WonderButton
    variant="danger"
    icon={Sparkles}
    onClick={onClick}
    className="hover:rotate-3"
    {...props}
  >
    {children}
  </WonderButton>
)

export const MagicButton = ({ onClick, children, ...props }) => (
  <WonderButton
    variant="magic"
    icon={Star}
    onClick={onClick}
    {...props}
  >
    {children}
  </WonderButton>
)

export const ActionButton = ({ onClick, children, ...props }) => (
  <WonderButton
    variant="primary"
    icon={Zap}
    onClick={onClick}
    {...props}
  >
    {children}
  </WonderButton>
)

export const HeartButton = ({ onClick, children, ...props }) => (
  <WonderButton
    variant="success"
    icon={Heart}
    onClick={onClick}
    {...props}
  >
    {children}
  </WonderButton>
)

export default WonderButton
