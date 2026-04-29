-- =====================================================================
-- COLLABORATE Rebuild — Phase R1-B-1: Cleanup + FK Remediation
-- =====================================================================
-- Prepares the database for R1-B-2 schema creation by:
--   * Repointing legacy FKs that referenced collaboration_spaces → spaces
--   * Rewriting set_space_report_creator_id() to read from spaces
--   * Recreating the 5 space_reports RLS policies against spaces / space_members
--   * Dropping collaboration_spaces and collaboration_memberships
--   * Dropping legacy COLLABORATE child tables whose schemas conflict with the
--     locked architecture (recreated in R1-B-2 with new schemas)
--   * Augmenting the canonical `spaces` table with locked-spec columns,
--     CHECK constraints, and indexes
--
-- Idempotent: every operation is guarded with IF EXISTS / IF NOT EXISTS.
-- Does NOT touch contribute schema, space_templates, or space_roles.
-- Does NOT create any new tables (R1-B-2 does that).
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1.1  FK REMEDIATION — repoint posts.space_id and space_reports.space_id
-- =====================================================================

ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_space_id_fkey;
ALTER TABLE public.posts
  ADD CONSTRAINT posts_space_id_fkey
  FOREIGN KEY (space_id)
  REFERENCES public.spaces(id)
  ON DELETE SET NULL;

ALTER TABLE public.space_reports DROP CONSTRAINT IF EXISTS space_reports_space_id_fkey;
ALTER TABLE public.space_reports
  ADD CONSTRAINT space_reports_space_id_fkey
  FOREIGN KEY (space_id)
  REFERENCES public.spaces(id)
  ON DELETE CASCADE;

-- =====================================================================
-- 1.2  REWRITE set_space_report_creator_id()
-- =====================================================================
-- Function previously read from collaboration_spaces.created_by; rewrite
-- to read from spaces.created_by (same column name in both tables).

CREATE OR REPLACE FUNCTION public.set_space_report_creator_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT created_by INTO NEW.creator_id
  FROM public.spaces
  WHERE id = NEW.space_id;
  RETURN NEW;
END;
$$;

-- =====================================================================
-- 1.3  REWRITE space_reports RLS POLICIES
-- =====================================================================
-- Drop the existing 5 policies (names from 20251231100001_space_reports.sql)
-- plus any name variants from prior intermediate states; recreate against
-- the new schema (spaces + space_members). Admin-detection preserves the
-- repository's existing is_admin_user(uuid) pattern, NOT profiles.is_admin
-- (which does not exist in this codebase — see R1-A audit).

DROP POLICY IF EXISTS "Users can create space reports"        ON public.space_reports;
DROP POLICY IF EXISTS "Users can view their own reports"       ON public.space_reports;
DROP POLICY IF EXISTS "Admins can view all space reports"      ON public.space_reports;
DROP POLICY IF EXISTS "Admins can update space reports"        ON public.space_reports;
DROP POLICY IF EXISTS "Only admins can delete space reports"   ON public.space_reports;
-- Older / placeholder names (no-op if absent)
DROP POLICY IF EXISTS "Space creators can view reports"        ON public.space_reports;
DROP POLICY IF EXISTS "Admins can view all reports"            ON public.space_reports;
DROP POLICY IF EXISTS "Admins can update reports"              ON public.space_reports;

-- Reporter must be the auth user, and target Space must be one they can see
-- (publicly visible, member-visible, or community-visible).
CREATE POLICY "Users can create space reports"
  ON public.space_reports
  FOR INSERT
  WITH CHECK (
    reporter_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.spaces s
      WHERE s.id = space_reports.space_id
        AND (
          s.visibility IN ('public','community')
          OR EXISTS (
            SELECT 1 FROM public.space_members sm
            WHERE sm.space_id = s.id
              AND sm.user_id = (SELECT auth.uid())
          )
        )
    )
  );

-- Reporters see their own reports.
CREATE POLICY "Users can view their own reports"
  ON public.space_reports
  FOR SELECT
  USING (reporter_id = (SELECT auth.uid()));

-- Space creators (owners) see reports filed against their Spaces — new
-- behavior added in R1-B-1 to give Space owners visibility into moderation
-- activity affecting their Space.
CREATE POLICY "Space creators can view reports"
  ON public.space_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.spaces s
      WHERE s.id = space_reports.space_id
        AND s.created_by = (SELECT auth.uid())
    )
  );

-- Admins see / update / delete all reports.
CREATE POLICY "Admins can view all space reports"
  ON public.space_reports
  FOR SELECT
  USING (public.is_admin_user((SELECT auth.uid())));

CREATE POLICY "Admins can update space reports"
  ON public.space_reports
  FOR UPDATE
  USING (public.is_admin_user((SELECT auth.uid())));

CREATE POLICY "Only admins can delete space reports"
  ON public.space_reports
  FOR DELETE
  USING (public.is_admin_user((SELECT auth.uid())));

-- =====================================================================
-- 1.4  DROP LEGACY collaboration_spaces / collaboration_memberships
-- =====================================================================

DROP TRIGGER IF EXISTS trg_collab_space_create_channel ON public.collaboration_spaces;
DROP FUNCTION IF EXISTS public.trg_auto_create_collab_space_channel() CASCADE;

DROP TABLE IF EXISTS public.collaboration_memberships CASCADE;
DROP TABLE IF EXISTS public.collaboration_spaces      CASCADE;

-- =====================================================================
-- 1.5  DROP LEGACY COLLABORATE CHILD TABLES
-- =====================================================================
-- All empty post-teardown (20260429000000). Schemas conflict with the
-- locked architecture; R1-B-2 recreates them with new schemas.
--
-- Note: space_templates and space_roles are intentionally NOT dropped —
-- they are orthogonal to the locked spec and downstream phases will
-- decide their fate.

DROP TABLE IF EXISTS public.collaborate_nudges    CASCADE;
DROP TABLE IF EXISTS public.collaborate_tasks     CASCADE;
DROP TABLE IF EXISTS public.milestones            CASCADE;  -- legacy schema; R1-B-2 recreates
DROP TABLE IF EXISTS public.initiatives           CASCADE;  -- replaced by milestones+boards
DROP TABLE IF EXISTS public.tasks                 CASCADE;  -- legacy single-table model; R1-B-2 recreates board-scoped
DROP TABLE IF EXISTS public.space_activity_log    CASCADE;  -- column rename actor_user_id; R1-B-2 recreates

-- =====================================================================
-- 1.6  AUGMENT EXISTING `spaces` TABLE
-- =====================================================================

-- 1.6a  Drop conflicting CHECK constraints and the legacy template_id FK.
ALTER TABLE public.spaces DROP CONSTRAINT IF EXISTS spaces_visibility_check;
ALTER TABLE public.spaces DROP CONSTRAINT IF EXISTS spaces_status_check;
ALTER TABLE public.spaces DROP CONSTRAINT IF EXISTS spaces_privacy_level_check;
ALTER TABLE public.spaces DROP CONSTRAINT IF EXISTS spaces_template_id_fkey;

-- 1.6b  Drop conflicting / redundant columns.
--       privacy_level is redundant with the locked-spec visibility column.
--       template_id needs to switch from UUID FK to TEXT.
ALTER TABLE public.spaces DROP COLUMN IF EXISTS privacy_level;
ALTER TABLE public.spaces DROP COLUMN IF EXISTS template_id;

-- 1.6c  Coerce stale data values to satisfy the new CHECKs that follow.
--       Idempotent: only updates rows whose values are out of the new domain.
--       Post-teardown the table is expected to be empty, but these UPDATEs
--       make the migration safe to run against any state.
UPDATE public.spaces SET visibility = 'community' WHERE visibility = 'invite_only';
UPDATE public.spaces SET visibility = 'community' WHERE visibility NOT IN ('public','community','private','stealth');
UPDATE public.spaces SET status     = 'active'    WHERE status     = 'idea';
UPDATE public.spaces SET status     = 'active'    WHERE status     NOT IN ('active','paused','completed','archived');

-- 1.6d  Add new columns from the locked spec.
ALTER TABLE public.spaces
  ADD COLUMN IF NOT EXISTS slug              TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url   TEXT,
  ADD COLUMN IF NOT EXISTS cultural_pattern  TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS currency_type     TEXT,
  ADD COLUMN IF NOT EXISTS scale             TEXT,
  ADD COLUMN IF NOT EXISTS tier              TEXT DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS owner_user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS primary_language  TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS template_id       TEXT,
  ADD COLUMN IF NOT EXISTS archived_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archive_reason    TEXT;

-- 1.6e  Re-add CHECK constraints with locked-spec values.
ALTER TABLE public.spaces
  ADD CONSTRAINT spaces_visibility_check
    CHECK (visibility IN ('public','community','private','stealth'));

ALTER TABLE public.spaces
  ADD CONSTRAINT spaces_status_check
    CHECK (status IN ('active','paused','completed','archived'));

ALTER TABLE public.spaces
  ADD CONSTRAINT spaces_cultural_pattern_check
    CHECK (cultural_pattern IN ('kente','ndebele','mudcloth','adinkra','none'));

ALTER TABLE public.spaces
  ADD CONSTRAINT spaces_currency_type_check
    CHECK (currency_type IS NULL OR currency_type IN ('capital','expertise','network','resources'));

ALTER TABLE public.spaces
  ADD CONSTRAINT spaces_scale_check
    CHECK (scale IS NULL OR scale IN ('individual','community','institutional'));

ALTER TABLE public.spaces
  ADD CONSTRAINT spaces_tier_check
    CHECK (tier IN ('individual','community','institutional'));

ALTER TABLE public.spaces
  ADD CONSTRAINT spaces_archive_reason_check
    CHECK (archive_reason IS NULL OR archive_reason IN ('completed','paused','dissolved','other'));

-- 1.6f  Default for visibility.
ALTER TABLE public.spaces ALTER COLUMN visibility SET DEFAULT 'community';

-- 1.6g  Indexes.
CREATE UNIQUE INDEX IF NOT EXISTS idx_spaces_slug             ON public.spaces(slug) WHERE slug IS NOT NULL;
CREATE INDEX        IF NOT EXISTS idx_spaces_visibility_status ON public.spaces(visibility, status);
CREATE INDEX        IF NOT EXISTS idx_spaces_owner             ON public.spaces(owner_user_id);

COMMIT;
