-- Addiction Control App Database Schema
-- Run this in your Supabase SQL Editor

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  target_frequency integer DEFAULT 1,
  color text DEFAULT '#3B82F6',
  is_positive boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create habit_logs table
CREATE TABLE IF NOT EXISTS habit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id uuid REFERENCES habits(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  completed boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  icon text,
  earned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  category text DEFAULT 'general'
);

-- Create emergency_resources table
CREATE TABLE IF NOT EXISTS emergency_resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  phone text,
  website text,
  category text NOT NULL,
  is_crisis boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create community_messages table
CREATE TABLE IF NOT EXISTS community_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_anonymous boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name text,
  avatar_url text,
  bio text,
  streak_count integer DEFAULT 0,
  total_points integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert some default emergency resources
INSERT INTO emergency_resources (title, description, phone, website, category, is_crisis) VALUES
('National Suicide Prevention Lifeline', 'Free and confidential emotional support 24/7', '988', 'https://suicidepreventionlifeline.org/', 'crisis', true),
('Crisis Text Line', 'Text HOME to 741741 for crisis support', '741741', 'https://www.crisistextline.org/', 'crisis', true),
('SAMHSA National Helpline', 'Treatment referral and information service', '1-800-662-4357', 'https://www.samhsa.gov/', 'treatment', false),
('Alcoholics Anonymous', 'Support group for alcohol addiction recovery', null, 'https://www.aa.org/', 'support', false),
('Narcotics Anonymous', 'Support group for drug addiction recovery', null, 'https://www.na.org/', 'support', false),
('Smart Recovery', 'Self-management and recovery training', null, 'https://www.smartrecovery.org/', 'support', false);

-- Enable Row Level Security (RLS)
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

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

-- Badges policies
CREATE POLICY "Users can view own badges" ON badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Community messages policies
CREATE POLICY "Users can view all community messages" ON community_messages FOR SELECT TO authenticated;
CREATE POLICY "Users can insert own community messages" ON community_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own community messages" ON community_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own community messages" ON community_messages FOR DELETE USING (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT TO authenticated;
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Emergency resources are public (no RLS needed)
ALTER TABLE emergency_resources DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits(user_id);
CREATE INDEX IF NOT EXISTS habit_logs_habit_id_idx ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS habit_logs_user_id_idx ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS habit_logs_date_idx ON habit_logs(date);
CREATE INDEX IF NOT EXISTS badges_user_id_idx ON badges(user_id);
CREATE INDEX IF NOT EXISTS community_messages_created_at_idx ON community_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS emergency_resources_category_idx ON emergency_resources(category);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_messages_updated_at BEFORE UPDATE ON community_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
