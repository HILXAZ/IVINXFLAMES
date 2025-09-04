import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('Processing authentication...')

  // Chinese color palette
  const chineseColors = {
    primary: '#DC143C',    // Chinese Red
    secondary: '#FFD700',  // Imperial Gold
    accent: '#1C1C1C',     // Deep Black
    jade: '#00A86B'        // Jade Green
  }

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing auth callback...')
        
        // Get URL parameters to understand the auth type
        const urlParams = new URLSearchParams(window.location.search)
        const type = urlParams.get('type')
        const accessToken = urlParams.get('access_token')
        
        console.log('Auth callback type:', type, 'hasAccessToken:', !!accessToken)
        
        if (type === 'signup' || type === 'email_confirmation') {
          setMessage('正在确认您的邮箱... (Confirming your email...)')
          
          // Handle email confirmation - get session after confirmation
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('Email confirmation error:', error)
            setError('邮箱确认失败，请重新登录 (Failed to confirm email. Please try logging in again.)')
            setTimeout(() => navigate('/login'), 3000)
            return
          }

          if (data.session) {
            setMessage('邮箱已确认！欢迎开始您的康复之旅 (Email confirmed! Welcome to your recovery journey.)')
            console.log('Email confirmed successfully, user logged in')
            setTimeout(() => navigate('/dashboard'), 2000)
          } else {
            setMessage('邮箱已确认！请使用您的凭据登录 (Email confirmed! Please sign in with your credentials.)')
            console.log('Email confirmed but no session, redirecting to login')
            setTimeout(() => navigate('/login'), 2000)
          }
        } else {
          // Handle OAuth callback (Google, etc.)
          setMessage('正在完成登录... (Completing sign in...)')
          
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('OAuth callback error:', error)
            if (error.message.includes('provider')) {
              setError('Google登录未配置，请使用邮箱密码登录 (Google sign-in is not configured. Please use email/password login.)')
            } else {
              setError('身份验证失败，请重试 (Authentication failed. Please try again.)')
            }
            setTimeout(() => navigate('/login'), 3000)
            return
          }

          if (data.session) {
            const user = data.session.user
            
            if (user.app_metadata?.provider === 'google') {
              console.log('Google OAuth successful:', user.user_metadata)
              setMessage('Google登录成功！欢迎回来 (Google sign-in successful! Welcome back.)')
            } else {
              setMessage('登录成功！欢迎回来 (Sign-in successful! Welcome back.)')
            }
            
            setTimeout(() => navigate('/dashboard'), 1500)
          } else {
            setMessage('身份验证未完成，正在重定向到登录页... (Authentication incomplete. Redirecting to login...)')
            setTimeout(() => navigate('/login'), 2000)
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('发生意外错误 (An unexpected error occurred.)')
        setTimeout(() => navigate('/login'), 3000)
      } finally {
        setLoading(false)
      }
    }

    // Add a small delay to ensure all auth state is processed
    const timer = setTimeout(handleAuthCallback, 1000)
    
    return () => clearTimeout(timer)
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div 
          className="fixed inset-0"
          style={{
            background: `linear-gradient(135deg, 
              ${chineseColors.primary} 0%, 
              ${chineseColors.secondary} 50%, 
              ${chineseColors.accent} 100%
            )`
          }}
        />
        
        <motion.div
          className="relative z-10 text-center p-8 rounded-3xl max-w-md mx-4"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '3px solid #DC2626',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-3xl">❌</span>
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-red-600">
            身份验证错误 (Authentication Error)
          </h2>
          
          <p className="text-lg text-gray-700 mb-6">
            {error}
          </p>
          
          <motion.button
            onClick={() => navigate('/login')}
            className="px-6 py-3 rounded-xl text-lg font-bold text-white"
            style={{
              background: `linear-gradient(135deg, 
                ${chineseColors.primary} 0%, 
                ${chineseColors.secondary} 50%, 
                ${chineseColors.primary} 100%
              )`
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            返回登录 (Back to Login)
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div 
        className="fixed inset-0"
        style={{
          background: `linear-gradient(135deg, 
            ${chineseColors.primary} 0%, 
            ${chineseColors.secondary} 50%, 
            ${chineseColors.accent} 100%
          )`
        }}
      />
      
      <motion.div
        className="relative z-10 text-center p-8 rounded-3xl max-w-md mx-4"
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          border: `3px solid ${chineseColors.secondary}`,
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)'
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {loading ? (
          <>
            <motion.div
              className="w-16 h-16 mx-auto mb-6 rounded-full border-4"
              style={{ borderColor: chineseColors.primary, borderTopColor: 'transparent' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ color: chineseColors.primary }}
            >
              {message.includes('确认') ? '正在确认... (Confirming...)' : '正在处理... (Processing...)'}
            </h2>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
            
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ color: chineseColors.primary }}
            >
              成功！ (Success!)
            </h2>
          </>
        )}
        
        <p 
          className="text-lg"
          style={{ color: chineseColors.accent }}
        >
          {message}
        </p>
        
        {!loading && (
          <motion.div
            className="w-32 h-1 mx-auto mt-6 rounded-full"
            style={{ background: chineseColors.primary }}
            initial={{ width: 0 }}
            animate={{ width: 128 }}
            transition={{ duration: 2 }}
          />
        )}
      </motion.div>
    </div>
  )
}
