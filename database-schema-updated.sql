-- Updated Database Schema for Addiction Control App
-- This schema matches the current application code
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist (be careful in production!)
-- DROP TABLE IF EXISTS habit_logs CASCADE;
-- DROP TABLE IF EXISTS habits CASCADE;
-- DROP TABLE IF EXISTS user_badges CASCADE;
-- DROP TABLE IF EXISTS badges CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DROP TABLE IF EXISTS resources CASCADE;
-- DROP TABLE IF EXISTS messages CASCADE;

-- Create profiles table (referenced by other tables)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  username text,
  avatar_url text,
  bio text,
  streak_count integer DEFAULT 0,
  total_points integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text DEFAULT 'general',
  target_frequency integer DEFAULT 1,
  color text DEFAULT '#3B82F6',
  is_positive boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create habit_logs table (updated to match code expectations)
CREATE TABLE IF NOT EXISTS habit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id uuid REFERENCES habits(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  value integer DEFAULT 0, -- Changed from 'completed boolean' to 'value integer'
  note text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(habit_id, date) -- Prevent duplicate entries for same habit on same date
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text,
  category text DEFAULT 'general',
  points_required integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_badges table (junction table)
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, badge_id) -- Prevent duplicate badge awards
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  content text,
  url text,
  category text NOT NULL,
  tags text[],
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create messages table (for community chat)
CREATE TABLE IF NOT EXISTS messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  room text DEFAULT 'general',
  is_anonymous boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now') NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create daily_goals table (for tracking daily objectives)
CREATE TABLE IF NOT EXISTS daily_goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  goal text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, date, goal) -- Prevent duplicate goals for same user on same date
);

-- Insert default badges
INSERT INTO badges (name, description, icon, category, points_required) VALUES
('First Step', 'Completed your first habit log', '🎯', 'milestone', 1),
('Week Warrior', 'Maintained a habit for 7 consecutive days', '🔥', 'streak', 7),
('Month Master', 'Maintained a habit for 30 consecutive days', '👑', 'streak', 30),
('Century Champion', 'Maintained a habit for 100 consecutive days', '💎', 'streak', 100),
('Dedicated Starter', 'Logged habits for 10 total days', '⭐', 'persistence', 10),
('Persistent Fighter', 'Logged habits for 50 total days', '🏆', 'persistence', 50),
('Year Long Warrior', 'Logged habits for 365 total days', '🥇', 'persistence', 365)
ON CONFLICT DO NOTHING;

-- Insert sample resources
INSERT INTO resources (title, description, content, category, is_featured) VALUES
('Deep Breathing Exercise', 'Simple 4-7-8 breathing technique for anxiety relief', 'Inhale for 4 counts, hold for 7 counts, exhale for 8 counts. Repeat 4 times.', 'breathing', true),
('Progressive Muscle Relaxation', 'Systematic tension and relaxation of muscle groups', 'Start with your toes and work your way up, tensing each muscle group for 5 seconds then releasing.', 'relaxation', true),
('Mindfulness Meditation', '5-minute guided mindfulness practice', 'Sit comfortably, focus on your breath, and observe thoughts without judgment.', 'meditation', true),
('Crisis Hotlines', 'Emergency contact numbers for immediate help', 'National Suicide Prevention Lifeline: 988\nCrisis Text Line: Text HOME to 741741', 'emergency', true)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Habits policies
CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (auth.uid() = user_id);

-- Habit logs policies
CREATE POLICY "Users can view own habit logs" ON habit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habit logs" ON habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habit logs" ON habit_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habit logs" ON habit_logs FOR DELETE USING (auth.uid() = user_id);

-- User badges policies
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages policies (community chat)
CREATE POLICY "Users can view all messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Users can insert own messages" ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON messages FOR DELETE USING (auth.uid() = user_id);

-- Daily goals policies
CREATE POLICY "Users can view own daily goals" ON daily_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily goals" ON daily_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily goals" ON daily_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily goals" ON daily_goals FOR DELETE USING (auth.uid() = user_id);

-- Public policies for resources and badges (read-only)
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view resources" ON resources FOR SELECT USING (true);
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER set_timestamp_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_habits
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_resources
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_messages
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_daily_goals
  BEFORE UPDATE ON daily_goals
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();
