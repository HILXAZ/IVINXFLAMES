import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Newspaper, 
  Search, 
  Filter, 
  Heart, 
  Share2, 
  Bookmark, 
  BookmarkCheck,
  ExternalLink,
  TrendingUp,
  Calendar,
  User,
  RefreshCw
} from 'lucide-react';
import { newsService } from '../services/newsService';
import GlassmorphismCard from '../components/GlassmorphismCard';

const Resources = () => {
  const [activeTab, setActiveTab] = useState('articles');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [articles, setArticles] = useState([]);
  const [news, setNews] = useState([]);
  const [trending, setTrending] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [syncResult, setSyncResult] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showArticleModal, setShowArticleModal] = useState(false);

  const categories = [
    { id: 'all', name: 'All Categories', icon: BookOpen },
    { id: 'addiction_news', name: 'Addiction News', icon: Newspaper },
    { id: 'recovery_tips', name: 'Recovery Tips', icon: Heart },
    { id: 'mental_health', name: 'Mental Health', icon: User },
    { id: 'success_stories', name: 'Success Stories', icon: TrendingUp },
    { id: 'research', name: 'Research', icon: BookOpen }
  ];

  useEffect(() => {
    loadContent();
    loadBookmarks();
  }, [activeTab, selectedCategory]);

  const loadContent = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'articles') {
        const articleData = await newsService.getRecoveryArticles(
          20, 0, selectedCategory === 'all' ? null : selectedCategory
        );
        setArticles(articleData);
      } else if (activeTab === 'news') {
        const newsData = await newsService.getLatestNews(
          20, 0, selectedCategory === 'all' ? null : selectedCategory
        );
        setNews(newsData);
      } else if (activeTab === 'trending') {
        const trendingData = await newsService.getTrendingNews(15, 7);
        setTrending(trendingData);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setError(`Failed to load ${activeTab}. Please try again or use the sync button for live news.`);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    try {
      const bookmarkData = await newsService.getUserBookmarks();
      setBookmarks(bookmarkData.map(b => b.article_url));
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      if (activeTab === 'articles') {
        const results = await newsService.searchRecoveryArticles(searchTerm);
        setArticles(results);
      } else if (activeTab === 'news') {
        const results = await newsService.searchNews(searchTerm);
        setNews(results);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncNews = async () => {
    setSyncing(true);
    setError('');
    setSyncResult(null);
    try {
      const result = await newsService.syncNews();
      console.log('News sync result:', result);
      setSyncResult(result);
      
      // Update the current view with synced data
      if (activeTab === 'news') {
        const newsData = await newsService.getLatestNews(
          20, 0, selectedCategory === 'all' ? null : selectedCategory
        );
        setNews(newsData);
      }
      
      // Show success message
      setTimeout(() => setSyncResult(null), 5000);
    } catch (error) {
      console.error('Error syncing news:', error);
      setError('Failed to sync news. Please check your internet connection and try again.');
    } finally {
      setSyncing(false);
    }
  };

  const toggleBookmark = async (url, title) => {
    try {
      if (bookmarks.includes(url)) {
        await newsService.removeBookmark(url);
        setBookmarks(prev => prev.filter(b => b !== url));
      } else {
        await newsService.bookmarkArticle(url, title);
        setBookmarks(prev => [...prev, url]);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const trackClick = async (url) => {
    await newsService.trackInteraction(url, 'click');
  };

  const handleReadMore = (article) => {
    // If it's a real URL, open it in a new tab
    if (article.url && article.url !== '#' && article.url.startsWith('http')) {
      trackClick(article.url);
      window.open(article.url, '_blank', 'noopener,noreferrer');
    } else {
      // If it's fallback content, show in modal
      setSelectedArticle(article);
      setShowArticleModal(true);
      trackClick(article.url || `#${article.id}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const ArticleCard = ({ article, isNews = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {(article.image_url || article.image) && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img
            src={article.image_url || article.image}
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
            {article.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General'}
          </span>
          <button
            onClick={() => toggleBookmark(article.url, article.title)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            {bookmarks.includes(article.url) ? (
              <BookmarkCheck className="h-5 w-5 text-red-500" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {article.description || article.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            {article.source_name && (
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {article.source_name}
              </span>
            )}
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(article.published_at || article.created_at)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleReadMore(article)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Read More
            <ExternalLink className="h-4 w-4 ml-2" />
          </button>
          
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: article.title,
                  url: article.url
                });
              }
            }}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          Recovery Resources
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
          Stay informed with the latest addiction recovery news, expert tips, and inspiring success stories
        </p>
      </motion.div>

      {/* Search and Controls */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search articles and news..."
              className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          
          {activeTab === 'news' && (
            <button
              onClick={syncNews}
              disabled={syncing}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Sync News
            </button>
          )}
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {/* Sync Result Display */}
        {syncResult && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <p className="text-sm">
              ✅ Successfully synced {syncResult.fetched} articles from NewsAPI! 
              {syncResult.saved > 0 && ` Saved ${syncResult.saved} to database.`}
              {syncResult.saved === 0 && ` (Database not configured - showing live data)`}
            </p>
          </div>
        )}
        
        {/* Database Setup Notice */}
        {activeTab === 'news' && !syncing && !syncResult && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
            <p className="text-sm">
              💡 <strong>Getting Started:</strong> Click "Sync News" to fetch the latest addiction recovery and mental health news using your API key (471c00ace2734636b5e52261e3ebf92d). 
              For full functionality, make sure to execute the database schema in your Supabase SQL editor.
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
        {[
          { id: 'articles', name: 'Recovery Articles', icon: BookOpen },
          { id: 'news', name: 'Latest News', icon: Newspaper },
          { id: 'trending', name: 'Trending', icon: TrendingUp }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{tab.name}</span>
            <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <category.icon className="h-4 w-4 mr-2" />
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Content Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {activeTab === 'articles' && articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {activeTab === 'news' && news.map((article) => (
            <ArticleCard key={article.id} article={article} isNews={true} />
          ))}
          {activeTab === 'trending' && trending.map((article) => (
            <ArticleCard key={article.id} article={article} isNews={true} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && (
        (activeTab === 'articles' && articles.length === 0) ||
        (activeTab === 'news' && news.length === 0) ||
        (activeTab === 'trending' && trending.length === 0)
      ) && (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No content found
          </h3>
          <p className="text-gray-600">
            {activeTab === 'news' 
              ? 'Try syncing news or check back later for the latest updates'
              : 'Try adjusting your search terms or category filter'
            }
          </p>
        </div>
      )}

      {/* Article Detail Modal */}
      {showArticleModal && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-2">
                    {selectedArticle.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General'}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedArticle.title}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    {selectedArticle.source_name && (
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {selectedArticle.source_name}
                      </span>
                    )}
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(selectedArticle.published_at || selectedArticle.created_at)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowArticleModal(false)}
                  className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {(selectedArticle.image_url || selectedArticle.image) && (
                <img
                  src={selectedArticle.image_url || selectedArticle.image}
                  alt={selectedArticle.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}

              {selectedArticle.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedArticle.description}
                  </p>
                </div>
              )}

              {selectedArticle.content && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Full Article</h3>
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    {selectedArticle.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Article Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleBookmark(selectedArticle.url || `#${selectedArticle.id}`, selectedArticle.title)}
                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    {bookmarks.includes(selectedArticle.url || `#${selectedArticle.id}`) ? (
                      <BookmarkCheck className="h-4 w-4 mr-2 text-red-500" />
                    ) : (
                      <Bookmark className="h-4 w-4 mr-2" />
                    )}
                    {bookmarks.includes(selectedArticle.url || `#${selectedArticle.id}`) ? 'Bookmarked' : 'Bookmark'}
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: selectedArticle.title,
                          text: selectedArticle.description,
                          url: selectedArticle.url && selectedArticle.url !== '#' ? selectedArticle.url : window.location.href
                        });
                      }
                    }}
                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </button>
                </div>

                {selectedArticle.url && selectedArticle.url !== '#' && selectedArticle.url.startsWith('http') && (
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    View Original
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Resources;
