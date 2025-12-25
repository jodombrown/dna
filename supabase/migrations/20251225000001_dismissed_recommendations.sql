-- Add dismissed recommendations functionality for ADIN Phase 2 completion
-- Allows users to dismiss connection recommendations they're not interested in

-- 1. Create dismissed_recommendations table
CREATE TABLE IF NOT EXISTS public.dismissed_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dismissed_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, dismissed_user_id)
);

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_dismissed_recommendations_user_id
  ON public.dismissed_recommendations(user_id);

-- Enable RLS
ALTER TABLE public.dismissed_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only manage their own dismissals
CREATE POLICY "Users can view their own dismissals"
  ON public.dismissed_recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dismissals"
  ON public.dismissed_recommendations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dismissals"
  ON public.dismissed_recommendations
  FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Create RPC functions for dismiss/undismiss
CREATE OR REPLACE FUNCTION public.dismiss_recommendation(p_dismissed_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.dismissed_recommendations (user_id, dismissed_user_id)
  VALUES (auth.uid(), p_dismissed_user_id)
  ON CONFLICT (user_id, dismissed_user_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.undismiss_recommendation(p_dismissed_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.dismissed_recommendations
  WHERE user_id = auth.uid() AND dismissed_user_id = p_dismissed_user_id;
END;
$$;

-- 3. Update find_adin_matches to exclude dismissed users
CREATE OR REPLACE FUNCTION public.find_adin_matches(target_user_id uuid)
RETURNS TABLE(matched_user_id uuid, match_score numeric, match_reason text, shared_regions text[], shared_sectors text[])
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
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
    -- Exclude dismissed recommendations
    AND NOT EXISTS (
      SELECT 1 FROM dismissed_recommendations dr
      WHERE dr.user_id = target_user_id AND dr.dismissed_user_id = ap.id
    )
    -- Exclude blocked users
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users bu
      WHERE (bu.blocker_id = target_user_id AND bu.blocked_id = ap.id)
         OR (bu.blocker_id = ap.id AND bu.blocked_id = target_user_id)
    )
    -- Exclude existing connections
    AND NOT EXISTS (
      SELECT 1 FROM connections c
      WHERE ((c.requester_id = target_user_id AND c.recipient_id = ap.id)
         OR (c.requester_id = ap.id AND c.recipient_id = target_user_id))
    )
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
  LIMIT 10;
END;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.dismiss_recommendation(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.undismiss_recommendation(UUID) TO authenticated;
