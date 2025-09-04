import { useState, useEffect } from 'react'
import { db } from '../lib/supabase'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Search, 
  Filter, 
  ExternalLink, 
  Clock, 
  Star,
  Video,
  FileText,
  Tool,
  Book,
  Users,
  Brain,
  Heart,
  Shield
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const Library = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')

  const categories = [
    { id: 'all', name: 'All Categories', icon: BookOpen },
    { id: 'education', name: 'Education & Science', icon: Brain },
    { id: 'mindfulness', name: 'Mindfulness & Meditation', icon: Heart },
    { id: 'support', name: 'Support Systems', icon: Users },
    { id: 'therapy', name: 'Therapy & Treatment', icon: Shield },
    { id: 'health', name: 'Health & Wellness', icon: Heart },
    { id: 'coping', name: 'Coping Strategies', icon: Tool }
  ]

  const types = [
    { id: 'all', name: 'All Types', icon: BookOpen },
    { id: 'article', name: 'Articles', icon: FileText },
    { id: 'video', name: 'Videos', icon: Video },
    { id: 'tool', name: 'Tools', icon: Tool },
    { id: 'book', name: 'Books', icon: Book }
  ]

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    try {
      const resourcesData = await db.getResources()
      setResources(resourcesData || [])
    } catch (error) {
      console.error('Error loading resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    const matchesType = selectedType === 'all' || resource.type === selectedType
    
    return matchesSearch && matchesCategory && matchesType
  })

  const featuredResources = resources.filter(resource => resource.featured)

  const getTypeIcon = (type) => {
    const typeMap = {
      'article': FileText,
      'video': Video,
      'tool': Tool,
      'book': Book
    }
    return typeMap[type] || FileText
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resource Library</h1>
        <p className="text-gray-600">
          Discover articles, videos, tools, and guides to support your recovery journey.
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resources..."
              className="pl-10 input"
            />
          </div>

          {/* Category Filter */}
          <div className="lg:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="lg:w-32">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input"
            >
              {types.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
        </div>
      </motion.div>

      {/* Featured Resources */}
      {featuredResources.length > 0 && selectedCategory === 'all' && !searchTerm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Star className="h-6 w-6 text-yellow-500 mr-2" />
            Featured Resources
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources.slice(0, 3).map((resource, index) => {
              const TypeIcon = getTypeIcon(resource.type)
              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="card bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-primary-100 rounded">
                        <TypeIcon className="h-4 w-4 text-primary-600" />
                      </div>
                      <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
                        {resource.type}
                      </span>
                    </div>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {resource.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {resource.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    {resource.author && (
                      <span>By {resource.author}</span>
                    )}
                    {resource.read_time && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{resource.read_time}</span>
                      </div>
                    )}
                  </div>
                  
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <span>Read More</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* All Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {searchTerm || selectedCategory !== 'all' || selectedType !== 'all' 
            ? 'Search Results' 
            : 'All Resources'
          }
        </h2>
        
        {filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => {
              const TypeIcon = getTypeIcon(resource.type)
              const CategoryIcon = categories.find(cat => cat.id === resource.category)?.icon || BookOpen
              
              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-gray-100 rounded">
                        <TypeIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {resource.type}
                      </span>
                    </div>
                    <div className="p-1 bg-primary-100 rounded">
                      <CategoryIcon className="h-4 w-4 text-primary-600" />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {resource.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {resource.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    {resource.author && (
                      <span className="truncate">By {resource.author}</span>
                    )}
                    {resource.read_time && (
                      <div className="flex items-center flex-shrink-0 ml-2">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{resource.read_time}</span>
                      </div>
                    )}
                  </div>
                  
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <span>Access Resource</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 card bg-gradient-to-r from-green-50 to-blue-50 border-green-200"
      >
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Need More Help?</h3>
          <p className="text-gray-600 mb-6">
            If you can't find what you're looking for, our community and emergency support are here for you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/community"
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Ask Community</span>
            </a>
            <a
              href="/emergency"
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>Emergency Support</span>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Library
