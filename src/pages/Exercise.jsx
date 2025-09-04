import React, { useState, useEffect } from 'react'
import { Play, Pause, RefreshCw, Target, Clock, Dumbbell, AlertCircle, Heart, Eye, PlayCircle, ExternalLink } from 'lucide-react'
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '../utils/youtube'
import { FALLBACK_EXERCISE_VIDEOS as SHARED_FALLBACK_VIDEOS } from '../services/exerciseVideos'
import GlassmorphismCard from '../components/GlassmorphismCard'

const STORAGE_KEY = 'exercise_preferences'

const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
}

const getDifficultyColor = (level) => {
  const colors = {
    beginner: 'bg-green-100 text-green-800 border-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    advanced: 'bg-red-100 text-red-800 border-red-200'
  }
  return colors[level] || colors.beginner
}

const getCategoryColor = (category) => {
  const colors = {
    'stress-relief': 'bg-blue-100 text-blue-800 border-blue-200',
    'quick-energy': 'bg-orange-100 text-orange-800 border-orange-200',
    'mindful-movement': 'bg-purple-100 text-purple-800 border-purple-200',
    'strength': 'bg-red-100 text-red-800 border-red-200',
    'cardio': 'bg-pink-100 text-pink-800 border-pink-200'
  }
  return colors[category] || colors['stress-relief']
}

const Exercise = () => {
  const [currentVideo, setCurrentVideo] = useState(null)
  const [featuredVideos, setFeaturedVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('stress-relief')
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [videoPlayerUrl, setVideoPlayerUrl] = useState('')
  const [usingFallback, setUsingFallback] = useState(false)

  // Exercise categories updated for video content
  const categories = {
    'stress-relief': { 
      title: 'Stress Relief',
      description: 'Calming exercises to reduce tension and anxiety',
      icon: Heart,
      color: 'blue'
    },
    'quick-energy': { 
      title: 'Energy Boost',
      description: 'Quick workouts to boost mood and energy',
      icon: Target,
      color: 'orange'
    },
    'mindful-movement': { 
      title: 'Mindful Movement',
      description: 'Focused exercises for mental clarity and peace',
      icon: Play,
      color: 'purple'
    },
    'strength': {
      title: 'Strength Building',
      description: 'Build physical and mental resilience',
      icon: Dumbbell,
      color: 'red'
    }
  }

  // Fetch featured videos for the sidebar
  const loadFeaturedVideos = async () => {
    try {
      // Use shared fallback videos and prioritize current category
      const pool = SHARED_FALLBACK_VIDEOS
      const byCategory = pool.filter(v => v.category === category)
      const list = (byCategory.length > 0 ? byCategory : pool).slice(0, 8)
      setFeaturedVideos(list)
      setUsingFallback(true)
    } catch (err) {
      console.error('Error loading featured videos:', err)
      setFeaturedVideos(SHARED_FALLBACK_VIDEOS.slice(0, 8))
      setUsingFallback(true)
    }
  }

  // Fetch a random exercise video based on category
  const fetchRandomVideo = async () => {
    setLoading(true)
    setError('')
    
    try {
  // Use shared fallback videos
  const categoryVideos = SHARED_FALLBACK_VIDEOS.filter(v => v.category === category)
  const fallbackPool = categoryVideos.length > 0 ? categoryVideos : SHARED_FALLBACK_VIDEOS
      const randomVideo = fallbackPool[Math.floor(Math.random() * fallbackPool.length)]
      
      setCurrentVideo(randomVideo)
      setUsingFallback(true)
    } catch (err) {
      console.error('Error fetching random video:', err)
      
  // Fallback to built-in videos
  const categoryVideos = SHARED_FALLBACK_VIDEOS.filter(v => v.category === category)
  const fallbackPool = categoryVideos.length > 0 ? categoryVideos : SHARED_FALLBACK_VIDEOS
      const randomVideo = fallbackPool[Math.floor(Math.random() * fallbackPool.length)]
      
      setCurrentVideo(randomVideo)
      setUsingFallback(true)
      setError('Using built-in videos. Database connection failed.')
    } finally {
      setLoading(false)
    }
  }

  // Play video in embedded player
  const playVideo = (video) => {
    setVideoPlayerUrl(getYouTubeEmbedUrl(video.youtube_id, true, true))
    setShowVideoPlayer(true)
  }

  // Close video player
  const closeVideoPlayer = () => {
    setShowVideoPlayer(false)
    setVideoPlayerUrl('')
  }

  useEffect(() => {
    loadFeaturedVideos()
    fetchRandomVideo()
  }, [category])

  const stressReliefTips = [
    "Exercise releases endorphins, your body's natural mood boosters",
    "Physical activity helps reduce cortisol (stress hormone) levels",
    "Movement can be a healthy distraction from cravings",
    "Regular exercise improves sleep quality and mental clarity",
    "Even 5-10 minutes of movement can shift your mindset",
    "Exercise builds self-confidence and a sense of accomplishment"
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exercise Videos for Recovery</h1>
          <p className="text-gray-600">Use guided movement as a healthy coping mechanism</p>
        </div>

        {/* Category Selection */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {Object.entries(categories).map(([key, cat]) => {
              const IconComponent = cat.icon
              return (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    category === key
                      ? `bg-${cat.color}-600 text-white shadow-lg scale-105`
                      : 'bg-white text-gray-700 border-2 hover:bg-gray-50 hover:border-blue-300'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  {cat.title}
                </button>
              )
            })}
          </div>
          <p className="text-center text-sm text-gray-500 mt-3">
            {categories[category].description}
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">{error}</div>
          </div>
        )}

        {usingFallback && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              Currently showing curated exercise videos. For extended library, ensure database connection is active.
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Video Section */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading your perfect exercise video...</p>
              </div>
            ) : currentVideo ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Video Thumbnail/Player */}
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={currentVideo.thumbnail_url || getYouTubeThumbnail(currentVideo.youtube_id)}
                    alt={currentVideo.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Play Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <button
                      onClick={() => playVideo(currentVideo)}
                      className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
                    >
                      <PlayCircle className="h-6 w-6" />
            Play Video
                    </button>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                    {formatDuration(currentVideo.duration_minutes)}
                  </div>

                  {/* View Count */}
                  <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {currentVideo.view_count || 0}
                  </div>
                </div>

                {/* Video Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentVideo.title}</h2>
                      <p className="text-gray-600 leading-relaxed">{currentVideo.description}</p>
                    </div>
                    
                    <button
                      onClick={fetchRandomVideo}
                      disabled={loading}
                      className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      New Video
                    </button>
                  </div>

                  {/* Video Metadata */}
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">
                        <span className="font-medium">Duration:</span> {formatDuration(currentVideo.duration_minutes)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(currentVideo.difficulty_level)}`}>
                        {currentVideo.difficulty_level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(currentVideo.category)}`}>
                        {categories[currentVideo.category]?.title || currentVideo.category}
                      </span>
                    </div>
                  </div>

                  {/* Target Muscle Groups */}
                  {currentVideo.target_muscle_groups && currentVideo.target_muscle_groups.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        Target Areas:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {currentVideo.target_muscle_groups.map((muscle, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm capitalize">
                            {muscle}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Equipment Needed */}
                  {currentVideo.equipment_needed && currentVideo.equipment_needed.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Dumbbell className="h-4 w-4 text-green-600" />
                        Equipment Needed:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {currentVideo.equipment_needed.map((equipment, index) => (
                          <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm capitalize">
                            {equipment === 'none' ? 'No equipment needed' : equipment}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recovery Benefits */}
                  {currentVideo.recovery_benefits && currentVideo.recovery_benefits.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <Heart className="h-4 w-4 text-green-600" />
                        Recovery Benefits:
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                        {currentVideo.recovery_benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            <div className="mt-4 text-sm text-gray-600">
              Want more? Visit the full library with 1000+ curated videos.
              <a href="/videos" className="ml-2 text-blue-600 hover:text-blue-700 underline">Open Video Library</a>
            </div>
          </div>

          {/* Sidebar - Featured Videos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-blue-600" />
                More Exercise Videos
              </h3>
              
              <div className="space-y-4">
                {featuredVideos.map((video) => (
                  <div key={video.id} className="group cursor-pointer" onClick={() => setCurrentVideo(video)}>
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2">
                      <img
                        src={video.thumbnail_url || getYouTubeThumbnail(video.youtube_id)}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
                        <PlayCircle className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-1 py-0.5 rounded text-xs">
                        {formatDuration(video.duration_minutes)}
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(video.category)}`}>
                        {categories[video.category]?.title || video.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(video.difficulty_level)}`}>
                        {video.difficulty_level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct YouTube Links */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  {currentVideo && (
                    <a
                      href={currentVideo.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open in YouTube
                    </a>
                  )}
                  <button
                    onClick={fetchRandomVideo}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Get Random Video
                  </button>
                </div>
              </div>
            </div>

            {/* Recovery Tips */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Recovery Tips</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p>• Exercise releases natural mood-boosting endorphins</p>
                <p>• Physical activity helps reduce stress and anxiety</p>
                <p>• Regular movement improves sleep quality</p>
                <p>• Building strength builds mental resilience</p>
                <p>• Even 5-10 minutes can shift your mindset</p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Player Modal */}
        {showVideoPlayer && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentVideo?.title}
                </h3>
                <button
                  onClick={closeVideoPlayer}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="aspect-video">
                <iframe
                  src={videoPlayerUrl}
                  title={currentVideo?.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4 text-sm text-gray-600 flex items-center gap-2">
                <span>If the player doesn’t load,&nbsp;</span>
                <a
                  href={currentVideo?.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  open on YouTube <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Exercise
