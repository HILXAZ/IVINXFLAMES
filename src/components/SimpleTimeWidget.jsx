import React from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

const SimpleTimeWidget = () => {
  const currentTime = new Date().toLocaleTimeString()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 text-white"
    >
      <div className="flex items-center space-x-3 mb-4">
        <Clock className="w-6 h-6 text-blue-400" />
        <h3 className="text-lg font-semibold">Current Time</h3>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold mb-2">{currentTime}</div>
        <div className="text-white/70">Enhanced Time Widget Working!</div>
      </div>
    </motion.div>
  )
}

export default SimpleTimeWidget
