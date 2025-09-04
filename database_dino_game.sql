-- Dino Game Leaderboard Database Schema
-- Execute this in your Supabase SQL Editor

-- Create the dino_scores table for the online leaderboard
CREATE TABLE IF NOT EXISTS dino_scores (
  id BIGSERIAL PRIMARY KEY,
  player_name TEXT NOT NULL CHECK (length(player_name) <= 20 AND length(trim(player_name)) > 0),
  score INTEGER NOT NULL CHECK (score >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional metadata
  game_duration INTEGER DEFAULT NULL, -- Game duration in seconds
  obstacles_avoided INTEGER DEFAULT NULL, -- Number of obstacles avoided
  user_agent TEXT DEFAULT NULL, -- Browser info for analytics
  ip_address INET DEFAULT NULL -- IP for duplicate detection (optional)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dino_scores_score ON dino_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_dino_scores_created_at ON dino_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dino_scores_player_name ON dino_scores(player_name);

-- Enable Row Level Security (RLS)
ALTER TABLE dino_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
-- Allow anyone to insert scores (for anonymous gameplay)
CREATE POLICY "Anyone can insert dino scores" 
  ON dino_scores FOR INSERT 
  WITH CHECK (true);

-- Allow anyone to read scores (for leaderboard)
CREATE POLICY "Anyone can read dino scores" 
  ON dino_scores FOR SELECT 
  USING (true);

-- Prevent updates and deletes (scores should be immutable)
CREATE POLICY "No updates allowed" 
  ON dino_scores FOR UPDATE 
  USING (false);

CREATE POLICY "No deletes allowed" 
  ON dino_scores FOR DELETE 
  USING (false);

-- Create a function to get top scores with rank
CREATE OR REPLACE FUNCTION get_dino_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  rank INTEGER,
  player_name TEXT,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  days_ago INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY ds.score DESC, ds.created_at ASC)::INTEGER as rank,
    ds.player_name,
    ds.score,
    ds.created_at,
    (EXTRACT(epoch FROM (NOW() - ds.created_at)) / 86400)::INTEGER as days_ago
  FROM dino_scores ds
  ORDER BY ds.score DESC, ds.created_at ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get player's best score and rank
CREATE OR REPLACE FUNCTION get_player_stats(p_name TEXT)
RETURNS TABLE (
  best_score INTEGER,
  best_rank INTEGER,
  total_games INTEGER,
  average_score NUMERIC,
  first_played TIMESTAMP WITH TIME ZONE,
  last_played TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  WITH player_scores AS (
    SELECT score, created_at
    FROM dino_scores 
    WHERE LOWER(player_name) = LOWER(p_name)
  ),
  player_best AS (
    SELECT MAX(score) as max_score
    FROM player_scores
  ),
  leaderboard_rank AS (
    SELECT COUNT(*) + 1 as rank
    FROM dino_scores 
    WHERE score > (SELECT max_score FROM player_best)
  )
  SELECT 
    pb.max_score::INTEGER,
    lr.rank::INTEGER,
    COUNT(ps.score)::INTEGER,
    AVG(ps.score)::NUMERIC,
    MIN(ps.created_at),
    MAX(ps.created_at)
  FROM player_best pb
  CROSS JOIN leaderboard_rank lr
  LEFT JOIN player_scores ps ON true
  GROUP BY pb.max_score, lr.rank;
END;
$$ LANGUAGE plpgsql;

-- Create a function to clean old scores (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_dino_scores(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Only keep top 1000 scores and recent scores (within days_old)
  WITH scores_to_keep AS (
    SELECT id FROM (
      -- Top 1000 scores of all time
      SELECT id FROM dino_scores ORDER BY score DESC LIMIT 1000
      UNION
      -- All scores from the last X days
      SELECT id FROM dino_scores WHERE created_at > NOW() - INTERVAL '1 day' * days_old
    ) as keeper_ids
  )
  DELETE FROM dino_scores 
  WHERE id NOT IN (SELECT id FROM scores_to_keep);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing (optional)
INSERT INTO dino_scores (player_name, score, created_at) VALUES
('DinoMaster', 2500, NOW() - INTERVAL '1 day'),
('JumpExpert', 2200, NOW() - INTERVAL '2 days'),
('CactusAvoider', 1950, NOW() - INTERVAL '3 days'),
('RecoveryHero', 1800, NOW() - INTERVAL '4 days'),
('PixelJumper', 1650, NOW() - INTERVAL '5 days'),
('GameChamp', 1500, NOW() - INTERVAL '6 days'),
('DinoFan', 1350, NOW() - INTERVAL '7 days'),
('Speedster', 1200, NOW() - INTERVAL '8 days'),
('JumpKing', 1100, NOW() - INTERVAL '9 days'),
('Player1', 1000, NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- Create a view for easy leaderboard access
CREATE OR REPLACE VIEW dino_leaderboard_view AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY score DESC, created_at ASC) as rank,
  player_name,
  score,
  created_at,
  (EXTRACT(epoch FROM (NOW() - created_at)) / 86400)::INTEGER as days_ago
FROM dino_scores
ORDER BY score DESC, created_at ASC;

-- Grant necessary permissions (if using auth)
-- GRANT SELECT, INSERT ON dino_scores TO anon;
-- GRANT SELECT ON dino_leaderboard_view TO anon;
-- GRANT EXECUTE ON FUNCTION get_dino_leaderboard(INTEGER) TO anon;
-- GRANT EXECUTE ON FUNCTION get_player_stats(TEXT) TO anon;

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '🎮 Dino Game database setup completed successfully!';
  RAISE NOTICE '📊 Table created: dino_scores';
  RAISE NOTICE '🏆 Functions created: get_dino_leaderboard(), get_player_stats()';
  RAISE NOTICE '🔒 RLS policies configured for public access';
  RAISE NOTICE '✅ Ready for online Dino Game with leaderboard!';
END $$;
