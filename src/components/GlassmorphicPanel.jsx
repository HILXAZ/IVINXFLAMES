import React from 'react'
import { motion } from 'framer-motion'

const GlassmorphicPanel = ({ children, className = "", ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`
        relative overflow-hidden rounded-2xl
        ${className}
      `}
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(25px) saturate(120%)',
        boxShadow: `
          0 10px 40px rgba(0, 0, 0, 0.6),
          inset 0 1px 0 rgba(255, 255, 255, 0.02),
          0 0 80px rgba(42, 250, 223, 0.08)
        `,
        ...props.style
      }}
      {...props}
    >
      {/* Glass reflection effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.08) 0%,
            transparent 50%,
            rgba(255, 255, 255, 0.02) 100%
          )`
        }}
      />
      
      {/* Subtle border glow */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `linear-gradient(
            45deg,
            rgba(42, 250, 223, 0.1),
            transparent,
            rgba(42, 250, 223, 0.1)
          )`,
          padding: '1px',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'xor'
        }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

export default GlassmorphicPanel
