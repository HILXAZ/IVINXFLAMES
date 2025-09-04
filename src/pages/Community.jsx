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
    <div className="h-screen flex flex-col bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b p-4 flex-shrink-0"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Community Chat</h1>
            <p className="text-sm text-gray-500">
              A safe space to share and connect. You are anonymous.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Live</span>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Start the conversation</h4>
              <p className="text-gray-500">
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
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                  )}
                  <div className={`max-w-md p-3 rounded-lg ${
                    isCurrentUser 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white shadow-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className={`text-xs mt-1.5 ${
                      isCurrentUser ? 'text-blue-100' : 'text-gray-400'
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
        className="bg-white border-t p-4 flex-shrink-0"
      >
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendMessage} className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="input flex-1"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-24"
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
  )
}

export default Community
