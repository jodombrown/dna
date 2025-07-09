-- Create user_dna_points table
CREATE TABLE public.user_dna_points (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  connect_score INTEGER NOT NULL DEFAULT 0,
  collaborate_score INTEGER NOT NULL DEFAULT 0,
  contribute_score INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER GENERATED ALWAYS AS (connect_score + collaborate_score + contribute_score) STORED,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, badge_type)
);

-- Create leaderboard_cache table for performance
CREATE TABLE public.leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_type TEXT NOT NULL, -- 'connect', 'collaborate', 'contribute', 'total'
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  country TEXT,
  sector TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(leaderboard_type, user_id, country, sector)
);

-- Enable RLS
ALTER TABLE public.user_dna_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_dna_points
CREATE POLICY "Users can view DNA points" ON public.user_dna_points
  FOR SELECT USING (true); -- Everyone can see points for gamification

CREATE POLICY "Users can update their own points" ON public.user_dna_points
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert DNA points" ON public.user_dna_points
  FOR INSERT WITH CHECK (true);

-- RLS Policies for user_badges
CREATE POLICY "Users can view badges" ON public.user_badges
  FOR SELECT USING (true); -- Everyone can see badges

CREATE POLICY "System can create badges" ON public.user_badges
  FOR INSERT WITH CHECK (true);

-- RLS Policies for leaderboard_cache
CREATE POLICY "Anyone can view leaderboards" ON public.leaderboard_cache
  FOR SELECT USING (true);

CREATE POLICY "System can manage leaderboard cache" ON public.leaderboard_cache
  FOR ALL USING (true);

-- Function to update DNA points
CREATE OR REPLACE FUNCTION public.update_dna_points(
  target_user_id UUID,
  pillar TEXT, -- 'connect', 'collaborate', 'contribute'
  points INTEGER DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_dna_points (user_id, connect_score, collaborate_score, contribute_score)
  VALUES (
    target_user_id,
    CASE WHEN pillar = 'connect' THEN points ELSE 0 END,
    CASE WHEN pillar = 'collaborate' THEN points ELSE 0 END,
    CASE WHEN pillar = 'contribute' THEN points ELSE 0 END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    connect_score = user_dna_points.connect_score + CASE WHEN pillar = 'connect' THEN points ELSE 0 END,
    collaborate_score = user_dna_points.collaborate_score + CASE WHEN pillar = 'collaborate' THEN points ELSE 0 END,
    contribute_score = user_dna_points.contribute_score + CASE WHEN pillar = 'contribute' THEN points ELSE 0 END,
    last_updated = now();
    
  -- Check for badge unlocks after updating points
  PERFORM public.check_badge_unlocks(target_user_id);
END;
$$;

-- Function to check and unlock badges
CREATE OR REPLACE FUNCTION public.check_badge_unlocks(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_points RECORD;
  connection_count INTEGER;
  post_count INTEGER;
  opportunity_count INTEGER;
BEGIN
  -- Get user's current points
  SELECT * INTO user_points FROM public.user_dna_points WHERE user_id = target_user_id;
  
  IF user_points IS NULL THEN
    RETURN;
  END IF;

  -- Get additional stats for badge criteria
  SELECT COUNT(*) INTO connection_count FROM public.contact_requests 
  WHERE sender_id = target_user_id AND status = 'accepted';
  
  SELECT COUNT(*) INTO post_count FROM public.posts WHERE author_id = target_user_id;
  
  SELECT COUNT(*) INTO opportunity_count FROM public.opportunities WHERE created_by = target_user_id;

  -- First Collab badge (first collaboration action)
  IF user_points.collaborate_score >= 1 THEN
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, description, icon)
    VALUES (target_user_id, 'first_collab', 'First Collaboration', 'Completed your first collaboration', '🤝')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- 10 Connections badge
  IF connection_count >= 10 THEN
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, description, icon)
    VALUES (target_user_id, '10_connections', 'Super Connector', 'Made 10 meaningful connections', '🌐')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- First Opportunity Posted badge
  IF opportunity_count >= 1 THEN
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, description, icon)
    VALUES (target_user_id, 'first_opportunity', 'Opportunity Creator', 'Posted your first opportunity', '💡')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Community Builder badge (high connect score)
  IF user_points.connect_score >= 100 THEN
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, description, icon)
    VALUES (target_user_id, 'community_builder', 'Community Builder', 'Built strong community connections', '🏗️')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Community Hero badge (total score > 1000 and verified contributor)
  IF user_points.total_score >= 1000 AND EXISTS(
    SELECT 1 FROM public.user_adin_profile 
    WHERE user_id = target_user_id AND is_verified_contributor = true
  ) THEN
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, description, icon)
    VALUES (target_user_id, 'community_hero', 'Community Hero', 'Verified contributor with exceptional impact', '🏆')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
END;
$$;

-- Function to get leaderboard data
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  board_type TEXT DEFAULT 'total',
  country_filter TEXT DEFAULT NULL,
  sector_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE(
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  score INTEGER,
  rank INTEGER,
  location TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.score,
    ROW_NUMBER() OVER (ORDER BY p.score DESC)::INTEGER as rank,
    prof.full_name,
    prof.avatar_url,
    prof.location
  FROM (
    SELECT 
      dp.user_id,
      CASE 
        WHEN board_type = 'connect' THEN dp.connect_score
        WHEN board_type = 'collaborate' THEN dp.collaborate_score
        WHEN board_type = 'contribute' THEN dp.contribute_score
        ELSE dp.total_score
      END as score
    FROM public.user_dna_points dp
    WHERE dp.total_score > 0
  ) p
  LEFT JOIN public.profiles prof ON prof.id = p.user_id
  WHERE 
    (country_filter IS NULL OR prof.location ILIKE '%' || country_filter || '%')
    AND (sector_filter IS NULL OR prof.industry = sector_filter)
    AND prof.is_public = true
  ORDER BY p.score DESC
  LIMIT limit_count;
END;
$$;

-- Create trigger to update DNA points when impact_log is created
CREATE OR REPLACE FUNCTION public.sync_dna_points_from_impact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update DNA points based on impact log entry
  IF NEW.pillar IS NOT NULL AND NEW.points > 0 THEN
    PERFORM public.update_dna_points(NEW.user_id, NEW.pillar, NEW.points);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_dna_points_trigger
  AFTER INSERT ON public.impact_log
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_dna_points_from_impact();

-- Create indexes for performance
CREATE INDEX idx_user_dna_points_total_score ON public.user_dna_points(total_score DESC);
CREATE INDEX idx_user_dna_points_pillars ON public.user_dna_points(connect_score DESC, collaborate_score DESC, contribute_score DESC);
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_leaderboard_cache_type_score ON public.leaderboard_cache(leaderboard_type, score DESC);