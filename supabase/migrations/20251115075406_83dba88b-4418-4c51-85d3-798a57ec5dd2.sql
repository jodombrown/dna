-- Fix RLS policies to use (select auth.uid()) for better performance
-- This prevents re-evaluation of auth.uid() for each row

-- Drop and recreate policies for contribution_needs
DROP POLICY IF EXISTS "Users can view needs for accessible spaces" ON public.contribution_needs;
DROP POLICY IF EXISTS "Space leads can create needs" ON public.contribution_needs;
DROP POLICY IF EXISTS "Space leads can update needs" ON public.contribution_needs;
DROP POLICY IF EXISTS "Space leads can delete needs" ON public.contribution_needs;

CREATE POLICY "Users can view needs for accessible spaces"
ON public.contribution_needs
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM spaces s
    WHERE s.id = contribution_needs.space_id
    AND (
      s.visibility = 'public'::text
      OR EXISTS (
        SELECT 1
        FROM space_members sm
        WHERE sm.space_id = s.id
        AND sm.user_id = (SELECT auth.uid())
      )
    )
  )
);

CREATE POLICY "Space leads can create needs"
ON public.contribution_needs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM space_members sm
    WHERE sm.space_id = contribution_needs.space_id
    AND sm.user_id = (SELECT auth.uid())
    AND sm.role = 'lead'::text
  )
  AND created_by = (SELECT auth.uid())
);

CREATE POLICY "Space leads can update needs"
ON public.contribution_needs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM space_members sm
    WHERE sm.space_id = contribution_needs.space_id
    AND sm.user_id = (SELECT auth.uid())
    AND sm.role = 'lead'::text
  )
);

CREATE POLICY "Space leads can delete needs"
ON public.contribution_needs
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM space_members sm
    WHERE sm.space_id = contribution_needs.space_id
    AND sm.user_id = (SELECT auth.uid())
    AND sm.role = 'lead'::text
  )
);

-- Drop and recreate policies for contribution_offers
DROP POLICY IF EXISTS "Users can view their own offers or space leads can view all" ON public.contribution_offers;
DROP POLICY IF EXISTS "Authenticated users can create offers if not blocked" ON public.contribution_offers;
DROP POLICY IF EXISTS "Creators can update pending offers, leads can change status" ON public.contribution_offers;
DROP POLICY IF EXISTS "Creators can delete pending offers" ON public.contribution_offers;

CREATE POLICY "Users can view their own offers or space leads can view all"
ON public.contribution_offers
FOR SELECT
USING (
  created_by = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1
    FROM space_members sm
    WHERE sm.space_id = contribution_offers.space_id
    AND sm.user_id = (SELECT auth.uid())
    AND sm.role = 'lead'::text
  )
);

CREATE POLICY "Authenticated users can create offers if not blocked"
ON public.contribution_offers
FOR INSERT
WITH CHECK (
  (SELECT auth.uid()) IS NOT NULL
  AND created_by = (SELECT auth.uid())
  AND NOT is_blocked_from_space((SELECT auth.uid()), space_id)
);

CREATE POLICY "Creators can update pending offers, leads can change status"
ON public.contribution_offers
FOR UPDATE
USING (
  (created_by = (SELECT auth.uid()) AND status = 'pending'::contribution_offer_status)
  OR EXISTS (
    SELECT 1
    FROM space_members sm
    WHERE sm.space_id = contribution_offers.space_id
    AND sm.user_id = (SELECT auth.uid())
    AND sm.role = 'lead'::text
  )
);

CREATE POLICY "Creators can delete pending offers"
ON public.contribution_offers
FOR DELETE
USING (
  created_by = (SELECT auth.uid())
  AND status = 'pending'::contribution_offer_status
);

-- Drop duplicate indexes on blocked_users
DROP INDEX IF EXISTS idx_blocked_users_blocked;
DROP INDEX IF EXISTS idx_blocked_users_blocker;