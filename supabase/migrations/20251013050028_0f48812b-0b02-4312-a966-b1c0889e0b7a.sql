-- Fix comment RLS policies - Allow users to read comments
-- Currently users can INSERT and UPDATE their own comments but cannot SELECT any comments

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view comments on posts they can see" ON public.comments;

-- Add policy to allow users to read comments on posts
-- Users can read comments if they can see the post (either public posts or posts from their network)
CREATE POLICY "Users can view comments on visible posts"
ON public.comments
FOR SELECT
USING (
  -- Can see comments on posts that are visible to them
  EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = comments.post_id
    AND (
      -- Own posts
      p.author_id = auth.uid()
      OR
      -- Posts from connections (accepted connections only)
      EXISTS (
        SELECT 1 FROM public.connections c
        WHERE c.status = 'accepted'
        AND (
          (c.a = auth.uid() AND c.b = p.author_id)
          OR
          (c.b = auth.uid() AND c.a = p.author_id)
        )
      )
      OR
      -- Public posts (visibility = 'public')
      p.visibility = 'public'
    )
  )
);

-- Ensure users can delete their own comments
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

CREATE POLICY "Users can delete their own comments"
ON public.comments
FOR DELETE
USING (author_id = auth.uid());