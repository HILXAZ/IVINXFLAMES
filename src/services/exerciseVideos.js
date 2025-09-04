import { supabase } from '../lib/supabase';

// Fetch exercise videos from database
export const fetchExerciseVideos = async (category = null, limit = 10) => {
  try {
    let query = supabase
      .from('exercise_videos')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching exercise videos:', error);
      return { videos: [], error: error.message };
    }

    return { videos: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { videos: [], error: 'Failed to fetch exercise videos' };
  }
};

// Fetch a random video from a specific category
export const fetchRandomExerciseVideo = async (category = null, difficulty = null) => {
  try {
    let query = supabase
      .from('exercise_videos')
      .select('*');

    if (category) {
      query = query.eq('category', category);
    }

    if (difficulty) {
      query = query.eq('difficulty_level', difficulty);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching random exercise video:', error);
      return { video: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return { video: null, error: 'No videos found for the selected criteria' };
    }

    // Select a random video from the results
    const randomIndex = Math.floor(Math.random() * data.length);
    const selectedVideo = data[randomIndex];

    // Increment view count
    await incrementVideoViewCount(selectedVideo.id);

    return { video: selectedVideo, error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { video: null, error: 'Failed to fetch random exercise video' };
  }
};

// Increment view count for a video
export const incrementVideoViewCount = async (videoId) => {
  try {
    const { error } = await supabase
      .from('exercise_videos')
      .update({ view_count: supabase.sql`view_count + 1` })
      .eq('id', videoId);

    if (error) {
      console.error('Error incrementing view count:', error);
    }
  } catch (err) {
    console.error('Unexpected error incrementing view count:', err);
  }
};

// Fetch exercise videos by difficulty level
export const fetchVideosByDifficulty = async (difficulty) => {
  return fetchExerciseVideos(null, null, { difficulty_level: difficulty });
};

// Fetch featured exercise videos
export const fetchFeaturedVideos = async (limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('exercise_videos')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured videos:', error);
      return { videos: [], error: error.message };
    }

    return { videos: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { videos: [], error: 'Failed to fetch featured videos' };
  }
};

// Get all available categories
export const getExerciseCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('exercise_videos')
      .select('category')
      .distinct();

    if (error) {
      console.error('Error fetching categories:', error);
      return { categories: [], error: error.message };
    }

    const categories = data?.map(item => item.category) || [];
    return { categories, error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { categories: [], error: 'Failed to fetch categories' };
  }
};

// Fallback exercise videos for when database is not available
export const FALLBACK_EXERCISE_VIDEOS = [
  {
    id: 'fallback-001',
    title: '10-Minute Gentle Yoga for Stress Relief',
    description: 'A calming yoga sequence perfect for reducing stress and anxiety. Great for recovery support.',
    youtube_id: 'VaoV0vQ5GdU',
    youtube_url: 'https://www.youtube.com/watch?v=VaoV0vQ5GdU',
    thumbnail_url: 'https://img.youtube.com/vi/VaoV0vQ5GdU/maxresdefault.jpg',
    category: 'stress-relief',
    difficulty_level: 'beginner',
    duration_minutes: 10,
    target_muscle_groups: ['full body', 'spine', 'shoulders'],
    equipment_needed: ['yoga mat'],
    tags: ['yoga', 'flexibility', 'mindfulness'],
    recovery_benefits: ['Reduces cortisol levels', 'Improves mood', 'Releases physical tension', 'Promotes mindfulness'],
    is_featured: true,
    view_count: 0
  },
  {
    id: 'fallback-002',
    title: '7-Minute Scientific Workout',
    description: 'High-intensity workout that boosts endorphins and energy levels quickly.',
    youtube_id: 'ECxYJcnvyMw',
    youtube_url: 'https://www.youtube.com/watch?v=ECxYJcnvyMw',
    thumbnail_url: 'https://img.youtube.com/vi/ECxYJcnvyMw/maxresdefault.jpg',
    category: 'quick-energy',
    difficulty_level: 'intermediate',
    duration_minutes: 7,
    target_muscle_groups: ['full body', 'cardiovascular'],
    equipment_needed: ['none'],
    tags: ['HIIT', 'bodyweight', 'cardio'],
    recovery_benefits: ['Releases endorphins', 'Improves mood quickly', 'Builds confidence', 'Reduces stress hormones'],
    is_featured: true,
    view_count: 0
  },
  {
    id: 'fallback-003',
    title: '15-Minute Tai Chi for Beginners',
    description: 'Slow, meditative movements that combine physical activity with mindfulness.',
    youtube_id: 'PSsWlufyg2M',
    youtube_url: 'https://www.youtube.com/watch?v=PSsWlufyg2M',
    thumbnail_url: 'https://img.youtube.com/vi/PSsWlufyg2M/maxresdefault.jpg',
    category: 'mindful-movement',
    difficulty_level: 'beginner',
    duration_minutes: 15,
    target_muscle_groups: ['full body', 'balance'],
    equipment_needed: ['none'],
    tags: ['tai chi', 'meditation', 'balance'],
    recovery_benefits: ['Improves focus', 'Reduces anxiety', 'Enhances mind-body connection', 'Promotes emotional regulation'],
    is_featured: true,
    view_count: 0
  },
  {
    id: 'fallback-004',
    title: '10-Minute Breathing Exercises for Anxiety',
    description: 'Structured breathing exercises specifically designed to manage anxiety and cravings.',
    youtube_id: 'tEmt1Znux58',
    youtube_url: 'https://www.youtube.com/watch?v=tEmt1Znux58',
    thumbnail_url: 'https://img.youtube.com/vi/tEmt1Znux58/maxresdefault.jpg',
    category: 'stress-relief',
    difficulty_level: 'beginner',
    duration_minutes: 10,
    target_muscle_groups: ['respiratory system'],
    equipment_needed: ['none'],
    tags: ['breathing', 'anxiety relief', 'relaxation'],
    recovery_benefits: ['Activates parasympathetic nervous system', 'Reduces anxiety symptoms', 'Helps manage cravings', 'Improves emotional regulation'],
    is_featured: true,
    view_count: 0
  },
  {
    id: 'fallback-005',
    title: '20-Minute Bodyweight Strength Training',
    description: 'Build physical and mental strength with this bodyweight routine.',
    youtube_id: '4V1hDmMfH6I',
    youtube_url: 'https://www.youtube.com/watch?v=4V1hDmMfH6I',
    thumbnail_url: 'https://img.youtube.com/vi/4V1hDmMfH6I/maxresdefault.jpg',
    category: 'strength',
    difficulty_level: 'intermediate',
    duration_minutes: 20,
    target_muscle_groups: ['arms', 'chest', 'core', 'legs'],
    equipment_needed: ['none'],
    tags: ['strength', 'bodyweight', 'muscle building'],
    recovery_benefits: ['Builds self-confidence', 'Improves self-discipline', 'Releases endorphins', 'Creates sense of accomplishment'],
    is_featured: false,
    view_count: 0
  },
  {
    id: 'fallback-006',
    title: '8-Minute HIIT for Dopamine Boost',
    description: 'High-intensity interval training specifically designed to naturally boost dopamine levels and fight depression.',
    youtube_id: 'ml6cT4AZdqI',
    youtube_url: 'https://www.youtube.com/watch?v=ml6cT4AZdqI',
    thumbnail_url: 'https://img.youtube.com/vi/ml6cT4AZdqI/maxresdefault.jpg',
    category: 'quick-energy',
    difficulty_level: 'intermediate',
    duration_minutes: 8,
    target_muscle_groups: ['full body', 'cardiovascular'],
    equipment_needed: ['none'],
    tags: ['HIIT', 'dopamine', 'interval training'],
    recovery_benefits: ['Naturally increases dopamine', 'Fights depression', 'Builds mental toughness', 'Provides healthy adrenaline rush'],
    is_featured: true,
    view_count: 0
  },
  {
    id: 'fallback-007',
    title: '6-Minute Morning Yoga for Addiction Recovery',
    description: 'Gentle morning practice focused on setting positive intentions and building inner strength for recovery.',
    youtube_id: 'v7AYKMP6rOE',
    youtube_url: 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
    thumbnail_url: 'https://img.youtube.com/vi/v7AYKMP6rOE/maxresdefault.jpg',
    category: 'stress-relief',
    difficulty_level: 'beginner',
    duration_minutes: 6,
    target_muscle_groups: ['spine', 'hips', 'shoulders'],
    equipment_needed: ['yoga mat'],
    tags: ['morning routine', 'addiction recovery', 'intention setting'],
    recovery_benefits: ['Sets positive daily intention', 'Builds self-awareness', 'Reduces morning anxiety', 'Strengthens mind-body connection'],
    is_featured: true,
    view_count: 0
  },
  {
    id: 'fallback-008',
    title: '15-Minute Meditation for Craving Management',
    description: 'Guided meditation specifically designed to help manage and overcome cravings during recovery.',
    youtube_id: 'SEfs5TJZ6Nk',
    youtube_url: 'https://www.youtube.com/watch?v=SEfs5TJZ6Nk',
    thumbnail_url: 'https://img.youtube.com/vi/SEfs5TJZ6Nk/maxresdefault.jpg',
    category: 'mindful-movement',
    difficulty_level: 'beginner',
    duration_minutes: 15,
    target_muscle_groups: ['mind'],
    equipment_needed: ['comfortable seat or cushion'],
    tags: ['meditation', 'craving management', 'mindfulness'],
    recovery_benefits: ['Reduces craving intensity', 'Builds impulse control', 'Increases self-awareness', 'Develops healthy coping mechanisms'],
    is_featured: true,
    view_count: 0
  },
  {
    id: 'fallback-009',
    title: '12-Minute Strength Training for Self-Discipline',
    description: 'Bodyweight exercises focused on building both physical strength and mental discipline for recovery.',
    youtube_id: 'vc1E5CfRfos',
    youtube_url: 'https://www.youtube.com/watch?v=vc1E5CfRfos',
    thumbnail_url: 'https://img.youtube.com/vi/vc1E5CfRfos/maxresdefault.jpg',
    category: 'strength',
    difficulty_level: 'intermediate',
    duration_minutes: 12,
    target_muscle_groups: ['core', 'arms', 'legs'],
    equipment_needed: ['none'],
    tags: ['bodyweight', 'discipline', 'mental strength'],
    recovery_benefits: ['Builds self-discipline', 'Improves self-control', 'Increases mental resilience', 'Creates sense of achievement'],
    is_featured: false,
    view_count: 0
  },
  {
    id: 'fallback-010',
    title: '5-Minute Quick Energy Burst',
    description: 'Super quick workout for when you need an immediate mood lift and energy boost.',
    youtube_id: 'L_xrDAtykMM',
    youtube_url: 'https://www.youtube.com/watch?v=L_xrDAtykMM',
    thumbnail_url: 'https://img.youtube.com/vi/L_xrDAtykMM/maxresdefault.jpg',
    category: 'quick-energy',
    difficulty_level: 'beginner',
    duration_minutes: 5,
    target_muscle_groups: ['full body', 'cardiovascular'],
    equipment_needed: ['none'],
    tags: ['quick workout', 'energy boost', 'mood lift'],
    recovery_benefits: ['Instant mood improvement', 'Quick energy boost', 'Reduces lethargy', 'Builds momentum'],
    is_featured: false,
    view_count: 0
  },
  {
    id: 'fallback-011',
    title: '10-Min Chair Yoga (Gentle & Safe)',
    description: 'Seated yoga flow to calm the nervous system when you feel overwhelmed.',
    youtube_id: 'KEjiXtb2hrg',
    youtube_url: 'https://www.youtube.com/watch?v=KEjiXtb2hrg',
    thumbnail_url: 'https://img.youtube.com/vi/KEjiXtb2hrg/maxresdefault.jpg',
    category: 'stress-relief',
    difficulty_level: 'beginner',
    duration_minutes: 10,
    target_muscle_groups: ['neck', 'shoulders', 'spine'],
    equipment_needed: ['chair'],
    tags: ['chair yoga', 'gentle', 'mobility'],
    recovery_benefits: ['Reduces anxiety', 'Loosens tension', 'Grounds the body'],
    is_featured: true,
    view_count: 0
  },
  {
    id: 'fallback-012',
    title: '15-Min Qigong for Stress & Balance',
    description: 'Slow, flowing movements to regulate energy and calm the mind.',
    youtube_id: 'dv1QDlWgXc8',
    youtube_url: 'https://www.youtube.com/watch?v=dv1QDlWgXc8',
    thumbnail_url: 'https://img.youtube.com/vi/dv1QDlWgXc8/maxresdefault.jpg',
    category: 'mindful-movement',
    difficulty_level: 'beginner',
    duration_minutes: 15,
    target_muscle_groups: ['full body', 'balance'],
    equipment_needed: ['none'],
    tags: ['qigong', 'mindfulness', 'breath'],
    recovery_benefits: ['Reduces stress', 'Improves focus', 'Enhances mind-body connection'],
    is_featured: true,
    view_count: 0
  },
  {
    id: 'fallback-013',
    title: '12-Min Low-Impact Cardio (No Jumping)',
    description: 'Gentle cardio to boost endorphins without stressing the joints.',
    youtube_id: 'oAPCPjnU1wA',
    youtube_url: 'https://www.youtube.com/watch?v=oAPCPjnU1wA',
    thumbnail_url: 'https://img.youtube.com/vi/oAPCPjnU1wA/maxresdefault.jpg',
    category: 'quick-energy',
    difficulty_level: 'beginner',
    duration_minutes: 12,
    target_muscle_groups: ['full body', 'cardiovascular'],
    equipment_needed: ['none'],
    tags: ['low impact', 'cardio', 'mood'],
    recovery_benefits: ['Lifts mood', 'Improves circulation', 'Builds momentum'],
    is_featured: false,
    view_count: 0
  },
  {
    id: 'fallback-014',
    title: '20-Min Pilates Core for Stability',
    description: 'Build steady core strength to support posture and confidence.',
    youtube_id: 'fRscY_2H_QY',
    youtube_url: 'https://www.youtube.com/watch?v=fRscY_2H_QY',
    thumbnail_url: 'https://img.youtube.com/vi/fRscY_2H_QY/maxresdefault.jpg',
    category: 'strength',
    difficulty_level: 'intermediate',
    duration_minutes: 20,
    target_muscle_groups: ['core', 'glutes', 'back'],
    equipment_needed: ['mat'],
    tags: ['pilates', 'core', 'stability'],
    recovery_benefits: ['Builds self-belief', 'Improves posture', 'Stabilizes mood'],
    is_featured: false,
    view_count: 0
  },
  {
    id: 'fallback-015',
    title: '10-Min Full-Body Stretch to Reset',
    description: 'Simple stretches to release tension and reset after cravings.',
    youtube_id: 'eM4Z9_13q7w',
    youtube_url: 'https://www.youtube.com/watch?v=eM4Z9_13q7w',
    thumbnail_url: 'https://img.youtube.com/vi/eM4Z9_13q7w/maxresdefault.jpg',
    category: 'stress-relief',
    difficulty_level: 'beginner',
    duration_minutes: 10,
    target_muscle_groups: ['full body'],
    equipment_needed: ['none'],
    tags: ['stretch', 'flexibility', 'relax'],
    recovery_benefits: ['Releases tension', 'Improves breathing', 'Calms the mind'],
    is_featured: true,
    view_count: 0
  },
  {
    id: 'fallback-016',
    title: '8-Min Mindful Walking (Indoor)',
    description: 'Guided walking with breath and awareness for quick relief.',
    youtube_id: 's0E0JfHD4w8',
    youtube_url: 'https://www.youtube.com/watch?v=s0E0JfHD4w8',
    thumbnail_url: 'https://img.youtube.com/vi/s0E0JfHD4w8/maxresdefault.jpg',
    category: 'mindful-movement',
    difficulty_level: 'beginner',
    duration_minutes: 8,
    target_muscle_groups: ['legs', 'cardiovascular'],
    equipment_needed: ['none'],
    tags: ['walking', 'mindfulness', 'grounding'],
    recovery_benefits: ['Centers attention', 'Relieves restlessness', 'Boosts mood'],
    is_featured: false,
    view_count: 0
  },
  {
    id: 'fallback-017',
    title: '14-Min Yoga for Neck & Shoulders',
    description: 'Release common stress areas to ease headaches and cravings.',
    youtube_id: 'x0nZlT6B0S0',
    youtube_url: 'https://www.youtube.com/watch?v=x0nZlT6B0S0',
    thumbnail_url: 'https://img.youtube.com/vi/x0nZlT6B0S0/maxresdefault.jpg',
    category: 'stress-relief',
    difficulty_level: 'beginner',
    duration_minutes: 14,
    target_muscle_groups: ['neck', 'shoulders', 'upper back'],
    equipment_needed: ['mat'],
    tags: ['yoga', 'tension relief', 'upper body'],
    recovery_benefits: ['Eases tension', 'Improves comfort', 'Supports calm'],
    is_featured: false,
    view_count: 0
  },
  {
    id: 'fallback-018',
    title: '6-Min Box Breathing + Gentle Movement',
    description: 'Combine breathwork with soft movement for fast downshift.',
    youtube_id: 'aXItOY0sLRY',
    youtube_url: 'https://www.youtube.com/watch?v=aXItOY0sLRY',
    thumbnail_url: 'https://img.youtube.com/vi/aXItOY0sLRY/maxresdefault.jpg',
    category: 'mindful-movement',
    difficulty_level: 'beginner',
    duration_minutes: 6,
    target_muscle_groups: ['respiratory', 'full body'],
    equipment_needed: ['none'],
    tags: ['breathwork', 'calm', 'nervous system'],
    recovery_benefits: ['Activates parasympathetic system', 'Reduces cravings', 'Improves emotional regulation'],
    is_featured: true,
    view_count: 0
  },
  {
    id: 'fallback-019',
    title: '18-Min Strength (No Equipment)',
    description: 'Steady, controlled movements to build strength and resolve.',
    youtube_id: 'UBMk30rjy0o',
    youtube_url: 'https://www.youtube.com/watch?v=UBMk30rjy0o',
    thumbnail_url: 'https://img.youtube.com/vi/UBMk30rjy0o/maxresdefault.jpg',
    category: 'strength',
    difficulty_level: 'intermediate',
    duration_minutes: 18,
    target_muscle_groups: ['legs', 'glutes', 'core', 'arms'],
    equipment_needed: ['none'],
    tags: ['bodyweight', 'strength', 'discipline'],
    recovery_benefits: ['Builds resilience', 'Increases confidence', 'Improves mood'],
    is_featured: false,
    view_count: 0
  },
  {
    id: 'fallback-020',
    title: '10-Min Dance Cardio Mood Lift',
    description: 'Fun, simple moves to shake off stress and elevate mood.',
    youtube_id: 'n6j9nNKp2rE',
    youtube_url: 'https://www.youtube.com/watch?v=n6j9nNKp2rE',
    thumbnail_url: 'https://img.youtube.com/vi/n6j9nNKp2rE/maxresdefault.jpg',
    category: 'quick-energy',
    difficulty_level: 'beginner',
    duration_minutes: 10,
    target_muscle_groups: ['full body', 'cardiovascular'],
    equipment_needed: ['none'],
    tags: ['dance', 'cardio', 'fun'],
    recovery_benefits: ['Boosts dopamine', 'Relieves stress', 'Creates joy'],
    is_featured: true,
    view_count: 0
  }
];
