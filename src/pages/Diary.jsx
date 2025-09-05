import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Pencil, 
  Trash2, 
  Save, 
  PlusCircle, 
  Search, 
  Calendar, 
  Smile, 
  Frown, 
  Meh, 
  Heart,
  Brain,
  FileText,
  Download,
  Clock,
  Sparkles,
  Book,
  Eye,
  EyeOff,
  Copy,
  BarChart3
} from 'lucide-react'
import { scriptAnalyzerService } from '../services/scriptAnalyzerService'

// Minimal client for the new diary ("diary") API
const API_BASE = import.meta.env.VITE_DIARY_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://ivinnsibiflamex.netlify.app/api/v1'

const Diary = () => {
  const [userId, setUserId] = useState('')
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title: '', content: '', mood: '' })
  const [editing, setEditing] = useState(null)
  
  // New smart features state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMood, setSelectedMood] = useState('')
  const [showAnalysis, setShowAnalysis] = useState({})
  const [analysisLoading, setAnalysisLoading] = useState({})
  const [entryAnalysis, setEntryAnalysis] = useState({})
  const [filteredItems, setFilteredItems] = useState([])
  const [currentView, setCurrentView] = useState('list') // 'list', 'analytics'
  const [isPrivateMode, setIsPrivateMode] = useState(true)

  const moodOptions = [
    { value: 'happy', label: 'Happy', icon: Smile, color: 'text-green-500', bg: 'bg-green-100' },
    { value: 'sad', label: 'Sad', icon: Frown, color: 'text-blue-500', bg: 'bg-blue-100' },
    { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-gray-500', bg: 'bg-gray-100' },
    { value: 'excited', label: 'Excited', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-100' },
    { value: 'stressed', label: 'Stressed', icon: Brain, color: 'text-red-500', bg: 'bg-red-100' }
  ]

  // persist selected user id
  useEffect(() => {
    const saved = localStorage.getItem('diary_user_id')
    if (saved) setUserId(saved)
  }, [])

  useEffect(() => { if (userId) localStorage.setItem('diary_user_id', userId) }, [userId])

  async function load() {
    if (!userId) return
    try {
      const res = await fetch(`${API_BASE}/dairy/${userId}`)
      const data = await res.json()
      if (res.ok) setItems(data)
      else alert(data?.error || 'Failed to load entries')
    } catch (e) {
      alert('Could not reach Diary API. Is the server running?')
    }
  }

  useEffect(() => { load() }, [userId])

  // Filter entries based on search and mood
  useEffect(() => {
    let filtered = items.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesMood = selectedMood === '' || item.mood === selectedMood
      
      return matchesSearch && matchesMood
    })
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    setFilteredItems(filtered)
  }, [items, searchTerm, selectedMood])

  // AI Analysis for diary entries
  async function analyzeEntry(entry) {
    if (analysisLoading[entry.id] || entryAnalysis[entry.id]) return
    
    setAnalysisLoading(prev => ({ ...prev, [entry.id]: true }))
    
    try {
      const analysisResult = await scriptAnalyzerService.analyzeText(entry.content)
      setEntryAnalysis(prev => ({
        ...prev,
        [entry.id]: {
          summary: analysisResult.summary,
          mood: analysisResult.detectedMood || 'neutral',
          keyTopics: analysisResult.keyTopics || [],
          sentiment: analysisResult.sentiment || 'neutral'
        }
      }))
    } catch (error) {
      console.error('Analysis failed:', error)
      setEntryAnalysis(prev => ({
        ...prev,
        [entry.id]: {
          summary: 'Analysis unavailable at the moment.',
          mood: 'neutral',
          keyTopics: [],
          sentiment: 'neutral'
        }
      }))
    } finally {
      setAnalysisLoading(prev => ({ ...prev, [entry.id]: false }))
    }
  }

  // Auto-detect mood based on content
  function detectMoodFromContent(content) {
    const text = content.toLowerCase()
    const happyWords = ['happy', 'joy', 'great', 'amazing', 'wonderful', 'excited', 'love', 'excellent']
    const sadWords = ['sad', 'depressed', 'down', 'unhappy', 'terrible', 'awful', 'bad', 'cry']
    const stressedWords = ['stress', 'anxiety', 'worried', 'panic', 'overwhelmed', 'pressure']
    const excitedWords = ['excited', 'thrilled', 'pumped', 'energetic', 'motivated']
    
    let happyScore = happyWords.filter(word => text.includes(word)).length
    let sadScore = sadWords.filter(word => text.includes(word)).length
    let stressedScore = stressedWords.filter(word => text.includes(word)).length
    let excitedScore = excitedWords.filter(word => text.includes(word)).length
    
    const maxScore = Math.max(happyScore, sadScore, stressedScore, excitedScore)
    
    if (maxScore === 0) return 'neutral'
    if (happyScore === maxScore) return 'happy'
    if (sadScore === maxScore) return 'sad'
    if (stressedScore === maxScore) return 'stressed'
    if (excitedScore === maxScore) return 'excited'
    
    return 'neutral'
  }

  async function create() {
    if (!userId) {
      alert('Please set a User ID or use Quick Guest first.')
      return
    }
    
    // Auto-detect mood if not selected
    const detectedMood = form.mood || detectMoodFromContent(form.content)
    const entryData = { ...form, mood: detectedMood, user_id: Number(userId) }
    
    try {
      const res = await fetch(`${API_BASE}/dairy`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData)
      })
      if (res.ok) { 
        setForm({ title: '', content: '', mood: '' })
        await load()
      } else { 
        const data = await res.json()
        alert(data.error || 'Create failed (check user id exists)') 
      }
    } catch (e) {
      alert('Could not reach Diary API. Is the server running?')
    }
  }

  async function saveEdit() {
    if (!editing) return
    try {
      const res = await fetch(`${API_BASE}/dairy/${userId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, title: editing.title, content: editing.content, mood: editing.mood })
      })
      if (res.ok) { setEditing(null); await load() }
      else { const data = await res.json(); alert(data.error || 'Update failed') }
    } catch (e) { alert('Could not reach Diary API. Is the server running?') }
  }

  async function remove(id) {
    try {
      const res = await fetch(`${API_BASE}/dairy/${userId}`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) await load()
      else { const data = await res.json(); alert(data.error || 'Delete failed') }
    } catch (e) { alert('Could not reach Diary API. Is the server running?') }
  }

  async function quickGuest() {
    try {
      const email = `guest+${Date.now()}@local`
      const res = await fetch(`${API_BASE}/signup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: Math.random().toString(36).slice(2) })
      })
      const data = await res.json()
      if (res.ok) { setUserId(String(data.id)); setTimeout(load, 100) }
      else alert(data.error || 'Guest create failed')
    } catch {
      alert('Could not reach Diary API to create guest user.')
    }
  }

  // Export diary entries
  function exportDiary() {
    const exportData = filteredItems.map(item => ({
      title: item.title,
      content: item.content,
      mood: item.mood,
      date: new Date(item.created_at).toLocaleDateString(),
      analysis: entryAnalysis[item.id]
    }))
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diary-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Copy entry to clipboard
  function copyEntry(entry) {
    const text = `${entry.title}\n\n${entry.content}\n\nMood: ${entry.mood}\nDate: ${new Date(entry.created_at).toLocaleString()}`
    navigator.clipboard.writeText(text)
    alert('Entry copied to clipboard!')
  }

  // Get mood statistics
  function getMoodStats() {
    const moodCounts = {}
    filteredItems.forEach(item => {
      moodCounts[item.mood] = (moodCounts[item.mood] || 0) + 1
    })
    return moodCounts
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <motion.h1 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-3xl font-bold text-blue-300 mb-6 flex items-center gap-3"
      >
        <Book className="w-8 h-8" />
        📔 American Diary
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setIsPrivateMode(!isPrivateMode)}
            className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors"
          >
            {isPrivateMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isPrivateMode ? 'Private Mode' : 'Visible Mode'}
          </button>
        </div>
      </motion.h1>

      {/* User Management Section */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
        <div className="grid md:grid-cols-4 gap-4 items-center">
          <label className="text-white/80 font-medium">User ID</label>
          <input 
            className="bg-black/30 border border-white/10 rounded-lg p-3 text-white placeholder-white/50" 
            placeholder="Enter a user id (number)" 
            value={userId} 
            onChange={e => setUserId(e.target.value)} 
          />
          <button 
            onClick={load} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Load Entries
          </button>
          <button 
            onClick={quickGuest} 
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Quick Guest
          </button>
        </div>
        <p className="text-white/60 text-sm mt-2">
          📌 No login required. If you don't have a user id, click Quick Guest to create one.
        </p>
      </div>

      {userId && (
        <>
          {/* Smart Controls Section */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Search className="w-5 h-5" />
                🔍 Find & Filter
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentView('list')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    currentView === 'list' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  📋 List View
                </button>
                <button
                  onClick={() => setCurrentView('analytics')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    currentView === 'analytics' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  📊 Analytics
                </button>
                <button
                  onClick={exportDiary}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  📁 Export
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <input
                  className="w-full bg-black/30 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50"
                  placeholder="🔍 Search your diary entries..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Mood Filter */}
              <select
                className="bg-black/30 border border-white/10 rounded-lg p-3 text-white"
                value={selectedMood}
                onChange={e => setSelectedMood(e.target.value)}
              >
                <option value="">🎭 All Moods</option>
                {moodOptions.map(mood => (
                  <option key={mood.value} value={mood.value}>
                    {mood.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="text-white/60 text-sm mt-3 flex items-center gap-2">
              <span>📈 Found {filteredItems.length} entries</span>
              {filteredItems.length > 0 && (
                <span className="text-green-400">• Last entry: {new Date(filteredItems[0]?.created_at).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          {/* Analytics View */}
          {currentView === 'analytics' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                📊 Mood Analytics & Insights
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(getMoodStats()).map(([mood, count]) => {
                  const moodOption = moodOptions.find(m => m.value === mood) || { 
                    label: mood, 
                    icon: Meh, 
                    color: 'text-gray-500' 
                  }
                  const IconComponent = moodOption.icon
                  const percentage = ((count / filteredItems.length) * 100).toFixed(1)
                  return (
                    <motion.div 
                      key={mood} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className={`w-5 h-5 ${moodOption.color}`} />
                        <span className="text-white font-medium capitalize">{mood}</span>
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">{count}</div>
                      <div className="text-white/60 text-sm">
                        {percentage}% of entries
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${moodOption.color.replace('text-', 'bg-')}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              
              {filteredItems.length > 0 && (
                <div className="mt-6 p-4 bg-black/20 rounded-lg">
                  <h4 className="text-white font-medium mb-2">📝 Quick Summary:</h4>
                  <p className="text-white/80 text-sm">
                    You've written {filteredItems.length} entries total. 
                    Your most common mood is <strong>{Object.entries(getMoodStats()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral'}</strong>.
                    Keep tracking your emotions to better understand your patterns! 🌟
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Create Entry Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              ✍️ Write New Entry
            </h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input 
                  className="bg-black/30 border border-white/10 rounded-lg p-3 text-white placeholder-white/50" 
                  placeholder="📝 Entry title (e.g., 'Today's Reflection')" 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                />
                <select
                  className="bg-black/30 border border-white/10 rounded-lg p-3 text-white"
                  value={form.mood}
                  onChange={e => setForm({ ...form, mood: e.target.value })}
                >
                  <option value="">🤖 Auto-detect mood from content</option>
                  {moodOptions.map(mood => (
                    <option key={mood.value} value={mood.value}>
                      {mood.label}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                rows={6}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white placeholder-white/50"
                placeholder="💭 What's on your mind today? Write about your feelings, experiences, thoughts, or daily events..."
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
              />
              <div className="flex gap-3">
                <button 
                  onClick={create} 
                  disabled={!form.title || !form.content}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Save className="w-5 h-5" />
                  💾 Save Entry
                </button>
                <button 
                  onClick={() => setForm({ title: '', content: '', mood: '' })}
                  className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  🗑️ Clear
                </button>
              </div>
            </div>
          </motion.div>

          {/* Entries List */}
          {currentView === 'list' && (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredItems.map((entry, index) => {
                const moodOption = moodOptions.find(m => m.value === entry.mood) || { 
                  label: entry.mood, 
                  icon: Meh, 
                  color: 'text-gray-500',
                  bg: 'bg-gray-100' 
                }
                const IconComponent = moodOption.icon
                
                return (
                  <motion.div 
                    key={entry.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    {editing?.id === entry.id ? (
                      <div className="space-y-3">
                        <input 
                          className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white" 
                          value={editing.title} 
                          onChange={e => setEditing({ ...editing, title: e.target.value })} 
                        />
                        <select
                          className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white"
                          value={editing.mood || ''}
                          onChange={e => setEditing({ ...editing, mood: e.target.value })}
                        >
                          <option value="">Select mood</option>
                          {moodOptions.map(mood => (
                            <option key={mood.value} value={mood.value}>
                              {mood.label}
                            </option>
                          ))}
                        </select>
                        <textarea 
                          rows={4} 
                          className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white" 
                          value={editing.content} 
                          onChange={e => setEditing({ ...editing, content: e.target.value })} 
                        />
                        <div className="flex gap-3">
                          <button 
                            onClick={saveEdit} 
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <Save className="w-4 h-4"/>
                            💾 Save
                          </button>
                          <button 
                            onClick={() => setEditing(null)} 
                            className="border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl text-white font-semibold">{entry.title}</h3>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${moodOption.bg}`}>
                              <IconComponent className={`w-4 h-4 ${moodOption.color}`} />
                              <span className={`text-sm font-medium ${moodOption.color}`}>
                                {moodOption.label}
                              </span>
                            </div>
                          </div>
                          <div className="text-white/50 text-sm flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(entry.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="text-white/80 mb-4 whitespace-pre-wrap leading-relaxed">
                          {entry.content}
                        </div>

                        {/* AI Analysis Section */}
                        <div className="border-t border-white/10 pt-4">
                          <div className="flex flex-wrap gap-2 mb-3">
                            <button
                              onClick={() => analyzeEntry(entry)}
                              disabled={analysisLoading[entry.id]}
                              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                            >
                              <Brain className="w-4 h-4" />
                              {analysisLoading[entry.id] ? '🤖 Analyzing...' : '🧠 AI Summary'}
                            </button>
                            <button
                              onClick={() => setShowAnalysis(prev => ({ ...prev, [entry.id]: !prev[entry.id] }))}
                              className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              {showAnalysis[entry.id] ? '👁️ Hide' : '👀 Show'} Analysis
                            </button>
                          </div>

                          {showAnalysis[entry.id] && entryAnalysis[entry.id] && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="bg-black/20 border border-white/10 rounded-lg p-4 mb-3"
                            >
                              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                                🤖 AI Analysis:
                              </h4>
                              <p className="text-white/80 text-sm mb-2">{entryAnalysis[entry.id].summary}</p>
                              {entryAnalysis[entry.id].keyTopics.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  <span className="text-white/60 text-xs mr-2">🏷️ Topics:</span>
                                  {entryAnalysis[entry.id].keyTopics.map((topic, idx) => (
                                    <span key={idx} className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button 
                            onClick={() => setEditing(entry)} 
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                          >
                            <Pencil className="w-4 h-4"/>
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => copyEntry(entry)} 
                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                          >
                            <Copy className="w-4 h-4"/>
                            📋 Copy
                          </button>
                          <button 
                            onClick={() => remove(entry.id)} 
                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                          >
                            <Trash2 className="w-4 h-4"/>
                            🗑️ Delete
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )
              })}
              
              {filteredItems.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-2 text-center py-12"
                >
                  <Book className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60 text-lg mb-2">
                    {searchTerm || selectedMood ? '🔍 No entries match your filters' : '📝 Start writing your first diary entry!'}
                  </p>
                  <p className="text-white/40 text-sm">
                    {searchTerm || selectedMood ? 'Try adjusting your search or mood filter' : 'Express your thoughts, track your moods, and get AI insights! ✨'}
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </>
      )}

      {!userId && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Book className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/60 text-lg mb-2">📚 Welcome to Your Smart Diary</p>
          <p className="text-white/40 text-sm">
            Set a User ID or create a Quick Guest account to start writing! ✨
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default Diary
