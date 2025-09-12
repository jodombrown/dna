-- Ensure proper permissions for the post creation function
REVOKE ALL ON FUNCTION public.rpc_create_post(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_create_post(jsonb) TO authenticated;

-- Also ensure the posts table has proper RLS policies enabled
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create/update RLS policies for posts
DROP POLICY IF EXISTS "posts_read_policy" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_policy" ON public.posts;
DROP POLICY IF EXISTS "posts_update_policy" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_policy" ON public.posts;

-- Allow reading public posts
CREATE POLICY "posts_read_policy" ON public.posts
  FOR SELECT 
  USING (visibility = 'public' OR author_id = auth.uid());

-- Allow authenticated users to create their own posts
CREATE POLICY "posts_insert_policy" ON public.posts
  FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

-- Allow users to update their own posts
CREATE POLICY "posts_update_policy" ON public.posts
  FOR UPDATE 
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Allow users to delete their own posts or admins to delete any
CREATE POLICY "posts_delete_policy" ON public.posts
  FOR DELETE 
  USING (auth.uid() = author_id OR is_admin_user(auth.uid()));