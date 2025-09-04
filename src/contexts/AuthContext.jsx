import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Create or update user profile
        await createOrUpdateProfile(session.user)
        
        // Log authentication success
        const provider = session.user.app_metadata?.provider
        if (provider === 'google') {
          console.log('Google OAuth successful:', {
            email: session.user.email,
            name: session.user.user_metadata?.full_name,
            avatar: session.user.user_metadata?.avatar_url
          })
        } else {
          console.log('Email/password login successful:', {
            email: session.user.email
          })
        }
        
        // Redirect to dashboard after successful authentication
        if (window.location.pathname === '/login') {
          window.location.href = '/dashboard'
        }
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        // Clear state immediately
        setUser(null)
        setSession(null)
        // Redirect to login if on protected page (but don't block the UI)
        setTimeout(() => {
          if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
            window.location.href = '/login'
          }
        }, 0)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const createOrUpdateProfile = async (user) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          username: user.user_metadata?.name || 
                   user.user_metadata?.full_name || 
                   user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
    } catch (error) {
      console.error('Error creating/updating profile:', error)
    }
  }

  const signUp = async (email, password, metadata = {}) => {
    try {
      console.log('Signing up with email:', email)
      console.log('Current origin:', window.location.origin)
      
      // Signup with proper redirect configuration
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: metadata
        }
      })
      
      if (error) {
        console.error('Supabase signup error:', error)
        return { data: null, error }
      }
      
      console.log('Signup successful:', data)
      return { data, error: null }
      
    } catch (error) {
      console.error('Signup error:', error)
      return { data: null, error: { message: error.message || 'Signup failed' } }
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    try {
      console.log('Initiating Google OAuth...')
      console.log('Current origin:', window.location.origin)
      console.log('Redirect URL will be:', `${window.location.origin}/auth/callback`)
      
      // Check if Google provider is available
      const { data: providers } = await supabase.auth.getOAuthProviders?.() || { data: null }
      
      if (providers && !providers.some(p => p.name === 'google')) {
        console.warn('Google OAuth provider not configured')
        return { 
          data: null, 
          error: { message: 'Google login is not configured. Please use email/password login or contact support.' } 
        }
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      })
      
      if (error) {
        console.error('Google OAuth error:', error)
        
        // Handle specific 403 error
        if (error.message?.includes('403') || error.message?.includes('access')) {
          return { 
            data: null, 
            error: { 
              message: 'Google OAuth is not properly configured. The redirect URI needs to be added to Google Cloud Console. Please use email/password login instead or contact support.' 
            } 
          }
        }
        
        return { data: null, error }
      }
      
      console.log('Google OAuth initiated successfully')
      return { data, error: null }
      
    } catch (error) {
      console.error('Google authentication error:', error)
      
      // Handle 403 specifically
      if (error.message?.includes('403') || error.status === 403) {
        return { 
          data: null, 
          error: { 
            message: 'Google sign-in blocked (403 error). The redirect URI is not authorized. Please use email/password login or contact support to fix the Google OAuth configuration.' 
          } 
        }
      }
      
      return { 
        data: null, 
        error: { 
          message: 'Google login is currently unavailable. Please use email/password login or contact support.' 
        } 
      }
    }
  }

  const signOut = async () => {
    console.log('🚪 Sign out initiated at:', new Date().toISOString())
    try {
      // Attempt to sign out from Supabase auth first
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.warn('Supabase signOut error:', error)
      }
    } catch (err) {
      console.warn('Supabase signOut threw:', err)
    }

    try {
      // Clear local state and any cached session
      setUser(null)
      setSession(null)
      // Best-effort: clear local storage keys used by Supabase
      Object.keys(localStorage).forEach((k) => {
        if (k.toLowerCase().includes('supabase') || k.toLowerCase().includes('sb-')) {
          try { localStorage.removeItem(k) } catch (_) {}
        }
      })
      console.log('✅ Local auth state cleared at:', new Date().toISOString())
    } catch (e) {
      console.warn('Local cleanup failed:', e)
    }

    // Redirect deterministically to login
    try {
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    } catch (_) {}

    return { error: null }
  }

  const resendConfirmation = async (email) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    })
    return { data, error }
  }

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  }

  const updatePassword = async (password) => {
    const { data, error } = await supabase.auth.updateUser({
      password: password
    })
    return { data, error }
  }

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    resendConfirmation
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
