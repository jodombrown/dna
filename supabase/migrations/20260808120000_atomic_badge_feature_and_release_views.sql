-- =============================================
-- Second audit pass: two more read-then-write TOCTOU counters
-- =============================================

-- toggleBadgeFeatured (src/services/badge-service.ts) read the current
-- featured count, then issued a separate UPDATE if the stale count was
-- under the 3-max limit — two concurrent "feature" clicks (double-click,
-- two tabs) can both read count=2 and both proceed, landing on 4+
-- featured badges. Do the count-check and the update in one statement.
CREATE OR REPLACE FUNCTION public.set_badge_featured(
  p_user_id UUID,
  p_user_badge_id UUID,
  p_featured BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated BOOLEAN := false;
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_featured THEN
    UPDATE public.user_badges
    SET is_featured = true
    WHERE id = p_user_badge_id
      AND user_id = p_user_id
      AND (
        SELECT count(*) FROM public.user_badges
        WHERE user_id = p_user_id AND is_featured = true
      ) < 3;
    v_updated := FOUND;
  ELSE
    UPDATE public.user_badges
    SET is_featured = false
    WHERE id = p_user_badge_id
      AND user_id = p_user_id;
    v_updated := FOUND;
  END IF;

  RETURN v_updated;
END;
$$;

REVOKE ALL ON FUNCTION public.set_badge_featured(UUID, UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_badge_featured(UUID, UUID, BOOLEAN) TO authenticated;

-- useRelease (src/hooks/useReleases.ts), on the live /releases/:slug route,
-- read view_count in the same SELECT then wrote back stale_value + 1 —
-- concurrent viewers reading the same stale count lose increments under
-- load. A single UPDATE ... SET view_count = view_count + 1 is atomic.
CREATE OR REPLACE FUNCTION public.increment_release_view_count(p_release_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.releases
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = p_release_id;
$$;

REVOKE ALL ON FUNCTION public.increment_release_view_count(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_release_view_count(UUID) TO authenticated, anon;
