import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Chrome } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LavaGlassBackground from '../components/LavaGlassBackground'
import GlassmorphicPanel from '../components/GlassmorphicPanel'
import PremiumInput from '../components/PremiumInput'
import PremiumButton from '../components/PremiumButton'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, signInWithGoogle, resendConfirmation } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Detect embedded/webview contexts where Google blocks OAuth (shows 403)
  const isEmbeddedEnv = useMemo(() => {
    if (typeof window === 'undefined') return false
    const ua = navigator.userAgent || ''
    const inIframe = (() => {
      try { return window.self !== window.top } catch { return true }
    })()
    const webviewLike = /Electron|Headless|WebView| wv |QtWebEngine|FBAN|FBAV|Instagram|Line|MiuiBrowser|DuckDuckGo|YaApp|Snapchat|VSCodium|VSCode/i.test(ua)
    return inIframe || webviewLike
  }, [])
  // Allow deep-link redirection e.g., /login/community -> /community after login
  // We derive a 'next' path from the current pathname if it starts with /login
  const deriveNextPath = () => {
    const path = location.pathname || '/login'
    if (path === '/login') return '/dashboard'
    if (path.startsWith('/login/')) {
      const next = path.replace('/login', '') || '/dashboard'
      return next.startsWith('/') ? next : `/${next}`
    }
    return '/dashboard'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        console.log('Attempting login with:', { email: email.trim() })
        
        // Validate inputs
        if (!email.trim()) {
          alert('请输入您的邮箱地址 (Please enter your email address)')
          setLoading(false)
          return
        }
        
        if (!password.trim()) {
          alert('请输入您的密码 (Please enter your password)')
          setLoading(false)
          return
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email.trim())) {
          alert('请输入有效的邮箱地址 (Please enter a valid email address)')
          setLoading(false)
          return
        }
        
        const { data, error } = await signIn(email.trim(), password)
        
        if (error) {
          console.error('Login error:', error)
          
          if (error.message.includes('Email not confirmed')) {
            const confirmChoice = window.confirm(
              '您的邮箱尚未确认。是否需要重新发送确认邮件？ (Your email is not confirmed. Would you like us to resend the confirmation email?)'
            )
            if (confirmChoice) {
              await resendConfirmation(email.trim())
              alert('确认邮件已发送！请查看您的邮箱。(Confirmation email sent! Please check your inbox.)')
            }
          } else if (error.message.includes('Invalid login credentials')) {
            alert('邮箱或密码无效。请检查您的凭据后重试。(Invalid email or password. Please check your credentials and try again.)')
          } else {
            alert(`登录失败：${error.message} (Login failed: ${error.message})`)
          }
        } else if (data && data.user) {
          console.log('Login successful:', data)
          console.log('User data:', data.user)
          console.log('Session data:', data.session)
          
          // Clear form on successful login
          setEmail('')
          setPassword('')
          
          // Success message
          alert('欢迎回来！正在跳转到您的控制面板... (Welcome back! Redirecting to your dashboard...)')
          
          // Navigate to intended destination
          setTimeout(() => {
            navigate(deriveNextPath(), { replace: true })
          }, 500)
        } else {
          console.warn('Login returned no error but also no user data:', data)
          alert('登录出现问题，请重试。(Login issue occurred, please try again.)')
        }
      } else {
        console.log('Attempting signup with:', { email: email.trim(), name: name.trim() })
        
        // Validate inputs
        if (!name.trim()) {
          alert('请输入您的全名 (Please enter your full name)')
          setLoading(false)
          return
        }
        
        if (!email.trim()) {
          alert('请输入您的邮箱地址 (Please enter your email address)')
          setLoading(false)
          return
        }
        
        if (!password.trim()) {
          alert('请输入您的密码 (Please enter your password)')
          setLoading(false)
          return
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email.trim())) {
          alert('请输入有效的邮箱地址 (Please enter a valid email address)')
          setLoading(false)
          return
        }
        
        // Password strength validation
        if (password.length < 6) {
          alert('密码至少需要6个字符 (Password must be at least 6 characters long)')
          setLoading(false)
          return
        }
        
        const { data, error } = await signUp(email.trim(), password, { name: name.trim() })
        
        if (error) {
          console.error('Signup error:', error)
          alert(`注册失败：${error.message} (Registration failed: ${error.message})`)
        } else if (data && data.user) {
          console.log('Signup successful:', data)
          
          // Check if user is immediately available (auto-confirmed)
          if (data.user && data.session) {
            console.log('User auto-confirmed, redirecting to dashboard')
            
            // Clear form
            setName('')
            setEmail('')
            setPassword('')
            
            alert('注册成功！欢迎开始您的康复之旅。(Registration successful! Welcome to your recovery journey.)')
            
            setTimeout(() => {
              navigate(deriveNextPath(), { replace: true })
            }, 500)
          } else if (data.user) {
            console.log('User created, but needs email confirmation')
            
            // Clear form
            setName('')
            setEmail('')
            setPassword('')
            
            alert('注册成功！请查看您的邮箱确认账户，然后您可以登录。(Registration successful! Please check your email to confirm your account, then you can sign in.)')
            setIsLogin(true)
          } else {
            // Clear form
            setName('')
            setEmail('')
            setPassword('')
            
            alert('注册成功！您现在可以使用凭据登录。(Registration successful! You can now sign in with your credentials.)')
            setIsLogin(true)
          }
        } else {
          console.warn('Signup returned no error but also no user data:', data)
          alert('注册出现问题，请重试。(Registration issue occurred, please try again.)')
        }
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      setLoading(true)
      console.log('Attempting Google authentication...')
      
      const { data, error } = await signInWithGoogle()
      
      if (error) {
        console.error('Google auth error:', error)
        if (error.message.includes('popup')) {
          alert('请允许弹出窗口以进行Google身份验证，或重试。(Please allow popups for Google authentication or try again.)')
        } else if (error.message.includes('not available')) {
          alert('Google登录当前不可用，请使用邮箱密码登录。(Google login is currently not available, please use email/password.)')
        } else {
          alert(`Google身份验证失败：${error.message} (Google authentication failed: ${error.message})`)
        }
      } else if (data && data.url) {
        console.log('Google auth initiated, redirecting to:', data.url)
        // The user will be redirected to Google for authentication
        // After successful auth, they'll be redirected back to /auth/callback
      } else {
        console.log('Google auth successful:', data)
        // Navigation will be handled by the auth state change in AuthContext
      }
    } catch (error) {
      console.error('Google authentication error:', error)
      alert('Google身份验证失败。请重试或使用邮箱密码登录。(Google authentication failed. Please try again or use email/password.)')
    } finally {
      setLoading(false)
    }
  }

  // Chinese color palette
  const chineseColors = {
    primary: '#DC143C',    // Chinese Red
    secondary: '#FFD700',  // Imperial Gold
    accent: '#1C1C1C',     // Deep Black
    white: '#FFFFFF',
    jade: '#00A86B',       // Jade Green
    ink: '#2C3E50'         // Ink Blue
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Chinese-Style Background */}
      <div className="fixed inset-0 z-0">
        {/* Chinese Flag Inspired Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, 
                ${chineseColors.primary} 0%, 
                ${chineseColors.secondary} 50%, 
                ${chineseColors.accent} 100%
              )
            `,
            opacity: 0.9
          }}
        />
        
        {/* Traditional Chinese-style animated particles (lanterns and stars) */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: i % 4 === 0 ? chineseColors.primary : 
                           i % 4 === 1 ? chineseColors.secondary : 
                           i % 4 === 2 ? chineseColors.jade :
                           chineseColors.white,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, -15, 0],
                scale: [1, 1.3, 0.7, 1],
                opacity: [0.4, 0.9, 0.4]
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
            />
          ))}
        </div>

        {/* Chinese dragon wave patterns */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            background: `
              repeating-linear-gradient(
                60deg,
                transparent,
                transparent 25px,
                ${chineseColors.primary} 25px,
                ${chineseColors.primary} 27px,
                transparent 27px,
                transparent 50px,
                ${chineseColors.secondary} 50px,
                ${chineseColors.secondary} 52px
              )
            `,
            animation: 'chineseDragonWave 12s linear infinite'
          }}
        />

        {/* Traditional Chinese coins pattern */}
        <div className="absolute inset-0 opacity-8">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-20 h-20 rounded-full border-4"
              style={{
                borderColor: chineseColors.secondary,
                left: `${15 + i * 15}%`,
                top: `${15 + (i % 2) * 60}%`,
              }}
              animate={{
                rotate: 360,
                scale: [1, 1.15, 1]
              }}
              transition={{
                duration: 15 + i * 3,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {/* Inner square hole like traditional Chinese coins */}
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6"
                style={{ 
                  border: `2px solid ${chineseColors.secondary}`,
                  backgroundColor: 'transparent'
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-auto p-6"
      >
        {/* Embedded environment warning (prevents Google OAuth 403) */}
        {isEmbeddedEnv && (
          <div className="mb-4 p-4 rounded-xl border-2" style={{ borderColor: '#DC143C', background: 'rgba(220, 20, 60, 0.07)' }}>
            <p className="font-semibold mb-2" style={{ color: '#1C1C1C' }}>
              Google 登录在嵌入式浏览器中被阻止 (Google sign-in is blocked in embedded browsers)
            </p>
            <p className="text-sm mb-3" style={{ color: '#1C1C1C' }}>
              请在系统浏览器中打开此链接以继续：
              <span className="break-all ml-1 underline">{window.location.origin}</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.open(window.location.href, '_blank', 'noopener')}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: '#DC143C' }}
              >
                在系统浏览器中打开 (Open in Browser)
              </button>
              <button
                type="button"
                onClick={async () => { try { await navigator.clipboard.writeText(window.location.href) } catch {} }}
                className="px-3 py-2 rounded-lg text-sm font-semibold"
                style={{ border: '2px solid #FFD700', color: '#1C1C1C', background: 'white' }}
              >
                复制链接 (Copy Link)
              </button>
            </div>
          </div>
        )}
        {/* Chinese-Style Glass Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl p-8"
          style={{
            background: 'rgba(255, 255, 255, 0.96)',
            border: `3px solid ${chineseColors.secondary}`,
            boxShadow: `
              0 25px 70px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.9),
              0 0 0 1px ${chineseColors.primary}
            `,
            backdropFilter: 'blur(8px) saturate(180%)'
          }}
        >
          {/* Chinese decorative elements */}
          <div 
            className="absolute top-0 left-0 right-0 h-3"
            style={{
              background: `linear-gradient(90deg, 
                ${chineseColors.primary} 0%, 
                ${chineseColors.secondary} 25%,
                ${chineseColors.jade} 50%, 
                ${chineseColors.secondary} 75%,
                ${chineseColors.primary} 100%
              )`
            }}
          />
          
          {/* Traditional Chinese corner decorations (coins) */}
          <div 
            className="absolute top-4 right-4 w-10 h-10 rounded-full border-2 opacity-25 flex items-center justify-center"
            style={{ borderColor: chineseColors.primary }}
          >
            <div 
              className="w-3 h-3"
              style={{ border: `1px solid ${chineseColors.primary}` }}
            />
          </div>
          <div 
            className="absolute bottom-4 left-4 w-8 h-8 rounded-full opacity-20"
            style={{ background: chineseColors.secondary }}
          />

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <h1 
                className="text-4xl font-bold mb-2 tracking-tight"
                style={{ color: chineseColors.primary }}
              >
                欢迎回来 (Welcome Back)
              </h1>
              <h2 
                className="text-2xl font-semibold mb-3"
                style={{ color: chineseColors.accent }}
              >
                {isLogin ? '继续您的康复之旅 (Continue Your Recovery Journey)' : '加入康复社区 (Join Recovery)'}
              </h2>
              <div 
                className="w-24 h-1 mx-auto rounded-full"
                style={{
                  background: `linear-gradient(90deg, 
                    ${chineseColors.primary}, 
                    ${chineseColors.secondary}, 
                    ${chineseColors.jade},
                    ${chineseColors.primary}
                  )`
                }}
              />
      speech to voice,voice to speech assistant is not working properly ,any api key reqired      </motion.div>
            
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg leading-relaxed font-medium"
              style={{ color: chineseColors.ink }}
            >
              {isLogin 
                ? '继续您的自由与康复之旅 (Continue your journey to freedom and healing)' 
                : '与我们支持性社区一起开始您的转变 (Begin your transformation with our supportive community)'
              }
            </motion.p>
          </div>

          {/* Chinese-style motivational text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 p-4 rounded-xl"
            style={{
              background: `linear-gradient(135deg, 
                rgba(220, 20, 60, 0.1), 
                rgba(255, 215, 0, 0.1),
                rgba(0, 168, 107, 0.1)
              )`,
              border: `2px solid ${chineseColors.secondary}`,
              boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.6)`
            }}
          >
            <p 
              className="text-lg text-center font-semibold italic"
              style={{ color: chineseColors.primary }}
            >
              "千里之行，始于足下 - Every journey of a thousand miles begins with a single step. Your healing path starts today."
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="您的全名 (Your Full Name)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full px-4 py-3 rounded-xl text-lg font-semibold"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: `2px solid ${chineseColors.primary}`,
                    color: chineseColors.accent,
                    boxShadow: `inset 0 2px 4px rgba(0, 0, 0, 0.1)`
                  }}
                />
                <User className="absolute right-3 top-3 w-6 h-6" style={{ color: chineseColors.primary }} />
              </div>
            )}

            <div className="relative">
              <input
                type="email"
                placeholder="输入您的邮箱地址 (Enter your email address)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-lg font-semibold"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: `2px solid ${chineseColors.primary}`,
                  color: chineseColors.accent,
                  boxShadow: `inset 0 2px 4px rgba(0, 0, 0, 0.1)`
                }}
              />
              <Mail className="absolute right-3 top-3 w-6 h-6" style={{ color: chineseColors.primary }} />
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="输入您的密码 (Enter your password)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-lg font-semibold"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: `2px solid ${chineseColors.primary}`,
                  color: chineseColors.accent,
                  boxShadow: `inset 0 2px 4px rgba(0, 0, 0, 0.1)`
                }}
              />
              <Lock className="absolute right-3 top-3 w-6 h-6" style={{ color: chineseColors.primary }} />
            </div>

            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl text-xl font-bold text-white transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, 
                    ${chineseColors.primary} 0%, 
                    ${chineseColors.secondary} 50%, 
                    ${chineseColors.primary} 100%
                  )`,
                  border: `2px solid ${chineseColors.jade}`,
                  boxShadow: `
                    0 8px 25px rgba(220, 20, 60, 0.4),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3)
                  `
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: `
                    0 12px 35px rgba(220, 20, 60, 0.5),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3)
                  `
                }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? '正在加载... (Loading...)' : (isLogin ? '开始康复会话 (Begin Recovery Session)' : '开始您的旅程 (Start Your Journey)')}
              </motion.button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div 
                  className="w-full h-1 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, 
                      transparent, 
                      ${chineseColors.primary}, 
                      ${chineseColors.secondary}, 
                      ${chineseColors.jade}, 
                      transparent
                    )`
                  }}
                />
              </div>
              <div className="relative flex justify-center">
                <span 
                  className="px-4 text-lg font-semibold"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.96)',
                    color: chineseColors.accent 
                  }}
                >
                  或者继续使用 (or continue with)
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <motion.button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-4 rounded-xl text-lg font-bold transition-all duration-300 flex items-center justify-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: `2px solid ${chineseColors.primary}`,
                color: '#333333',
                boxShadow: `
                  0 6px 20px rgba(0, 0, 0, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `
              }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: `
                  0 8px 25px rgba(0, 0, 0, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `
              }}
              whileTap={{ scale: 0.98 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? '正在连接... (Connecting...)' : 'Google 账户 (Google Account)'}
            </motion.button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 space-y-4">
            <div className="text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-lg font-semibold transition-colors duration-300"
                style={{ color: chineseColors.accent }}
              >
                {isLogin 
                  ? "康复新手？创建您的账户 (New to recovery? Create your account)" 
                  : '已经在康复路上？欢迎回来 (Already on your journey? Welcome back)'
                }
              </button>
            </div>

            {isLogin && (
              <div className="text-center">
                <Link
                  to="/emergency"
                  className="inline-flex items-center gap-2 text-lg font-semibold transition-colors"
                  style={{ color: '#DC2626' }}
                >
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  需要紧急帮助？ (Need immediate support? Emergency Help)
                </Link>
              </div>
            )}
          </div>

          {/* Recovery resources hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center p-4 rounded-lg"
            style={{
              background: `rgba(220, 20, 60, 0.1)`,
              border: `1px solid ${chineseColors.primary}`
            }}
          >
            <p 
              className="text-sm font-semibold"
              style={{ color: chineseColors.accent }}
            >
              <strong style={{ color: chineseColors.primary }}>24/7全天候支持 (24/7 support)</strong> • 
              <strong style={{ color: chineseColors.primary }}> 跟踪进展 (Track progress)</strong> • 
              <strong style={{ color: chineseColors.primary }}> 联系他人 (Connect with others)</strong>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes chineseDragonWave {
          0% { transform: translateX(-120px); }
          100% { transform: translateX(120px); }
        }
      `}</style>
    </div>
  )
}

export default Login
