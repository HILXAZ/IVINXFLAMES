import React from 'react'
import { motion } from 'framer-motion'

const PremiumButton = ({ 
  children, 
  onClick, 
  variant = "primary", 
  className = "", 
  disabled = false,
  loading = false,
  icon: Icon,
  ...props 
}) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #2afadf 0%, #1e40af 100%)',
      border: '1px solid rgba(42, 250, 223, 0.5)',
      shadow: '0 8px 32px rgba(42, 250, 223, 0.3)'
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    },
    outline: {
      background: 'transparent',
      border: '2px solid rgba(42, 250, 223, 0.5)',
      shadow: '0 4px 20px rgba(42, 250, 223, 0.1)'
    }
  }

  const currentVariant = variants[variant]

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: disabled ? 1 : 1.05,
        boxShadow: disabled ? currentVariant.shadow : '0 12px 40px rgba(42, 250, 223, 0.4)'
      }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden rounded-xl px-8 py-3 font-medium text-white
        transition-all duration-300 ease-out
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        background: currentVariant.background,
        border: currentVariant.border,
        boxShadow: currentVariant.shadow,
        backdropFilter: 'blur(15px) saturate(120%)',
        fontSize: '15px',
        fontWeight: '500',
        letterSpacing: '0.5px',
        height: '48px',
        minWidth: '120px'
      }}
      {...props}
    >
      {/* Animated background overlay */}
      <motion.div
        className="absolute inset-0"
        animate={!disabled ? {
          background: [
            'linear-gradient(45deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.1))',
            'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
            'linear-gradient(45deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.1))'
          ]
        } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-0"
        whileHover={!disabled ? { 
          opacity: [0, 1, 0],
          x: ['-100%', '100%']
        } : {}}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
          width: '30%'
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
          />
        )}
        {Icon && !loading && <Icon size={18} />}
        <span>{children}</span>
      </div>

      {/* Border glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        whileHover={!disabled ? {
          boxShadow: [
            '0 0 20px rgba(42, 250, 223, 0.3)',
            '0 0 40px rgba(42, 250, 223, 0.5)',
            '0 0 20px rgba(42, 250, 223, 0.3)'
          ]
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.button>
  )
}

export default PremiumButton
