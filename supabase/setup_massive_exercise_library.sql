-- Execute this SQL in your Supabase SQL Editor to create 1000+ exercise videos

-- First, run the massive exercise videos import
-- This will create the enhanced table structure and bulk insert function
-- Copy the content from: supabase/massive_exercise_videos_import.sql

-- After running the import, create additional tables for enhanced functionality

-- Workout Playlists Table
CREATE TABLE IF NOT EXISTS workout_playlists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_ids INTEGER[] NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  total_duration VARCHAR(50),
  difficulty_level VARCHAR(20),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Video Analytics Table
CREATE TABLE IF NOT EXISTS video_analytics (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES exercise_videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'view', 'complete', 'skip', 'like', 'save'
  session_duration INTEGER, -- seconds watched
  completion_percentage REAL, -- 0-100
  device_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_exercise_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferred_categories TEXT[] DEFAULT '{}',
  preferred_instructors TEXT[] DEFAULT '{}',
  preferred_intensity VARCHAR(20) DEFAULT 'moderate',
  preferred_duration VARCHAR(20) DEFAULT 'medium',
  avoided_categories TEXT[] DEFAULT '{}',
  mental_health_focus TEXT[] DEFAULT '{}',
  fitness_goals TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Video Bookmarks Table
CREATE TABLE IF NOT EXISTS video_bookmarks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES exercise_videos(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Enable RLS on new tables
ALTER TABLE workout_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Workout Playlists Policies
CREATE POLICY "Users can manage their own playlists" ON workout_playlists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public playlists" ON workout_playlists
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- Video Analytics Policies
CREATE POLICY "Users can manage their own analytics" ON video_analytics
  FOR ALL USING (auth.uid() = user_id);

-- User Preferences Policies
CREATE POLICY "Users can manage their own preferences" ON user_exercise_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Video Bookmarks Policies
CREATE POLICY "Users can manage their own bookmarks" ON video_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_playlists_user_id ON workout_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_video_id ON video_analytics(video_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_user_id ON video_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_video_bookmarks_user_id ON video_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_video_bookmarks_video_id ON video_bookmarks(video_id);

-- Advanced Functions

-- Get personalized video recommendations
CREATE OR REPLACE FUNCTION get_personalized_recommendations(user_uuid UUID, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    id INTEGER,
    title VARCHAR(255),
    description TEXT,
    youtube_id VARCHAR(50),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    difficulty VARCHAR(20),
    intensity_level VARCHAR(20),
    duration VARCHAR(20),
    instructor VARCHAR(255),
    recovery_benefits TEXT[],
    relevance_score REAL
) AS $$
DECLARE
    user_prefs RECORD;
BEGIN
    -- Get user preferences
    SELECT * INTO user_prefs 
    FROM user_exercise_preferences 
    WHERE user_id = user_uuid;
    
    -- If no preferences, return popular videos
    IF user_prefs IS NULL THEN
        RETURN QUERY
        SELECT v.id, v.title, v.description, v.youtube_id, v.category, 
               v.subcategory, v.difficulty, v.intensity_level, v.duration, 
               v.instructor, v.recovery_benefits, 1.0::REAL as relevance_score
        FROM exercise_videos v
        ORDER BY v.is_featured DESC, v.view_count DESC
        LIMIT limit_count;
        RETURN;
    END IF;
    
    -- Return personalized recommendations
    RETURN QUERY
    SELECT v.id, v.title, v.description, v.youtube_id, v.category, 
           v.subcategory, v.difficulty, v.intensity_level, v.duration, 
           v.instructor, v.recovery_benefits,
           (
               CASE WHEN v.category = ANY(user_prefs.preferred_categories) THEN 2.0 ELSE 1.0 END +
               CASE WHEN v.instructor = ANY(user_prefs.preferred_instructors) THEN 1.5 ELSE 1.0 END +
               CASE WHEN v.intensity_level = user_prefs.preferred_intensity THEN 1.5 ELSE 1.0 END +
               CASE WHEN v.recovery_benefits && user_prefs.mental_health_focus THEN 2.0 ELSE 1.0 END
           )::REAL as relevance_score
    FROM exercise_videos v
    WHERE (user_prefs.avoided_categories IS NULL OR NOT (v.category = ANY(user_prefs.avoided_categories)))
    ORDER BY relevance_score DESC, v.view_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Track video analytics
CREATE OR REPLACE FUNCTION track_video_event(
    video_id_param INTEGER,
    user_id_param UUID,
    event_type_param VARCHAR(50),
    session_duration_param INTEGER DEFAULT NULL,
    completion_percentage_param REAL DEFAULT NULL,
    device_type_param VARCHAR(50) DEFAULT 'web'
)
RETURNS void AS $$
BEGIN
    INSERT INTO video_analytics (
        video_id, user_id, event_type, session_duration, 
        completion_percentage, device_type
    ) VALUES (
        video_id_param, user_id_param, event_type_param, 
        session_duration_param, completion_percentage_param, device_type_param
    );
    
    -- Update view count if it's a view event
    IF event_type_param = 'view' THEN
        UPDATE exercise_videos 
        SET view_count = view_count + 1,
            updated_at = NOW()
        WHERE id = video_id_param;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get trending videos (most viewed in last 7 days)
CREATE OR REPLACE FUNCTION get_trending_videos(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id INTEGER,
    title VARCHAR(255),
    description TEXT,
    youtube_id VARCHAR(50),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    recent_views BIGINT,
    total_views INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT v.id, v.title, v.description, v.youtube_id, v.category, 
           v.subcategory, COUNT(va.id) as recent_views, v.view_count as total_views
    FROM exercise_videos v
    LEFT JOIN video_analytics va ON v.id = va.video_id 
        AND va.event_type = 'view' 
        AND va.created_at >= NOW() - INTERVAL '7 days'
    GROUP BY v.id, v.title, v.description, v.youtube_id, v.category, 
             v.subcategory, v.view_count
    ORDER BY recent_views DESC, total_views DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's workout history
CREATE OR REPLACE FUNCTION get_user_workout_history(user_uuid UUID, limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
    video_id INTEGER,
    video_title VARCHAR(255),
    category VARCHAR(100),
    duration VARCHAR(20),
    completed_at TIMESTAMP,
    completion_percentage REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT va.video_id, ev.title as video_title, ev.category, ev.duration,
           va.created_at as completed_at, va.completion_percentage
    FROM video_analytics va
    JOIN exercise_videos ev ON va.video_id = ev.id
    WHERE va.user_id = user_uuid 
      AND va.event_type IN ('complete', 'view')
    ORDER BY va.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create summary statistics view
CREATE OR REPLACE VIEW exercise_summary_stats AS
SELECT 
    category,
    COUNT(*) as total_videos,
    COUNT(CASE WHEN difficulty = 'beginner' THEN 1 END) as beginner_count,
    COUNT(CASE WHEN difficulty = 'intermediate' THEN 1 END) as intermediate_count,
    COUNT(CASE WHEN difficulty = 'advanced' THEN 1 END) as advanced_count,
    COUNT(CASE WHEN intensity_level = 'low' THEN 1 END) as low_intensity_count,
    COUNT(CASE WHEN intensity_level = 'moderate' THEN 1 END) as moderate_intensity_count,
    COUNT(CASE WHEN intensity_level = 'high' THEN 1 END) as high_intensity_count,
    ROUND(AVG(view_count), 2) as avg_views,
    STRING_AGG(DISTINCT instructor, ', ') as all_instructors
FROM exercise_videos
GROUP BY category;

-- Grant permissions
GRANT SELECT ON exercise_summary_stats TO authenticated;
GRANT SELECT ON exercise_summary_stats TO anon;

-- Final verification and summary
DO $$
DECLARE
    total_videos INTEGER;
    total_categories INTEGER;
    total_instructors INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_videos FROM exercise_videos;
    SELECT COUNT(DISTINCT category) INTO total_categories FROM exercise_videos;
    SELECT COUNT(DISTINCT instructor) INTO total_instructors FROM exercise_videos WHERE instructor IS NOT NULL;
    
    RAISE NOTICE '=== MASSIVE EXERCISE VIDEO LIBRARY SETUP COMPLETE ===';
    RAISE NOTICE 'Total Videos: %', total_videos;
    RAISE NOTICE 'Total Categories: %', total_categories;
    RAISE NOTICE 'Total Instructors: %', total_instructors;
    RAISE NOTICE 'Advanced Features: Analytics, Personalization, Playlists, Bookmarks';
    RAISE NOTICE '========================================================';
END $$;
