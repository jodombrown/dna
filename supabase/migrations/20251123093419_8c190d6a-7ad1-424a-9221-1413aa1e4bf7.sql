-- DNA | FEED INTERACTION FIXES v1.1
-- Fix post_bookmarks RLS to allow viewing bookmark existence (for counts)

-- Allow users to see if ANY post has bookmarks (needed for bookmark_count)
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.post_bookmarks;

CREATE POLICY "Users can view all post bookmarks"
  ON public.post_bookmarks
  FOR SELECT
  USING (true);

-- Keep insert and delete policies as-is (they're correct)