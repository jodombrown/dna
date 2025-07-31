-- Enhance ADIN tables for the new intelligence features

-- Update adin_profiles to include admin notes
ALTER TABLE public.adin_profiles 
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update adin_signals to support the new signal authoring features
ALTER TABLE public.adin_signals 
ADD COLUMN IF NOT EXISTS region_focus TEXT[],
ADD COLUMN IF NOT EXISTS sector_focus TEXT[],
ADD COLUMN IF NOT EXISTS link TEXT,
ADD COLUMN IF NOT EXISTS cta TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Create adin_connection_matches table for storing matchmaking results
CREATE TABLE IF NOT EXISTS public.adin_connection_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  matched_user_id UUID NOT NULL,
  match_score DECIMAL DEFAULT 0,
  match_reason TEXT,
  shared_regions TEXT[],
  shared_sectors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, matched_user_id)
);

-- Enable RLS on new table
ALTER TABLE public.adin_connection_matches ENABLE ROW LEVEL SECURITY;

-- RLS policies for connection matches
CREATE POLICY "Users can view their own matches"
ON public.adin_connection_matches
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create matches"
ON public.adin_connection_matches
FOR INSERT
WITH CHECK (true);

-- Function to calculate match score between two users
CREATE OR REPLACE FUNCTION calculate_match_score(
  user1_regions TEXT[],
  user1_sectors TEXT[],
  user2_regions TEXT[],
  user2_sectors TEXT[]
) RETURNS DECIMAL AS $$
DECLARE
  region_overlap INTEGER;
  sector_overlap INTEGER;
  total_score DECIMAL := 0;
BEGIN
  -- Calculate region overlap
  SELECT array_length(ARRAY(
    SELECT unnest(user1_regions) 
    INTERSECT 
    SELECT unnest(user2_regions)
  ), 1) INTO region_overlap;
  
  -- Calculate sector overlap
  SELECT array_length(ARRAY(
    SELECT unnest(user1_sectors) 
    INTERSECT 
    SELECT unnest(user2_sectors)
  ), 1) INTO sector_overlap;
  
  -- Weight regions and sectors
  total_score := COALESCE(region_overlap, 0) * 0.4 + COALESCE(sector_overlap, 0) * 0.6;
  
  RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Function to find matches for a user
CREATE OR REPLACE FUNCTION find_adin_matches(target_user_id UUID)
RETURNS TABLE(
  matched_user_id UUID,
  match_score DECIMAL,
  match_reason TEXT,
  shared_regions TEXT[],
  shared_sectors TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH user_profile AS (
    SELECT region_focus, sector_focus 
    FROM adin_profiles 
    WHERE id = target_user_id
  ),
  potential_matches AS (
    SELECT 
      ap.id as matched_id,
      ap.region_focus,
      ap.sector_focus,
      calculate_match_score(
        up.region_focus, up.sector_focus,
        ap.region_focus, ap.sector_focus
      ) as score
    FROM adin_profiles ap, user_profile up
    WHERE ap.id != target_user_id 
    AND ap.region_focus IS NOT NULL 
    AND ap.sector_focus IS NOT NULL
    AND calculate_match_score(
      up.region_focus, up.sector_focus,
      ap.region_focus, ap.sector_focus
    ) > 0
  )
  SELECT 
    pm.matched_id,
    pm.score,
    CASE 
      WHEN pm.score >= 2 THEN 'Strong alignment in focus areas'
      WHEN pm.score >= 1 THEN 'Good potential for collaboration'
      ELSE 'Some shared interests'
    END as reason,
    ARRAY(
      SELECT unnest(up.region_focus) 
      INTERSECT 
      SELECT unnest(pm.region_focus)
    ) as regions,
    ARRAY(
      SELECT unnest(up.sector_focus) 
      INTERSECT 
      SELECT unnest(pm.sector_focus)
    ) as sectors
  FROM potential_matches pm, user_profile up
  ORDER BY pm.score DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_adin_profiles_region_focus ON adin_profiles USING GIN(region_focus);
CREATE INDEX IF NOT EXISTS idx_adin_profiles_sector_focus ON adin_profiles USING GIN(sector_focus);
CREATE INDEX IF NOT EXISTS idx_adin_signals_region_focus ON adin_signals USING GIN(region_focus);
CREATE INDEX IF NOT EXISTS idx_adin_signals_sector_focus ON adin_signals USING GIN(sector_focus);