import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

const PremiumInput = ({ 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  icon: Icon,
  className = "",
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative group ${className}`}
    >
      <div 
        className={`
          relative flex items-center rounded-xl overflow-hidden
          transition-all duration-300 ease-out
          ${isFocused ? 'scale-105' : 'hover:scale-102'}
        `}
        style={{
          background: isFocused 
            ? 'rgba(255, 255, 255, 0.12)' 
            : 'rgba(255, 255, 255, 0.06)',
          border: isFocused 
            ? '1px solid rgba(42, 250, 223, 0.5)' 
            : '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(15px) saturate(120%)',
          boxShadow: isFocused 
            ? '0 8px 32px rgba(42, 250, 223, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
            : '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Animated background gradient */}
        <motion.div 
          className="absolute inset-0 pointer-events-none rounded-xl"
          animate={{
            background: isFocused 
              ? [
                  'linear-gradient(45deg, rgba(42, 250, 223, 0.05), transparent)',
                  'linear-gradient(135deg, rgba(42, 250, 223, 0.08), transparent)',
                  'linear-gradient(45deg, rgba(42, 250, 223, 0.05), transparent)'
                ]
              : 'linear-gradient(45deg, transparent, transparent)'
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Icon */}
        {Icon && (
          <div className="flex items-center justify-center w-12 h-12 text-white/60">
            <Icon 
              size={18} 
              className={`transition-colors duration-300 ${
                isFocused ? 'text-[#2afadf]' : 'text-white/60'
              }`} 
            />
          </div>
        )}

        {/* Input */}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            flex-1 h-12 px-4 bg-transparent text-white placeholder-white/40
            focus:outline-none focus:placeholder-white/60
            transition-all duration-300
            ${Icon ? 'pl-0' : 'pl-4'}
          `}
          style={{
            fontSize: '15px',
            fontWeight: '400',
            letterSpacing: '0.5px'
          }}
          {...props}
        />

        {/* Password toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="flex items-center justify-center w-12 h-12 text-white/60 hover:text-[#2afadf] transition-colors duration-300"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {/* Focus ring effect */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{
          boxShadow: isFocused 
            ? '0 0 30px rgba(42, 250, 223, 0.2)' 
            : '0 0 0px rgba(42, 250, 223, 0)'
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

export default PremiumInput
