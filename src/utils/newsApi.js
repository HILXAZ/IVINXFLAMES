// News API utility functions
const NEWS_API_KEY = '471c00ace2734636b5e52261e3ebf92d';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// News API endpoints
export const newsApiEndpoints = {
  everything: `${NEWS_API_BASE_URL}/everything`,
  topHeadlines: `${NEWS_API_BASE_URL}/top-headlines`,
  sources: `${NEWS_API_BASE_URL}/sources`
};

// Default search keywords for addiction/recovery content
export const defaultKeywords = [
  'addiction recovery',
  'mental health',
  'substance abuse treatment',
  'sobriety',
  'rehabilitation',
  'wellness',
  'therapy',
  'support groups',
  'recovery stories',
  'addiction research'
];

// Categories for news classification
export const newsCategories = {
  ADDICTION_NEWS: 'addiction_news',
  RECOVERY_TIPS: 'recovery_tips',
  MENTAL_HEALTH: 'mental_health',
  SUCCESS_STORIES: 'success_stories',
  RESEARCH: 'research',
  GENERAL: 'general'
};

// Fetch news articles from NewsAPI
export const fetchNewsFromAPI = async (options = {}) => {
  const {
    query = 'addiction recovery OR mental health',
    pageSize = 20,
    page = 1,
    sortBy = 'publishedAt',
    language = 'en',
    domains = null,
    from = null,
    to = null
  } = options;

  try {
    const params = new URLSearchParams({
      q: query,
      apiKey: NEWS_API_KEY,
      pageSize: pageSize.toString(),
      page: page.toString(),
      sortBy,
      language
    });

    if (domains) params.append('domains', domains);
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const response = await fetch(`${newsApiEndpoints.everything}?${params}`);
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(`NewsAPI error: ${data.message || 'Unknown error'}`);
    }

    return {
      articles: data.articles || [],
      totalResults: data.totalResults || 0,
      status: data.status
    };
  } catch (error) {
    console.error('Error fetching news from API:', error);
    throw error;
  }
};

// Fetch top headlines
export const fetchTopHeadlines = async (options = {}) => {
  const {
    category = 'health',
    country = 'us',
    pageSize = 20,
    page = 1
  } = options;

  try {
    const params = new URLSearchParams({
      apiKey: NEWS_API_KEY,
      category,
      country,
      pageSize: pageSize.toString(),
      page: page.toString()
    });

    const response = await fetch(`${newsApiEndpoints.topHeadlines}?${params}`);
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(`NewsAPI error: ${data.message || 'Unknown error'}`);
    }

    return {
      articles: data.articles || [],
      totalResults: data.totalResults || 0,
      status: data.status
    };
  } catch (error) {
    console.error('Error fetching top headlines:', error);
    throw error;
  }
};

// Categorize article based on content
export const categorizeArticle = (title, description = '') => {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('addiction') || text.includes('substance abuse') || text.includes('drug') || text.includes('alcohol')) {
    return newsCategories.ADDICTION_NEWS;
  }
  
  if (text.includes('recovery') || text.includes('rehabilitation') || text.includes('treatment') || text.includes('sobriety')) {
    return newsCategories.RECOVERY_TIPS;
  }
  
  if (text.includes('mental health') || text.includes('depression') || text.includes('anxiety') || text.includes('therapy')) {
    return newsCategories.MENTAL_HEALTH;
  }
  
  if (text.includes('success') || text.includes('achievement') || text.includes('inspiration') || text.includes('overcome')) {
    return newsCategories.SUCCESS_STORIES;
  }
  
  if (text.includes('research') || text.includes('study') || text.includes('findings') || text.includes('scientists')) {
    return newsCategories.RESEARCH;
  }
  
  return newsCategories.GENERAL;
};

// Clean and validate article data
export const cleanArticleData = (article) => {
  // Filter out articles with missing essential data
  if (!article.title || !article.url) {
    return null;
  }

  // Remove articles from excluded sources (often promotional or low-quality)
  const excludedSources = ['[removed]', 'google news', 'yahoo'];
  if (excludedSources.some(source => 
    article.source?.name?.toLowerCase().includes(source) ||
    article.title.toLowerCase().includes('[removed]')
  )) {
    return null;
  }

  return {
    title: article.title.trim(),
    description: article.description?.trim() || '',
    content: article.content?.trim() || '',
    url: article.url,
    image_url: article.urlToImage || '',
    source_name: article.source?.name || 'Unknown Source',
    published_at: article.publishedAt,
    category: categorizeArticle(article.title, article.description),
    author: article.author || null
  };
};

// Batch fetch news with multiple keywords
export const batchFetchNews = async (keywords = defaultKeywords, articlesPerKeyword = 10) => {
  const allArticles = [];
  const errors = [];

  for (const keyword of keywords) {
    try {
      const result = await fetchNewsFromAPI({
        query: keyword,
        pageSize: articlesPerKeyword,
        sortBy: 'publishedAt'
      });
      
      const cleanedArticles = result.articles
        .map(cleanArticleData)
        .filter(article => article !== null);
      
      allArticles.push(...cleanedArticles);
    } catch (error) {
      errors.push({ keyword, error: error.message });
    }

    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Remove duplicates based on URL
  const uniqueArticles = allArticles.filter((article, index, self) =>
    index === self.findIndex(a => a.url === article.url)
  );

  return {
    articles: uniqueArticles,
    totalFetched: allArticles.length,
    uniqueCount: uniqueArticles.length,
    errors
  };
};

// Get trending search terms for addiction/recovery
export const getTrendingSearchTerms = () => {
  return [
    'addiction recovery 2024',
    'mental health awareness',
    'substance abuse treatment',
    'recovery success stories',
    'addiction research breakthrough',
    'rehabilitation programs',
    'sobriety support',
    'therapy innovations',
    'wellness recovery',
    'addiction prevention'
  ];
};

// Format date for API queries
export const formatDateForAPI = (date) => {
  return date.toISOString().split('T')[0];
};

// Get date range for recent news (last N days)
export const getRecentDateRange = (days = 7) => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  
  return {
    from: formatDateForAPI(from),
    to: formatDateForAPI(to)
  };
};

export default {
  fetchNewsFromAPI,
  fetchTopHeadlines,
  categorizeArticle,
  cleanArticleData,
  batchFetchNews,
  getTrendingSearchTerms,
  getRecentDateRange,
  newsCategories,
  defaultKeywords
};
