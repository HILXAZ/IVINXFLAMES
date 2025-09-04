import { supabase } from '../lib/supabase';
import { FALLBACK_EXERCISE_VIDEOS } from './exerciseVideos';

// Enhanced exercise video service for 1000+ videos
export const massiveExerciseVideoService = {

  // Get videos with advanced filtering and pagination
  async getVideosAdvanced({
    category = null,
    subcategory = null,
    difficulty = null,
    intensity = null,
    duration = null,
    instructor = null,
    searchTerm = null,
    page = 1,
    limit = 20,
    sortBy = 'featured' // 'featured', 'popular', 'newest', 'duration', 'alphabetical'
  } = {}) {
    try {
      let query = supabase
        .from('exercise_videos')
        .select(`
          id, title, description, youtube_id, youtube_url, 
          category, subcategory, difficulty, duration, 
          recovery_benefits, equipment_needed, instructor,
          target_audience, mental_health_focus, intensity_level,
          view_count, is_featured, created_at
        `, { count: 'exact' });

      // Apply filters
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      
      if (subcategory) {
        query = query.eq('subcategory', subcategory);
      }
      
      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }
      
      if (intensity) {
        query = query.eq('intensity_level', intensity);
      }
      
      if (instructor) {
        query = query.ilike('instructor', `%${instructor}%`);
      }

      // Search functionality
      if (searchTerm) {
        query = query.or(`
          title.ilike.%${searchTerm}%,
          description.ilike.%${searchTerm}%,
          instructor.ilike.%${searchTerm}%
        `);
      }

      // Duration filtering
      if (duration) {
        if (duration === 'short') {
          query = query.in('duration', ['5 min', '10 min']);
        } else if (duration === 'medium') {
          query = query.in('duration', ['15 min', '20 min', '25 min']);
        } else if (duration === 'long') {
          query = query.in('duration', ['30 min', '35 min', '40 min', '45 min']);
        }
      }

      // Sorting
      switch (sortBy) {
        case 'featured':
          query = query.order('is_featured', { ascending: false })
                      .order('view_count', { ascending: false });
          break;
        case 'popular':
          query = query.order('view_count', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'alphabetical':
          query = query.order('title', { ascending: true });
          break;
        default:
          query = query.order('is_featured', { ascending: false })
                      .order('view_count', { ascending: false });
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // If we have DB data, return it; else, fall back to local catalog
      if (data && data.length > 0) {
        const safeCount = typeof count === 'number' ? count : (data?.length || 0);
        return {
          videos: data || [],
          totalCount: safeCount,
          totalPages: limit > 0 ? Math.ceil(safeCount / limit) : 1,
          currentPage: page,
          error: null
        };
      }

      // Local fallback path
      const fallback = buildLocalFallbackCatalog();
      const filtered = filterAndSortLocalCatalog(fallback, { category, subcategory, difficulty, intensity, duration, instructor, searchTerm, sortBy });
      const paged = paginateLocalCatalog(filtered, page, limit);
      return {
        videos: paged.items,
        totalCount: filtered.length,
        totalPages: paged.totalPages,
        currentPage: paged.currentPage,
        error: null
      };
    } catch (err) {
      console.error('Error fetching videos:', err);
      // Return local fallbacks on error too
      const fallback = buildLocalFallbackCatalog();
      const paged = paginateLocalCatalog(fallback, 1, 20);
      return {
        videos: paged.items,
        totalCount: fallback.length,
        totalPages: paged.totalPages,
        currentPage: 1,
        error: err.message
      };
    }
  },

  // Get video statistics
  async getVideoStats() {
    try {
      const { data, error } = await supabase
        .from('video_stats')
        .select('*');

      if (error) throw error;
      return { stats: data || [], error: null };
    } catch (err) {
      console.error('Error fetching video stats:', err);
      return { stats: [], error: err.message };
    }
  },

  // Search videos using full-text search
  async searchVideos(searchTerm, limit = 50) {
    try {
      const { data, error } = await supabase
        .rpc('search_videos', { 
          search_term: searchTerm 
        })
        .limit(limit);

      if (error) throw error;
      return { videos: data || [], error: null };
    } catch (err) {
      console.error('Error searching videos:', err);
      return { videos: [], error: err.message };
    }
  },

  // Get videos by intensity level
  async getVideosByIntensity(intensity, limit = 50) {
    try {
      const { data, error } = await supabase
        .rpc('get_videos_by_intensity', { 
          intensity_filter: intensity 
        })
        .limit(limit);

      if (error) throw error;
      return { videos: data || [], error: null };
    } catch (err) {
      console.error('Error fetching videos by intensity:', err);
      return { videos: [], error: err.message };
    }
  },

  // Get unique categories and subcategories
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('exercise_videos')
        .select('category, subcategory')
        .order('category')
        .order('subcategory');

      if (error) throw error;

      // Group by category
      const categories = {};
      data?.forEach(item => {
        if (!categories[item.category]) {
          categories[item.category] = new Set();
        }
        if (item.subcategory) {
          categories[item.category].add(item.subcategory);
        }
      });

      // Convert sets to arrays
      Object.keys(categories).forEach(cat => {
        categories[cat] = Array.from(categories[cat]);
      });

      return { categories, error: null };
    } catch (err) {
      console.error('Error fetching categories:', err);
      return { categories: {}, error: err.message };
    }
  },

  // Get unique instructors
  async getInstructors() {
    try {
      const { data, error } = await supabase
        .from('exercise_videos')
        .select('instructor')
        .not('instructor', 'is', null)
        .order('instructor');

      if (error) throw error;

      const instructors = [...new Set(data?.map(item => item.instructor) || [])];
      return { instructors, error: null };
    } catch (err) {
      console.error('Error fetching instructors:', err);
      return { instructors: [], error: err.message };
    }
  },

  // Get recommended videos based on user preferences
  async getRecommendedVideos(userPreferences = {}) {
    const {
      mentalHealthFocus = [],
      preferredIntensity = 'moderate',
      maxDuration = '30 min',
      avoidCategories = []
    } = userPreferences;

    try {
      let query = supabase
        .from('exercise_videos')
        .select('*')
        .eq('intensity_level', preferredIntensity);

      // Filter out avoided categories
      if (avoidCategories.length > 0) {
        query = query.not('category', 'in', `(${avoidCategories.join(',')})`);
      }

      // Focus on mental health benefits
      if (mentalHealthFocus.length > 0) {
        query = query.overlaps('mental_health_focus', mentalHealthFocus);
      }

      const { data, error } = await query
        .order('is_featured', { ascending: false })
        .order('view_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      return { videos: data || [], error: null };
    } catch (err) {
      console.error('Error fetching recommended videos:', err);
      return { videos: [], error: err.message };
    }
  },

  // Get trending videos (most viewed recently)
  async getTrendingVideos(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('exercise_videos')
        .select('*')
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { videos: data || [], error: null };
    } catch (err) {
      console.error('Error fetching trending videos:', err);
      return { videos: [], error: err.message };
    }
  },

  // Create custom workout playlist
  async createWorkoutPlaylist(videoIds, playlistName, userId) {
    try {
      // First create the playlist
      const { data: playlist, error: playlistError } = await supabase
        .from('workout_playlists')
        .insert({
          name: playlistName,
          user_id: userId,
          video_ids: videoIds,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (playlistError) throw playlistError;

      return { playlist, error: null };
    } catch (err) {
      console.error('Error creating playlist:', err);
      return { playlist: null, error: err.message };
    }
  },

  // Batch increment view counts for multiple videos
  async batchIncrementViews(videoIds) {
    try {
      const promises = videoIds.map(id => 
        supabase.rpc('increment_view_count', { video_id: id })
      );
      
      await Promise.all(promises);
      return { success: true, error: null };
    } catch (err) {
      console.error('Error batch incrementing views:', err);
      return { success: false, error: err.message };
    }
  },

  // Get video analytics
  async getVideoAnalytics(videoId) {
    try {
      const { data, error } = await supabase
        .from('video_analytics')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false })
        .limit(30); // Last 30 days

      if (error) throw error;
      return { analytics: data || [], error: null };
    } catch (err) {
      console.error('Error fetching video analytics:', err);
      return { analytics: [], error: err.message };
    }
  }
};

// Build a richer local fallback catalog by mapping shared exercise fallbacks
export const MASSIVE_FALLBACK_VIDEOS = buildLocalFallbackCatalog();

// Helper: normalize category to underscore style used in this page and DB
function normalizeCategory(cat) {
  if (!cat) return 'stress_relief';
  // Accept both hyphen and underscore inputs and map to underscore style keys
  const key = cat.replace(/-/g, '_').toLowerCase();
  switch (key) {
    case 'stress_relief':
      return 'stress_relief';
    case 'quick_energy':
    case 'energy_boost':
      return 'energy_boost';
    case 'mindful_movement':
      return 'mindful_movement';
    case 'strength':
      return 'strength';
    default:
      return key;
  }
}

function minutesToDurationStr(mins) {
  if (!mins || Number.isNaN(Number(mins))) return '10 min';
  return `${mins} min`;
}

function difficultyToIntensity(level) {
  const map = { beginner: 'low', intermediate: 'moderate', advanced: 'high' };
  return map[level] || 'low';
}

function buildLocalFallbackCatalog() {
  // Map FALLBACK_EXERCISE_VIDEOS to the massive schema
  const mapped = (FALLBACK_EXERCISE_VIDEOS || []).map((v, idx) => ({
    id: v.id || `fallback-${1000 + idx}`,
    title: v.title,
    description: v.description,
    youtube_id: v.youtube_id,
    youtube_url: v.youtube_url,
    category: normalizeCategory(v.category),
    subcategory: v.subcategory || null,
    difficulty: v.difficulty || v.difficulty_level || 'beginner',
    duration: v.duration || minutesToDurationStr(v.duration_minutes),
    recovery_benefits: v.recovery_benefits || [],
    equipment_needed: v.equipment_needed || v.equipment || [],
    instructor: v.instructor || null,
    target_audience: v.target_muscle_groups || [],
    mental_health_focus: v.mental_health_focus || [],
    intensity_level: v.intensity_level || difficultyToIntensity(v.difficulty_level || v.difficulty),
    view_count: v.view_count || 0,
    is_featured: Boolean(v.is_featured),
    created_at: new Date().toISOString()
  }));

  // Add a few explicit essentials if missing
  const essentials = [
    {
      id: 'fallback-1001',
      title: 'Emergency 5-Minute Anxiety Relief',
      description: 'Immediate relief practice for acute anxiety and panic',
      youtube_id: 'tEmt1Znux58',
      youtube_url: 'https://www.youtube.com/watch?v=tEmt1Znux58',
      category: 'stress_relief',
      subcategory: 'emergency',
      difficulty: 'beginner',
      duration: '5 min',
      recovery_benefits: ['immediate_relief', 'panic_management'],
      equipment_needed: ['none'],
      instructor: 'Emergency Relief Protocols',
      mental_health_focus: ['panic_attacks', 'acute_anxiety'],
      intensity_level: 'low',
      is_featured: true,
      view_count: 0,
      created_at: new Date().toISOString()
    }
  ];

  // Deduplicate by youtube_id
  const byId = new Map();
  [...essentials, ...mapped].forEach(v => {
    if (v.youtube_id && !byId.has(v.youtube_id)) byId.set(v.youtube_id, v);
  });

  return Array.from(byId.values());
}

function filterAndSortLocalCatalog(items, { category, subcategory, difficulty, intensity, duration, instructor, searchTerm, sortBy }) {
  let out = [...items];
  if (category && category !== 'all') {
    out = out.filter(v => v.category === normalizeCategory(category));
  }
  if (subcategory) {
    out = out.filter(v => (v.subcategory || '').toLowerCase() === subcategory.toLowerCase());
  }
  if (difficulty) {
    out = out.filter(v => (v.difficulty || '').toLowerCase() === difficulty.toLowerCase());
  }
  if (intensity) {
    out = out.filter(v => (v.intensity_level || '').toLowerCase() === intensity.toLowerCase());
  }
  if (duration) {
    const groups = {
      short: [5, 10],
      medium: [15, 20, 25],
      long: [30, 35, 40, 45]
    };
    const allowed = new Set(groups[duration] || []);
    out = out.filter(v => {
      const mins = parseInt(String(v.duration).replace(/[^0-9]/g, ''), 10);
      return allowed.size === 0 || allowed.has(mins);
    });
  }
  if (instructor) {
    out = out.filter(v => (v.instructor || '').toLowerCase().includes(instructor.toLowerCase()));
  }
  if (searchTerm) {
    const s = searchTerm.toLowerCase();
    out = out.filter(v =>
      (v.title || '').toLowerCase().includes(s) ||
      (v.description || '').toLowerCase().includes(s) ||
      (v.instructor || '').toLowerCase().includes(s)
    );
  }

  switch (sortBy) {
    case 'featured':
      out.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || (b.view_count || 0) - (a.view_count || 0));
      break;
    case 'popular':
      out.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
      break;
    case 'newest':
      out.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    case 'alphabetical':
      out.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      break;
    default:
      break;
  }

  return out;
}

function paginateLocalCatalog(items, page = 1, limit = 20) {
  const total = items.length;
  const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const from = (currentPage - 1) * limit;
  const to = from + limit;
  return { items: items.slice(from, to), totalPages, currentPage };
}

export default massiveExerciseVideoService;
