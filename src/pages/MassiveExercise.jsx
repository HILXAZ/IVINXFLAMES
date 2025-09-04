import React, { useState, useEffect, useMemo } from 'react'
import { 
  Play, Search, Filter, Grid, List, ChevronLeft, ChevronRight,
  Clock, Users, Zap, Heart, Brain, Dumbbell, Star, Eye,
  RefreshCw, Settings, BookOpen, Target, TrendingUp
} from 'lucide-react'
import { massiveExerciseVideoService } from '../services/massiveExerciseVideos'
import { getYouTubeThumbnail, formatDuration, getDifficultyColor, getCategoryColor } from '../utils/youtube'

const MassiveExercise = () => {
  // State management
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  
  // Filter states
  const [filters, setFilters] = useState({
    category: 'all',
    subcategory: '',
    difficulty: '',
    intensity: '',
    duration: '',
    instructor: '',
    searchTerm: '',
    sortBy: 'featured'
  })

  // UI states
  const [showFilters, setShowFilters] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [categories, setCategories] = useState({})
  const [instructors, setInstructors] = useState([])
  const [stats, setStats] = useState([])

  // Constants
  const VIDEOS_PER_PAGE = 24
  
  const categoryConfig = {
    'stress_relief': { 
      name: 'Stress Relief', 
      icon: Heart, 
      color: 'blue',
      description: 'Calming exercises to reduce anxiety and tension'
    },
    'energy_boost': { 
      name: 'Energy Boost', 
      icon: Zap, 
      color: 'orange',
      description: 'Energizing workouts to lift mood and motivation'
    },
    'mindful_movement': { 
      name: 'Mindful Movement', 
      icon: Brain, 
      color: 'purple',
      description: 'Meditative practices for mental clarity'
    },
    'strength': { 
      name: 'Strength Building', 
      icon: Dumbbell, 
      color: 'red',
      description: 'Build physical and mental resilience'
    }
  }

  const intensityLevels = ['low', 'moderate', 'high']
  const difficultyLevels = ['beginner', 'intermediate', 'advanced']
  const durationOptions = [
    { value: 'short', label: '5-10 minutes' },
    { value: 'medium', label: '15-25 minutes' },
    { value: 'long', label: '30+ minutes' }
  ]

  // Load initial data
  useEffect(() => {
    loadVideos()
    loadCategories()
    loadInstructors()
    loadStats()
  }, [])

  // Reload videos when filters change
  useEffect(() => {
    setCurrentPage(1)
    loadVideos()
  }, [filters])

  // Load videos when page changes
  useEffect(() => {
    loadVideos()
  }, [currentPage])

  const loadVideos = async () => {
    setLoading(true)
    try {
      const result = await massiveExerciseVideoService.getVideosAdvanced({
        ...filters,
        page: currentPage,
        limit: VIDEOS_PER_PAGE
      })
      
      if (result.error) {
        console.error('Error loading videos:', result.error)
        // Use fallback videos if needed
      } else {
        setVideos(result.videos)
        setTotalPages(result.totalPages)
        setTotalCount(result.totalCount)
      }
    } catch (error) {
      console.error('Failed to load videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    const result = await massiveExerciseVideoService.getCategories()
    if (!result.error) {
      setCategories(result.categories)
    }
  }

  const loadInstructors = async () => {
    const result = await massiveExerciseVideoService.getInstructors()
    if (!result.error) {
      setInstructors(result.instructors)
    }
  }

  const loadStats = async () => {
    const result = await massiveExerciseVideoService.getVideoStats()
    if (!result.error) {
      setStats(result.stats)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset subcategory when category changes
      ...(key === 'category' ? { subcategory: '' } : {})
    }))
  }

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }))
  }

  const clearFilters = () => {
    setFilters({
      category: 'all',
      subcategory: '',
      difficulty: '',
      intensity: '',
      duration: '',
      instructor: '',
      searchTerm: '',
      sortBy: 'featured'
    })
  }

  const playVideo = (video) => {
    setSelectedVideo(video)
    setShowVideoPlayer(true)
    // Increment view count
    massiveExerciseVideoService.batchIncrementViews([video.id])
  }

  const closeVideoPlayer = () => {
    setShowVideoPlayer(false)
    setSelectedVideo(null)
  }

  // Get subcategories for current category
  const currentSubcategories = useMemo(() => {
    return categories[filters.category] || []
  }, [categories, filters.category])

  const VideoCard = ({ video, compact = false }) => (
    <div className={`group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${compact ? 'h-64' : 'h-80'}`}>
      <div className="relative aspect-video overflow-hidden">
        <img
          src={getYouTubeThumbnail(video.youtube_id, 'hqdefault')}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            // Try a safer fallback thumbnail when maxres/hq not available
            const target = e.currentTarget;
            if (!target.__fallbackTried) {
              target.__fallbackTried = true;
              target.src = getYouTubeThumbnail(video.youtube_id, 'mqdefault');
            }
          }}
        />
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => playVideo(video)}
            className="bg-white/90 hover:bg-white text-black rounded-full p-3 transform scale-75 group-hover:scale-100 transition-all duration-300"
          >
            <Play className="w-6 h-6" fill="currentColor" />
          </button>
        </div>

        {/* Duration and intensity badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          <span className="bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
            {video.duration}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            video.intensity_level === 'low' ? 'bg-green-600 text-white' :
            video.intensity_level === 'moderate' ? 'bg-yellow-600 text-white' :
            'bg-red-600 text-white'
          }`}>
            {video.intensity_level}
          </span>
        </div>

        {/* Featured badge */}
        {video.is_featured && (
          <div className="absolute top-2 left-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
          </div>
        )}

        {/* View count */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {video.view_count || 0}
        </div>
      </div>

      <div className={`p-${compact ? '3' : '4'}`}>
        <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 ${compact ? 'text-sm' : 'text-base'}`}>
          {video.title}
        </h3>
        
        {!compact && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {video.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(video.category)}`}>
            {categoryConfig[video.category]?.name || video.category}
          </span>
          {video.subcategory && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              {video.subcategory}
            </span>
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(video.difficulty)}`}>
            {video.difficulty}
          </span>
        </div>

        {video.instructor && (
          <p className="text-xs text-gray-500 mb-2">by {video.instructor}</p>
        )}

        {/* Recovery benefits */}
        {video.recovery_benefits && video.recovery_benefits.length > 0 && !compact && (
          <div className="flex flex-wrap gap-1">
            {video.recovery_benefits.slice(0, 2).map((benefit, index) => (
              <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                {benefit.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Exercise Video Library
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Discover over 1,000 curated exercise videos specifically designed for addiction recovery and mental health support.
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{totalCount} videos</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{instructors.length} instructors</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>Recovery focused</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos, instructors, or benefits..."
              value={filters.searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters {showFilters ? '▲' : '▼'}
            </button>
            
            <div className="flex items-center gap-4">
              {/* View mode toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort dropdown */}
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="featured">Featured First</option>
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.name}</option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              {currentSubcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={filters.subcategory}
                    onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All Types</option>
                    {currentSubcategories.map(sub => (
                      <option key={sub} value={sub}>{sub.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Levels</option>
                  {difficultyLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Intensity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Intensity</label>
                <select
                  value={filters.intensity}
                  onChange={(e) => handleFilterChange('intensity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Intensities</option>
                  {intensityLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <select
                  value={filters.duration}
                  onChange={(e) => handleFilterChange('duration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Durations</option>
                  {durationOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Instructor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
                <select
                  value={filters.instructor}
                  onChange={(e) => handleFilterChange('instructor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Instructors</option>
                  {instructors.slice(0, 20).map(instructor => (
                    <option key={instructor} value={instructor}>{instructor}</option>
                  ))}
                </select>
              </div>

              {/* Clear filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading videos...</span>
          </div>
        )}

        {/* Video grid/list */}
        {!loading && (
          <>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'
              : 'space-y-4 mb-8'
            }>
              {videos.map((video) => (
                <VideoCard 
                  key={video.id} 
                  video={video} 
                  compact={viewMode === 'list'} 
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, currentPage - 2) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* No results */}
        {!loading && videos.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search terms to find more videos.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Video Player Modal */}
        {showVideoPlayer && selectedVideo && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex-1 pr-4">
                  {selectedVideo.title}
                </h3>
                <button
                  onClick={closeVideoPlayer}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                >
                  Close
                </button>
              </div>
              <div className="aspect-video">
                {selectedVideo.youtube_id ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                    title={selectedVideo.title}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg text-gray-600">
                    Video unavailable. Please open on YouTube instead.
                  </div>
                )}
              </div>
              <div className="mt-3">
                <a
                  href={`https://youtu.be/${selectedVideo.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-blue-600 hover:underline"
                >
                  Open on YouTube (fallback)
                </a>
              </div>
              {selectedVideo.description && (
                <p className="mt-4 text-gray-600 text-sm">
                  {selectedVideo.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MassiveExercise
