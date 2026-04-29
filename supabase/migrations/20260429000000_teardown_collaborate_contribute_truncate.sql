-- ============================================================
-- Phase 2 Teardown — TRUNCATE COLLABORATE & CONTRIBUTE families
-- ============================================================
-- Removes all row data for spaces/opportunities and their child tables
-- while preserving:
--   * table definitions (no DROP)
--   * UUID primary key types on spaces, collaboration_spaces, opportunities
--   * RLS policies on every table
--   * the dormant trigger network:
--       trg_auto_create_space_channel
--       trg_auto_create_collab_space_channel
--       trg_space_member_join_channel
--       trg_auto_create_opportunity_thread
--       add_creator_as_member
--   * messages.entity_id / entity_type
--   * posts.space_id / posts.linked_entity_type
-- The Phase 3 rebuild will repopulate these tables.
-- ============================================================

BEGIN;

-- Each table is wrapped in `to_regclass(...) IS NOT NULL` so this migration
-- is safe in environments where some tables haven't been created yet (e.g.
-- branches that diverged before the COLLABORATE/CONTRIBUTE rollouts).
DO $$
DECLARE
  t text;
  truncate_targets text[] := ARRAY[
    -- COLLABORATE family
    'public.spaces',
    'public.space_members',
    'public.space_roles',
    'public.space_templates',
    'public.space_activity_log',
    'public.collaboration_spaces',
    'public.collaboration_memberships',
    'public.collaborate_tasks',
    'public.collaborate_nudges',
    'public.initiatives',
    'public.milestones',
    -- CONTRIBUTE family
    'public.opportunities',
    'public.applications',
    'public.opportunity_applications',
    'public.contribution_needs',
    'public.contribution_offers',
    'public.contribution_fulfillments',
    'public.contribution_acknowledgments',
    'public.contribution_cards',
    'public.contribution_reports'
  ];
BEGIN
  FOREACH t IN ARRAY truncate_targets LOOP
    IF to_regclass(t) IS NOT NULL THEN
      EXECUTE format('TRUNCATE TABLE %s RESTART IDENTITY CASCADE', t);
    END IF;
  END LOOP;
END $$;

COMMIT;
