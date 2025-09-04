-- Exercise Videos Table Schema
-- This table stores YouTube exercise videos categorized for addiction recovery

-- Create exercise_videos table
CREATE TABLE IF NOT EXISTS exercise_videos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  youtube_id text NOT NULL, -- YouTube video ID (e.g., 'dQw4w9WgXcQ')
  youtube_url text NOT NULL, -- Full YouTube URL
  thumbnail_url text, -- YouTube thumbnail URL
  category text NOT NULL, -- 'stress-relief', 'quick-energy', 'mindful-movement', 'strength', 'cardio'
  difficulty_level text DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  duration_minutes integer, -- Video duration in minutes
  target_muscle_groups text[], -- Array of target muscle groups
  equipment_needed text[], -- Array of equipment needed
  tags text[], -- Additional tags for filtering
  recovery_benefits text[], -- Specific benefits for addiction recovery
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_exercise_videos_category ON exercise_videos(category);
CREATE INDEX IF NOT EXISTS idx_exercise_videos_difficulty ON exercise_videos(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_exercise_videos_featured ON exercise_videos(is_featured);

-- Enable RLS
ALTER TABLE exercise_videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (public read access)
CREATE POLICY "Anyone can view exercise videos" ON exercise_videos FOR SELECT USING (true);

-- Insert sample exercise videos
INSERT INTO exercise_videos (
  title, 
  description, 
  youtube_id, 
  youtube_url, 
  thumbnail_url,
  category, 
  difficulty_level, 
  duration_minutes, 
  target_muscle_groups, 
  equipment_needed,
  tags,
  recovery_benefits,
  is_featured
) VALUES 
-- Stress Relief Videos
(
  '10-Minute Gentle Yoga for Stress Relief',
  'A calming yoga sequence perfect for reducing stress and anxiety. Great for recovery support.',
  'VaoV0vQ5GdU',
  'https://www.youtube.com/watch?v=VaoV0vQ5GdU',
  'https://img.youtube.com/vi/VaoV0vQ5GdU/maxresdefault.jpg',
  'stress-relief',
  'beginner',
  10,
  ARRAY['full body', 'spine', 'shoulders'],
  ARRAY['yoga mat'],
  ARRAY['yoga', 'flexibility', 'mindfulness'],
  ARRAY['Reduces cortisol levels', 'Improves mood', 'Releases physical tension', 'Promotes mindfulness'],
  true
),
(
  '5-Minute Morning Stretch Routine',
  'Quick and easy morning stretches to start your day with positive energy.',
  'g_tea8ZNk5A',
  'https://www.youtube.com/watch?v=g_tea8ZNk5A',
  'https://img.youtube.com/vi/g_tea8ZNk5A/maxresdefault.jpg',
  'stress-relief',
  'beginner',
  5,
  ARRAY['neck', 'shoulders', 'back', 'hips'],
  ARRAY['none'],
  ARRAY['morning routine', 'stretching', 'flexibility'],
  ARRAY['Improves circulation', 'Reduces morning stiffness', 'Boosts energy', 'Sets positive tone for day'],
  true
),

-- Quick Energy Videos
(
  '7-Minute Scientific Workout',
  'High-intensity workout that boosts endorphins and energy levels quickly.',
  'ECxYJcnvyMw',
  'https://www.youtube.com/watch?v=ECxYJcnvyMw',
  'https://img.youtube.com/vi/ECxYJcnvyMw/maxresdefault.jpg',
  'quick-energy',
  'intermediate',
  7,
  ARRAY['full body', 'cardiovascular'],
  ARRAY['none'],
  ARRAY['HIIT', 'bodyweight', 'cardio'],
  ARRAY['Releases endorphins', 'Improves mood quickly', 'Builds confidence', 'Reduces stress hormones'],
  true
),
(
  '10-Minute Cardio Dance Workout',
  'Fun dance cardio that lifts mood and provides quick energy boost.',
  'b2TXFiVEwOk',
  'https://www.youtube.com/watch?v=b2TXFiVEwOk',
  'https://img.youtube.com/vi/b2TXFiVEwOk/maxresdefault.jpg',
  'quick-energy',
  'beginner',
  10,
  ARRAY['cardiovascular', 'legs', 'core'],
  ARRAY['none'],
  ARRAY['dance', 'cardio', 'fun'],
  ARRAY['Boosts mood', 'Increases dopamine', 'Fun distraction', 'Improves self-esteem'],
  false
),

-- Mindful Movement Videos
(
  '15-Minute Tai Chi for Beginners',
  'Slow, meditative movements that combine physical activity with mindfulness.',
  'PSsWlufyg2M',
  'https://www.youtube.com/watch?v=PSsWlufyg2M',
  'https://img.youtube.com/vi/PSsWlufyg2M/maxresdefault.jpg',
  'mindful-movement',
  'beginner',
  15,
  ARRAY['full body', 'balance'],
  ARRAY['none'],
  ARRAY['tai chi', 'meditation', 'balance'],
  ARRAY['Improves focus', 'Reduces anxiety', 'Enhances mind-body connection', 'Promotes emotional regulation'],
  true
),
(
  '12-Minute Mindful Walking Meditation',
  'Indoor walking meditation that combines gentle movement with mindfulness practice.',
  'Hzi3PDz1AWU',
  'https://www.youtube.com/watch?v=Hzi3PDz1AWU',
  'https://img.youtube.com/vi/Hzi3PDz1AWU/maxresdefault.jpg',
  'mindful-movement',
  'beginner',
  12,
  ARRAY['legs', 'cardiovascular'],
  ARRAY['none'],
  ARRAY['walking', 'meditation', 'mindfulness'],
  ARRAY['Calms racing thoughts', 'Improves concentration', 'Reduces overwhelm', 'Promotes present-moment awareness'],
  false
),

-- Strength Building Videos
(
  '20-Minute Bodyweight Strength Training',
  'Build physical and mental strength with this bodyweight routine.',
  '4V1hDmMfH6I',
  'https://www.youtube.com/watch?v=4V1hDmMfH6I',
  'https://img.youtube.com/vi/4V1hDmMfH6I/maxresdefault.jpg',
  'strength',
  'intermediate',
  20,
  ARRAY['arms', 'chest', 'core', 'legs'],
  ARRAY['none'],
  ARRAY['strength', 'bodyweight', 'muscle building'],
  ARRAY['Builds self-confidence', 'Improves self-discipline', 'Releases endorphins', 'Creates sense of accomplishment'],
  true
),

-- Additional Recovery-Focused Exercise Videos
(
  '8-Minute HIIT for Dopamine Boost',
  'High-intensity interval training specifically designed to naturally boost dopamine levels and fight depression.',
  'ml6cT4AZdqI',
  'https://www.youtube.com/watch?v=ml6cT4AZdqI',
  'https://img.youtube.com/vi/ml6cT4AZdqI/maxresdefault.jpg',
  'quick-energy',
  'intermediate',
  8,
  ARRAY['full body', 'cardiovascular'],
  ARRAY['none'],
  ARRAY['HIIT', 'dopamine', 'interval training'],
  ARRAY['Naturally increases dopamine', 'Fights depression', 'Builds mental toughness', 'Provides healthy adrenaline rush'],
  true
),
(
  '6-Minute Morning Yoga for Addiction Recovery',
  'Gentle morning practice focused on setting positive intentions and building inner strength for recovery.',
  'v7AYKMP6rOE',
  'https://www.youtube.com/watch?v=v7AYKMP6rOE',
  'https://img.youtube.com/vi/v7AYKMP6rOE/maxresdefault.jpg',
  'stress-relief',
  'beginner',
  6,
  ARRAY['spine', 'hips', 'shoulders'],
  ARRAY['yoga mat'],
  ARRAY['morning routine', 'addiction recovery', 'intention setting'],
  ARRAY['Sets positive daily intention', 'Builds self-awareness', 'Reduces morning anxiety', 'Strengthens mind-body connection'],
  true
),
(
  '10-Minute Boxing Workout for Anger Management',
  'Shadow boxing routine to channel difficult emotions and build confidence in recovery.',
  'kOSTczrgeGU',
  'https://www.youtube.com/watch?v=kOSTczrgeGU',
  'https://img.youtube.com/vi/kOSTczrgeGU/maxresdefault.jpg',
  'quick-energy',
  'intermediate',
  10,
  ARRAY['arms', 'shoulders', 'core', 'cardiovascular'],
  ARRAY['none'],
  ARRAY['boxing', 'anger management', 'stress relief'],
  ARRAY['Channels difficult emotions', 'Builds confidence', 'Releases tension', 'Improves emotional regulation'],
  false
),
(
  '15-Minute Meditation for Craving Management',
  'Guided meditation specifically designed to help manage and overcome cravings during recovery.',
  'SEfs5TJZ6Nk',
  'https://www.youtube.com/watch?v=SEfs5TJZ6Nk',
  'https://img.youtube.com/vi/SEfs5TJZ6Nk/maxresdefault.jpg',
  'mindful-movement',
  'beginner',
  15,
  ARRAY['mind'],
  ARRAY['comfortable seat or cushion'],
  ARRAY['meditation', 'craving management', 'mindfulness'],
  ARRAY['Reduces craving intensity', 'Builds impulse control', 'Increases self-awareness', 'Develops healthy coping mechanisms'],
  true
),
(
  '12-Minute Strength Training for Self-Discipline',
  'Bodyweight exercises focused on building both physical strength and mental discipline for recovery.',
  'vc1E5CfRfos',
  'https://www.youtube.com/watch?v=vc1E5CfRfos',
  'https://img.youtube.com/vi/vc1E5CfRfos/maxresdefault.jpg',
  'strength',
  'intermediate',
  12,
  ARRAY['core', 'arms', 'legs'],
  ARRAY['none'],
  ARRAY['bodyweight', 'discipline', 'mental strength'],
  ARRAY['Builds self-discipline', 'Improves self-control', 'Increases mental resilience', 'Creates sense of achievement'],
  false
),
(
  '20-Minute Nature Walk Meditation',
  'Virtual nature walk with guided meditation for when you cannot go outside, perfect for recovery support.',
  'M0u9GST_j3s',
  'https://www.youtube.com/watch?v=M0u9GST_j3s',
  'https://img.youtube.com/vi/M0u9GST_j3s/maxresdefault.jpg',
  'mindful-movement',
  'beginner',
  20,
  ARRAY['legs', 'mind'],
  ARRAY['none'],
  ARRAY['nature', 'virtual walk', 'meditation'],
  ARRAY['Reduces stress hormones', 'Connects with nature', 'Improves mood', 'Provides mental escape'],
  false
),
(
  '5-Minute Quick Energy Burst',
  'Super quick workout for when you need an immediate mood lift and energy boost.',
  'L_xrDAtykMM',
  'https://www.youtube.com/watch?v=L_xrDAtykMM',
  'https://img.youtube.com/vi/L_xrDAtykMM/maxresdefault.jpg',
  'quick-energy',
  'beginner',
  5,
  ARRAY['full body', 'cardiovascular'],
  ARRAY['none'],
  ARRAY['quick workout', 'energy boost', 'mood lift'],
  ARRAY['Instant mood improvement', 'Quick energy boost', 'Reduces lethargy', 'Builds momentum'],
  false
),
(
  '25-Minute Yoga for Emotional Release',
  'Longer yoga practice designed to help process and release difficult emotions during recovery.',
  'Yz9OQj7FgYY',
  'https://www.youtube.com/watch?v=Yz9OQj7FgYY',
  'https://img.youtube.com/vi/Yz9OQj7FgYY/maxresdefault.jpg',
  'stress-relief',
  'intermediate',
  25,
  ARRAY['full body', 'spine', 'hips'],
  ARRAY['yoga mat'],
  ARRAY['emotional release', 'trauma informed', 'healing'],
  ARRAY['Helps process emotions', 'Releases stored tension', 'Promotes healing', 'Supports emotional recovery'],
  true
)
ON CONFLICT DO NOTHING;

-- Create updated_at trigger for exercise_videos
CREATE TRIGGER set_timestamp_exercise_videos
  BEFORE UPDATE ON exercise_videos
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();
