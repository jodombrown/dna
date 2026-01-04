-- Fix multiple permissive policies by restricting admin policies to non-SELECT operations

-- Drop and recreate releases policies
DROP POLICY IF EXISTS "releases_admin_manage" ON public.releases;

CREATE POLICY "releases_admin_insert" ON public.releases
  FOR INSERT WITH CHECK (
    (select auth.uid()) IN (SELECT id FROM profiles WHERE 'admin' = ANY(roles))
  );

CREATE POLICY "releases_admin_update" ON public.releases
  FOR UPDATE USING (
    (select auth.uid()) IN (SELECT id FROM profiles WHERE 'admin' = ANY(roles))
  );

CREATE POLICY "releases_admin_delete" ON public.releases
  FOR DELETE USING (
    (select auth.uid()) IN (SELECT id FROM profiles WHERE 'admin' = ANY(roles))
  );

-- Drop and recreate release_features policies
DROP POLICY IF EXISTS "release_features_admin_manage" ON public.release_features;

CREATE POLICY "release_features_admin_insert" ON public.release_features
  FOR INSERT WITH CHECK (
    (select auth.uid()) IN (SELECT id FROM profiles WHERE 'admin' = ANY(roles))
  );

CREATE POLICY "release_features_admin_update" ON public.release_features
  FOR UPDATE USING (
    (select auth.uid()) IN (SELECT id FROM profiles WHERE 'admin' = ANY(roles))
  );

CREATE POLICY "release_features_admin_delete" ON public.release_features
  FOR DELETE USING (
    (select auth.uid()) IN (SELECT id FROM profiles WHERE 'admin' = ANY(roles))
  );