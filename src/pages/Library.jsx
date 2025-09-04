import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { db } from '../lib/supabase'
import { 
  BookOpen, 
  Video, 
  FileText, 
  ExternalLink, 
  Search,
  Filter,
  Heart,
  Brain,
  Users,
  Zap
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const Library = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [news, setNews] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Predefined resources (you can later replace this with database content)
  const defaultResources = [
    {
      id: 1,
      title: "Understanding Addiction: The Science Behind It",
      description: "Learn about the neurological and psychological aspects of addiction and how it affects the brain.",
      category: "education",
      type: "article",
      url: "#",
      author: "Dr. Sarah Johnson",
      readTime: "8 min read",
      featured: true
    },
    {
      id: 2,
      title: "Mindfulness Meditation for Recovery",
      description: "A guided video series on using mindfulness techniques to support your recovery journey.",
      category: "mindfulness",
      type: "video",
      url: "#",
      author: "Mindful Recovery Institute",
      readTime: "15 min watch",
      featured: true
    },
    {
      id: 3,
      title: "Building a Strong Support Network",
      description: "Practical tips on how to identify, build, and maintain relationships that support your recovery.",
      category: "support",
      type: "article",
      url: "#",
      author: "Recovery Community",
      readTime: "6 min read",
      featured: false
    },
    {
      id: 4,
      title: "Cognitive Behavioral Therapy Techniques",
      description: "Learn CBT strategies that you can practice daily to change negative thought patterns.",
      category: "therapy",
      type: "article",
      url: "#",
      author: "Dr. Michael Chen",
      readTime: "10 min read",
      featured: false
    },
    {
      id: 5,
      title: "Nutrition and Recovery: Healing Your Body",
      description: "How proper nutrition can support your physical and mental health during recovery.",
      category: "health",
      type: "article",
      url: "#",
      author: "Nutritionist Lisa Park",
      readTime: "7 min read",
      featured: false
    },
    {
      id: 6,
      title: "Dealing with Triggers and Cravings",
      description: "Practical strategies for identifying, avoiding, and managing triggers in your daily life.",
      category: "coping",
      type: "video",
      url: "#",
      author: "Recovery Experts",
      readTime: "12 min watch",
      featured: true
    },
    {
      id: 7,
      title: "The Role of Exercise in Recovery",
      description: "How physical activity can boost mood, reduce stress, and support overall recovery.",
      category: "health",
      type: "article",
      url: "#",
      author: "Fitness for Recovery",
      readTime: "5 min read",
      featured: false
    },
    {
      id: 8,
      title: "Family and Addiction: Healing Together",
      description: "Resources for family members and how to rebuild relationships affected by addiction.",
      category: "support",
      type: "article",
      url: "#",
      author: "Family Recovery Center",
      readTime: "9 min read",
      featured: false
    }
  ]

  const defaultNews = [
    {
      id: 1,
      title: "New Study Shows Benefits of Mindfulness in Early Recovery",
      description: "A recent study published in the Journal of Addiction Medicine highlights the positive impact of daily mindfulness practice.",
      category: "news",
      type: "article",
      url: "#",
      source: "Journal of Addiction Medicine",
      published_at: "2025-08-26T12:00:00Z",
    },
    {
      id: 2,
      title: "Community-Based Recovery Programs Receive New Funding",
      description: "Government initiatives are providing more resources for local support groups and community centers.",
      category: "news",
      type: "article",
      url: "#",
      source: "National Health Institute",
      published_at: "2025-08-25T15:30:00Z",
    },
    {
      id: 3,
      title: "Telehealth Services for Addiction Support Expanding",
      description: "More options are becoming available for remote counseling and support, making help more accessible.",
      category: "news",
      type: "article",
      url: "#",
      source: "Digital Health Today",
      published_at: "2025-08-24T10:00:00Z",
    }
  ];

  const categories = [
    { value: 'all', label: 'All Resources', icon: BookOpen },
    { value: 'education', label: 'Education', icon: Brain },
    { value: 'mindfulness', label: 'Mindfulness', icon: Heart },
    { value: 'support', label: 'Support', icon: Users },
    { value: 'therapy', label: 'Therapy', icon: Zap },
    { value: 'health', label: 'Health', icon: Heart },
    { value: 'coping', label: 'Coping Skills', icon: Brain },
    { value: 'news', label: 'News', icon: FileText }
  ]

  useEffect(() => {
    loadResources()
    loadNews()
  }, [])

  const loadNews = async () => {
    setNewsLoading(true);
    try {
      // In a real app, you would fetch from a news API
      // For now, we use dummy data
      setNews(defaultNews);
    } catch (error) {
      console.error('Error loading news:', error)
    } finally {
      setNewsLoading(false);
    }
  }

  const loadResources = async () => {
    try {
      // Try to load from database first
      const dbResources = await db.getResources()
      if (dbResources && dbResources.length > 0) {
        setResources(dbResources)
      } else {
        // Use default resources if database is empty
        setResources(defaultResources)
      }
    } catch (error) {
      console.error('Error loading resources:', error)
      // Fallback to default resources
      setResources(defaultResources)
    } finally {
      setLoading(false)
    }
  }

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredResources = filteredResources.filter(resource => resource.featured)
  const regularResources = filteredResources.filter(resource => !resource.featured)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resource Library</h1>
        <p className="text-gray-600">
          Discover articles, videos, and tools to support your recovery journey
        </p>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input min-w-[150px]"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Category Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2 mb-8"
      >
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{category.label}</span>
            </button>
          )
        })}
      </motion.div>

      {/* Featured Resources */}
      {featuredResources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Resources</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="card hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {resource.type === 'video' ? (
                      <Video className="h-5 w-5 text-primary-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-primary-600" />
                    )}
                    <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                      {resource.type}
                    </span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{resource.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>By {resource.author}</span>
                  <span>{resource.readTime}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* News Updates Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">News & Updates</h2>
        {newsLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      News
                    </span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">{article.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{article.source}</span>
                  <span>{new Date(article.published_at).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* All Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Resources</h2>
        
        {regularResources.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-500">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Resources are being added regularly. Check back soon!'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {resource.type === 'video' ? (
                      <Video className="h-4 w-4 text-gray-600" />
                    ) : (
                      <FileText className="h-4 w-4 text-gray-600" />
                    )}
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      {resource.type}
                    </span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-4 text-sm line-clamp-3">{resource.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>By {resource.author}</span>
                  <span>{resource.readTime}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-12 card bg-gray-50 text-center"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Need More Support?</h3>
        <p className="text-gray-600 mb-6">
          Connect with our community or get immediate help when you need it most.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/community" className="btn-primary">
            Join Community
          </a>
          <a href="/emergency" className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Emergency Support
          </a>
        </div>
      </motion.div>
    </div>
  )
}

export default Library
