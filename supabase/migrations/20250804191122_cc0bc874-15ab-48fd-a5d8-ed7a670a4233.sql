-- Recreate all RLS policies for posts table
CREATE POLICY "Posts are viewable by everyone or owners" ON public.posts
  FOR SELECT USING (visibility = 'public' OR auth.uid() = author_id);

CREATE POLICY "Users can create their own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts or admins can delete any" ON public.posts
  FOR DELETE USING (author_id = auth.uid() OR is_user_admin(auth.uid()));

-- Recreate all RLS policies for comments table
CREATE POLICY "Comments are viewable by everyone" ON public.comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id 
      AND posts.visibility = 'public'
    ) OR 
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id 
      AND posts.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments or admins can delete any" ON public.comments
  FOR DELETE USING (author_id = auth.uid() OR is_user_admin(auth.uid()));

-- Recreate all RLS policies for community_posts table
CREATE POLICY "Community members can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND (
      EXISTS (
        SELECT 1 FROM community_memberships cm
        WHERE cm.community_id = community_posts.community_id 
        AND cm.user_id = auth.uid() 
        AND cm.status = 'approved'
      ) OR 
      EXISTS (
        SELECT 1 FROM communities c
        WHERE c.id = community_posts.community_id 
        AND c.created_by = auth.uid()
      )
    )
  );

CREATE POLICY "Authors can update their own posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors and community admins can delete posts" ON public.community_posts
  FOR DELETE USING (
    auth.uid() = author_id OR 
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_posts.community_id 
      AND c.created_by = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM community_memberships cm
      WHERE cm.community_id = community_posts.community_id 
      AND cm.user_id = auth.uid() 
      AND cm.role = 'admin'
    )
  );