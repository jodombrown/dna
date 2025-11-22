-- Add missing indexes for foreign keys to improve query performance
-- These indexes will speed up joins and foreign key constraint checks

-- ada_cohort_memberships
CREATE INDEX IF NOT EXISTS idx_ada_cohort_memberships_cohort_id 
  ON public.ada_cohort_memberships(cohort_id);

-- event_reminder_logs
CREATE INDEX IF NOT EXISTS idx_event_reminder_logs_notification_id 
  ON public.event_reminder_logs(notification_id);

-- post_comments
CREATE INDEX IF NOT EXISTS idx_post_comments_flagged_by 
  ON public.post_comments(flagged_by);

CREATE INDEX IF NOT EXISTS idx_post_comments_moderated_by 
  ON public.post_comments(moderated_by);

-- posts
CREATE INDEX IF NOT EXISTS idx_posts_flagged_by 
  ON public.posts(flagged_by);

CREATE INDEX IF NOT EXISTS idx_posts_moderated_by 
  ON public.posts(moderated_by);

-- project_contributions
CREATE INDEX IF NOT EXISTS idx_project_contributions_project_id 
  ON public.project_contributions(project_id);

-- regions
CREATE INDEX IF NOT EXISTS idx_regions_continent_id 
  ON public.regions(continent_id);

-- skill_connections
CREATE INDEX IF NOT EXISTS idx_skill_connections_user_b_id 
  ON public.skill_connections(user_b_id);

-- space_tasks
CREATE INDEX IF NOT EXISTS idx_space_tasks_created_by 
  ON public.space_tasks(created_by);

-- space_updates
CREATE INDEX IF NOT EXISTS idx_space_updates_created_by 
  ON public.space_updates(created_by);

-- spaces
CREATE INDEX IF NOT EXISTS idx_spaces_origin_event_id 
  ON public.spaces(origin_event_id);

CREATE INDEX IF NOT EXISTS idx_spaces_origin_group_id 
  ON public.spaces(origin_group_id);

-- user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_granted_by 
  ON public.user_roles(granted_by);