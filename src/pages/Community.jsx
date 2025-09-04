import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { dateUtils } from '../lib/utils'
import { 
  Users, 
  Send, 
  MessageCircle, 
  Heart, 
  UserPlus,
  Clock,
  MoreVertical
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import GlassmorphismCard from '../components/GlassmorphismCard'
import OppenheimerBackground from '../components/OppenheimerBackground'

const Community = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (user) {
      loadMessages()
      const subscription = setupRealtimeSubscription()
      return () => supabase.removeChannel(subscription)
    }
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          created_at,
          content,
          user_id
        `)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          setMessages(current => [...current, payload.new])
        }
      )
      .subscribe()

    return channel
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || !user) return

    setSending(true)
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          user_id: user.id
        })
      
      if (error) throw error
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const supportiveReactions = ['❤️', '🙌', '💪', '🎉', '🤗', '⭐']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <OppenheimerBackground>
      <div className="h-screen flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl shadow-sm border-b border-white/10 p-4 flex-shrink-0"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Community Chat</h1>
            <p className="text-sm text-gray-200">
              A safe space to share and connect. You are anonymous.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-200" />
            <span className="text-sm font-medium text-blue-100">Live</span>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
      {messages.length === 0 ? (
            <div className="text-center py-12">
        <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h4 className="text-lg font-medium text-white mb-2">Start the conversation</h4>
        <p className="text-gray-200">
                Be the first to share something supportive.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.user_id === user.id
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isCurrentUser && (
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex-shrink-0"></div>
                  )}
                  <div className={`max-w-md p-3 rounded-lg border ${
                    isCurrentUser 
                      ? 'bg-blue-500/80 text-white border-blue-300/40' 
                      : 'bg-white/10 backdrop-blur-xl text-white border-white/20'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className={`text-xs mt-1.5 ${
                      isCurrentUser ? 'text-blue-100' : 'text-gray-200'
                    }`}>
                      {dateUtils.formatTime(message.created_at)}
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl border-t border-white/10 p-4 flex-shrink-0"
      >
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendMessage} className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-24 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {sending ? (
                <LoadingSpinner size="small" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      </motion.div>
      </div>
    </OppenheimerBackground>
  )
}

export default Community
