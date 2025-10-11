-- Consolidate remaining duplicate policies (corrected)

-- 1. opportunities table - merge INSERT policies
DROP POLICY IF EXISTS "Users can create their own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "opps_create" ON public.opportunities;
CREATE POLICY "opportunities_insert" ON public.opportunities
  FOR INSERT WITH CHECK (
    (SELECT auth.uid()) = created_by
  );

-- 2. opportunities table - merge SELECT policies
DROP POLICY IF EXISTS "Active public opportunities are viewable by everyone" ON public.opportunities;
DROP POLICY IF EXISTS "opps_view" ON public.opportunities;
CREATE POLICY "opportunities_select" ON public.opportunities
  FOR SELECT USING (
    status = 'active' AND visibility = 'public'
  );

-- 3. opportunities table - merge UPDATE policies
DROP POLICY IF EXISTS "Creators or space admins can update opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "opps_update" ON public.opportunities;
CREATE POLICY "opportunities_update" ON public.opportunities
  FOR UPDATE USING (
    (SELECT auth.uid()) = created_by OR
    (space_id IS NOT NULL AND is_member_of_space(space_id, (SELECT auth.uid()), ARRAY['owner', 'admin'], true))
  );

-- 4. profiles table - merge SELECT policies
DROP POLICY IF EXISTS "Public can view limited profile data" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles with privacy controls" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (
    (SELECT auth.uid()) = id OR
    is_public = true
  );

-- 5. feature_flags table - merge SELECT policies (corrected column name)
DROP POLICY IF EXISTS "Admins manage feature flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Users can view active flags" ON public.feature_flags;
CREATE POLICY "feature_flags_select" ON public.feature_flags
  FOR SELECT USING (
    has_role((SELECT auth.uid()), 'admin'::app_role) OR
    is_enabled = true
  );