import { supabase } from '../lib/supabase';

class NewsService {
  constructor() {
    this.apiKey = '471c00ace2734636b5e52261e3ebf92d';
    this.baseUrl = 'https://newsapi.org/v2';
    this.categories = ['addiction', 'mental-health', 'wellness', 'recovery'];
  }

  // Fetch news configuration from database
  async getNewsConfig() {
    try {
      const { data, error } = await supabase.rpc('fetch_news_config');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching news config:', error);
      return {
        api_key: this.apiKey,
        keywords: ['addiction recovery', 'mental health', 'wellness', 'sobriety'],
        endpoint: `${this.baseUrl}/everything`
      };
    }
  }

  // Fetch news from NewsAPI
  async fetchNewsFromAPI(keywords = ['addiction recovery', 'mental health'], pageSize = 20) {
    try {
      const query = keywords.join(' OR ');
      const url = `${this.baseUrl}/everything?q=${encodeURIComponent(query)}&apiKey=${this.apiKey}&pageSize=${pageSize}&sortBy=publishedAt&language=en`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.articles || [];
    } catch (error) {
      console.error('Error fetching news from API:', error);
      return [];
    }
  }

  // Save news articles to database
  async saveNewsArticles(articles) {
    const savedArticles = [];
    
    for (const article of articles) {
      try {
        // Skip articles with missing required fields
        if (!article.title || !article.url) continue;
        
        const { data, error } = await supabase.rpc('save_news_article', {
          p_title: article.title,
          p_description: article.description || '',
          p_content: article.content || '',
          p_url: article.url,
          p_image_url: article.urlToImage || '',
          p_source_name: article.source?.name || 'Unknown',
          p_published_at: article.publishedAt,
          p_category: this.categorizeArticle(article.title + ' ' + article.description)
        });
        
        if (!error) {
          savedArticles.push(data);
        }
      } catch (error) {
        console.error('Error saving article:', error);
      }
    }
    
    return savedArticles;
  }

  // Categorize articles based on content
  categorizeArticle(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('addiction') || lowerText.includes('substance abuse')) {
      return 'addiction_news';
    } else if (lowerText.includes('recovery') || lowerText.includes('rehabilitation')) {
      return 'recovery_tips';
    } else if (lowerText.includes('mental health') || lowerText.includes('depression') || lowerText.includes('anxiety')) {
      return 'mental_health';
    } else if (lowerText.includes('success') || lowerText.includes('achievement')) {
      return 'success_stories';
    } else if (lowerText.includes('research') || lowerText.includes('study')) {
      return 'research';
    }
    
    return 'general';
  }

  // Fetch and sync news articles
  async syncNews() {
    try {
      console.log('Starting news sync...');
      
      // Try to get configuration from database, fallback to defaults
      let config;
      try {
        config = await this.getNewsConfig();
      } catch (error) {
        console.warn('Using default config due to database error:', error);
        config = {
          api_key: this.apiKey,
          keywords: ['addiction recovery', 'mental health', 'wellness', 'sobriety'],
          endpoint: `${this.baseUrl}/everything`
        };
      }
      
      const keywords = config.keywords || ['addiction recovery', 'mental health'];
      
      // Fetch from API
      const articles = await this.fetchNewsFromAPI(keywords, 50);
      console.log(`Fetched ${articles.length} articles from NewsAPI`);
      
      // Try to save to database, but don't fail if database isn't available
      let savedArticles = [];
      try {
        savedArticles = await this.saveNewsArticles(articles);
        console.log(`Saved ${savedArticles.length} articles to database`);
      } catch (error) {
        console.warn('Could not save to database, returning fetched articles:', error);
        // Transform articles to expected format
        savedArticles = articles.map((article, index) => ({
          id: `sync_${index}`,
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          image_url: article.urlToImage,
          source_name: article.source?.name || 'News Source',
          published_at: article.publishedAt,
          category: this.categorizeArticle(article.title + ' ' + article.description),
          created_at: article.publishedAt
        })).filter(article => article.title && article.url);
      }
      
      return {
        fetched: articles.length,
        saved: savedArticles.length,
        articles: savedArticles
      };
    } catch (error) {
      console.error('Error syncing news:', error);
      throw error;
    }
  }

  // Get latest news from database
  async getLatestNews(limit = 20, offset = 0, category = null) {
    try {
      const { data, error } = await supabase.rpc('get_latest_news', {
        p_limit: limit,
        p_offset: offset,
        p_category: category
      });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching latest news:', error);
      return [];
    }
  }

  // Search news articles
  async searchNews(searchTerm, limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase.rpc('search_news_articles', {
        p_search_term: searchTerm,
        p_limit: limit,
        p_offset: offset
      });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  }

  // Get trending news
  async getTrendingNews(limit = 10, days = 7) {
    try {
      const { data, error } = await supabase.rpc('get_trending_news', {
        p_limit: limit,
        p_days: days
      });
      
      if (error) {
        console.warn('Database function not available, using fallback trending:', error);
        return this.getFallbackTrending(limit);
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching trending news, using fallback:', error);
      return this.getFallbackTrending(limit);
    }
  }

  // Fallback trending news
  getFallbackTrending(limit = 10) {
    const trendingNews = [
      {
        id: 'trending_1',
        title: 'Breakthrough Study: New Addiction Treatment Shows 85% Success Rate',
        description: 'Revolutionary treatment approach combines therapy with innovative medical protocols.',
        url: '#',
        image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
        source_name: 'Medical Breakthrough',
        published_at: new Date().toISOString(),
        category: 'research',
        interaction_count: 245
      },
      {
        id: 'trending_2',
        title: 'Celebrity Opens Up About Recovery Journey',
        description: 'Famous actor shares inspiring story of overcoming addiction and finding hope.',
        url: '#',
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        source_name: 'Entertainment News',
        published_at: new Date().toISOString(),
        category: 'success_stories',
        interaction_count: 189
      },
      {
        id: 'trending_3',
        title: 'Virtual Reality Therapy Shows Promise for Addiction Treatment',
        description: 'Cutting-edge VR technology helps patients practice coping strategies in safe environments.',
        url: '#',
        image_url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400',
        source_name: 'Tech Health',
        published_at: new Date().toISOString(),
        category: 'research',
        interaction_count: 156
      }
    ];

    return trendingNews.slice(0, limit);
  }

  // Track article interaction
  async trackInteraction(articleUrl, interactionType = 'view') {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return;

      const { error } = await supabase.rpc('track_article_interaction', {
        p_article_url: articleUrl,
        p_interaction_type: interactionType
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }

  // Get recovery articles (static content)
  async getRecoveryArticles(limit = 20, offset = 0, category = null) {
    try {
      const { data, error } = await supabase.rpc('get_recovery_articles', {
        p_limit: limit,
        p_offset: offset,
        p_category: category
      });
      
      if (error) {
        console.warn('Database function not available, using fallback data:', error);
        return this.getFallbackArticles(category);
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching recovery articles, using fallback:', error);
      return this.getFallbackArticles(category);
    }
  }

  // Fallback articles when database is not set up
  getFallbackArticles(category = null) {
    const fallbackArticles = [
      {
        id: '1',
        title: 'Understanding Addiction: The Science Behind Recovery',
        description: 'Learn about the neurological aspects of addiction and how understanding the science can help in recovery.',
        content: `Addiction is a complex brain disorder that affects millions of people worldwide. Understanding the science behind addiction can be crucial for successful recovery.

The brain's reward system plays a central role in addiction. When we engage in pleasurable activities, our brains release dopamine, a neurotransmitter that creates feelings of satisfaction and motivates us to repeat the behavior. Addictive substances and behaviors hijack this natural reward system, causing the brain to release much larger amounts of dopamine than usual.

Over time, the brain adapts to these elevated dopamine levels by reducing its natural production and decreasing the number of dopamine receptors. This leads to tolerance, meaning more of the substance is needed to achieve the same effect, and withdrawal symptoms when the substance is not present.

Recovery involves allowing the brain to heal and restore its natural balance. This process takes time and often requires professional support. Evidence-based treatments like cognitive-behavioral therapy, medication-assisted treatment, and support groups can all play important roles in helping the brain recover.

Understanding that addiction is a medical condition, not a moral failing, is crucial for both those struggling with addiction and their loved ones. With proper treatment and support, recovery is absolutely possible.`,
        url: '#',
        image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
        source_name: 'Recovery Science',
        published_at: new Date().toISOString(),
        category: 'research',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        title: '10 Effective Coping Strategies for Recovery',
        description: 'Discover practical coping mechanisms that can help you maintain sobriety and build resilience.',
        content: `Recovery is a journey that requires multiple tools and strategies. Here are 10 effective coping mechanisms that can help you maintain sobriety and build resilience:

1. **Mindfulness and Meditation**: Regular practice helps you stay present and manage stress. Even 5-10 minutes daily can make a significant difference.

2. **Physical Exercise**: Regular physical activity releases endorphins, improves mood, and provides a healthy outlet for stress and energy.

3. **Healthy Sleep Habits**: Maintain a consistent sleep schedule. Poor sleep can trigger cravings and make it harder to cope with stress.

4. **Journaling**: Writing about your thoughts and feelings helps process emotions and track your progress.

5. **Deep Breathing Exercises**: Simple breathing techniques can help manage anxiety and cravings in the moment.

6. **Support Groups**: Connecting with others who understand your experience provides valuable support and accountability.

7. **Hobby Development**: Engaging in meaningful activities fills time previously spent using substances and builds self-esteem.

8. **Healthy Nutrition**: A balanced diet supports physical and mental health during recovery.

9. **Setting Boundaries**: Learning to say no to people, places, and situations that threaten your sobriety.

10. **Professional Support**: Regular therapy sessions provide professional guidance and help develop personalized coping strategies.

Remember, not every strategy works for everyone. It's important to find what works best for you and be patient with yourself as you develop these new habits.`,
        url: '#',
        image_url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400',
        source_name: 'Recovery Tips',
        published_at: new Date().toISOString(),
        category: 'recovery_tips',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Mental Health and Addiction: Breaking the Stigma',
        description: 'Addressing the connection between mental health issues and addiction, and how to seek help.',
        content: 'Mental health and addiction often go hand in hand...',
        url: '#',
        image_url: 'https://images.unsplash.com/photo-1573511860302-28c524319d2a?w=400',
        source_name: 'Mental Health Today',
        published_at: new Date().toISOString(),
        category: 'mental_health',
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        title: 'From Rock Bottom to Recovery: A Success Story',
        description: 'Read about John\'s inspiring journey from addiction to becoming a recovery advocate.',
        content: `John never thought he would overcome his addiction. At 35, he had lost his job, his family, and nearly his life to substance abuse. But today, five years sober, he's a recovery advocate helping others find their path to healing.

"I hit what I thought was rock bottom multiple times," John recalls. "Each time I thought it couldn't get worse, it did. I lost my job as an engineer when I started showing up intoxicated. My wife left with our kids. I was homeless, living in my car."

The turning point came when John nearly died from an overdose. "Waking up in the hospital, seeing the disappointment in my daughter's eyes – that's when I knew I had to change or I was going to die."

John's recovery journey wasn't easy. It started with detox, followed by a 90-day residential treatment program. "The first month was hell," he admits. "My body was healing, but my mind was still convinced I needed substances to function."

What made the difference was finding the right support system. "I had to learn to be vulnerable, to ask for help. That was harder than quitting drugs," John says. He found strength in group therapy sessions and built lasting friendships with others in recovery.

John also discovered the importance of finding purpose. He started volunteering at the treatment center where he got sober, sharing his story with newcomers. "Helping others helped me heal. It gave me a reason to stay sober beyond just myself."

Today, John works as a certified addiction counselor. He's rebuilt his relationship with his children and has been married to his partner Sarah for two years. "Recovery isn't just about stopping substance use," he emphasizes. "It's about building a life worth living."

His advice to others struggling with addiction: "Don't wait for tomorrow. Don't wait for the 'right' time. There will never be a perfect moment to start recovery. The best time is now, and you don't have to do it alone."`,
        url: '#',
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        source_name: 'Recovery Stories',
        published_at: new Date().toISOString(),
        category: 'success_stories',
        created_at: new Date().toISOString()
      },
      {
        id: '5',
        title: 'Latest Research on Addiction Treatment Methods',
        description: 'New studies show promising results for innovative treatment approaches.',
        content: 'Recent research has revealed new insights into addiction treatment...',
        url: '#',
        image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
        source_name: 'Medical Research',
        published_at: new Date().toISOString(),
        category: 'research',
        created_at: new Date().toISOString()
      },
      {
        id: '6',
        title: 'Building a Support Network in Recovery',
        description: 'The importance of community and relationships in maintaining long-term sobriety.',
        content: 'Recovery is not a journey you have to take alone...',
        url: '#',
        image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
        source_name: 'Recovery Community',
        published_at: new Date().toISOString(),
        category: 'recovery_tips',
        created_at: new Date().toISOString()
      }
    ];

    if (category && category !== 'all') {
      return fallbackArticles.filter(article => article.category === category);
    }
    return fallbackArticles;
  }

  // Get latest news from database with fallback
  async getLatestNews(limit = 20, offset = 0, category = null) {
    try {
      const { data, error } = await supabase.rpc('get_latest_news', {
        p_limit: limit,
        p_offset: offset,
        p_category: category
      });
      
      if (error) {
        console.warn('Database function not available, fetching from API:', error);
        return await this.fetchAndReturnNews(limit, category);
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching latest news, trying API fallback:', error);
      return await this.fetchAndReturnNews(limit, category);
    }
  }

  // Fetch news from API and return directly (when database isn't available)
  async fetchAndReturnNews(limit = 20, category = null) {
    try {
      let keywords = ['addiction recovery', 'mental health', 'wellness'];
      
      if (category && category !== 'all') {
        const categoryKeywords = {
          'addiction_news': ['addiction', 'substance abuse', 'drug addiction'],
          'recovery_tips': ['recovery', 'rehabilitation', 'sobriety'],
          'mental_health': ['mental health', 'depression', 'anxiety'],
          'success_stories': ['recovery success', 'addiction recovery story'],
          'research': ['addiction research', 'treatment study']
        };
        keywords = categoryKeywords[category] || keywords;
      }

      const articles = await this.fetchNewsFromAPI(keywords, limit);
      
      // Transform to match expected format
      return articles.map((article, index) => ({
        id: `news_${index}`,
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        image_url: article.urlToImage,
        source_name: article.source?.name || 'News Source',
        published_at: article.publishedAt,
        category: this.categorizeArticle(article.title + ' ' + article.description),
        created_at: article.publishedAt
      })).filter(article => article.title && article.url);
      
    } catch (error) {
      console.error('Error fetching news from API:', error);
      return this.getFallbackNews(category);
    }
  }

  // Fallback news when both database and API fail
  getFallbackNews(category = null) {
    const fallbackNews = [
      {
        id: 'news_1',
        title: 'New Treatment Center Opens to Address Rising Addiction Rates',
        description: 'A state-of-the-art facility opens its doors to provide comprehensive addiction treatment services.',
        content: 'The new treatment center features innovative programs...',
        url: '#',
        image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
        source_name: 'Health News',
        published_at: new Date().toISOString(),
        category: 'addiction_news',
        created_at: new Date().toISOString()
      },
      {
        id: 'news_2',
        title: 'Study Shows Meditation Effective in Addiction Recovery',
        description: 'Recent research demonstrates the positive impact of mindfulness practices on recovery outcomes.',
        content: 'A comprehensive study involving 500 participants...',
        url: '#',
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        source_name: 'Science Daily',
        published_at: new Date().toISOString(),
        category: 'research',
        created_at: new Date().toISOString()
      },
      {
        id: 'news_3',
        title: 'Mental Health Awareness Week Focuses on Addiction',
        description: 'This year\'s campaign highlights the connection between mental health and substance abuse.',
        content: 'Mental Health Awareness Week brings attention to...',
        url: '#',
        image_url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400',
        source_name: 'Mental Health Today',
        published_at: new Date().toISOString(),
        category: 'mental_health',
        created_at: new Date().toISOString()
      }
    ];

    if (category && category !== 'all') {
      return fallbackNews.filter(news => news.category === category);
    }
    return fallbackNews;
  }

  // Search recovery articles
  async searchRecoveryArticles(searchTerm, limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase.rpc('search_articles', {
        p_search_term: searchTerm,
        p_limit: limit,
        p_offset: offset
      });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching recovery articles:', error);
      return [];
    }
  }

  // Get recommended articles
  async getRecommendedArticles(limit = 10) {
    try {
      const { data, error } = await supabase.rpc('recommended_articles', {
        p_limit: limit
      });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recommended articles:', error);
      return [];
    }
  }

  // Bookmark article
  async bookmarkArticle(articleUrl, articleTitle) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('article_bookmarks')
        .insert({
          user_id: user.user.id,
          article_url: articleUrl,
          article_title: articleTitle
        });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error bookmarking article:', error);
      throw error;
    }
  }

  // Remove bookmark
  async removeBookmark(articleUrl) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('article_bookmarks')
        .delete()
        .eq('user_id', user.user.id)
        .eq('article_url', articleUrl);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  }

  // Get user bookmarks
  async getUserBookmarks() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return [];

      const { data, error } = await supabase
        .from('article_bookmarks')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }
  }
}

export const newsService = new NewsService();
export default newsService;
