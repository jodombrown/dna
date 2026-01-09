-- BATCH 2B: INDEXES AND RLS (retry)

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_spaces_privacy ON public.spaces(privacy_level);
CREATE INDEX IF NOT EXISTS idx_space_roles_space ON public.space_roles(space_id);
CREATE INDEX IF NOT EXISTS idx_initiatives_space ON public.initiatives(space_id);
CREATE INDEX IF NOT EXISTS idx_initiatives_status ON public.initiatives(status);
CREATE INDEX IF NOT EXISTS idx_milestones_initiative ON public.milestones(initiative_id);
CREATE INDEX IF NOT EXISTS idx_tasks_initiative ON public.tasks(initiative_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_nudges_target ON public.nudges(target_user_id);
CREATE INDEX IF NOT EXISTS idx_nudges_space ON public.nudges(space_id);
CREATE INDEX IF NOT EXISTS idx_activity_space ON public.space_activity_log(space_id);

-- RLS: SPACE TEMPLATES
ALTER TABLE public.space_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Templates are publicly readable" ON public.space_templates;
CREATE POLICY "Templates are publicly readable" ON public.space_templates FOR SELECT USING (is_active = true);

-- RLS: SPACE ROLES
ALTER TABLE public.space_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Roles visible to space members" ON public.space_roles;
CREATE POLICY "Roles visible to space members" ON public.space_roles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.space_members WHERE space_id = space_roles.space_id AND user_id = auth.uid())
         OR EXISTS (SELECT 1 FROM public.spaces WHERE id = space_roles.space_id AND privacy_level = 'public'));
DROP POLICY IF EXISTS "Space leads can manage roles" ON public.space_roles;
CREATE POLICY "Space leads can manage roles" ON public.space_roles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.spaces WHERE id = space_roles.space_id AND created_by = auth.uid()));

-- RLS: INITIATIVES
ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Initiatives visible to space members" ON public.initiatives;
CREATE POLICY "Initiatives visible to space members" ON public.initiatives FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.space_members WHERE space_id = initiatives.space_id AND user_id = auth.uid())
         OR EXISTS (SELECT 1 FROM public.spaces WHERE id = initiatives.space_id AND privacy_level = 'public'));
DROP POLICY IF EXISTS "Space members can create initiatives" ON public.initiatives;
CREATE POLICY "Space members can create initiatives" ON public.initiatives FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.space_members WHERE space_id = initiatives.space_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "Initiative creators and leads can update" ON public.initiatives;
CREATE POLICY "Initiative creators and leads can update" ON public.initiatives FOR UPDATE
  USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.spaces WHERE id = initiatives.space_id AND created_by = auth.uid()));

-- RLS: MILESTONES
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Milestones visible to space members" ON public.milestones;
CREATE POLICY "Milestones visible to space members" ON public.milestones FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.initiatives i JOIN public.space_members sm ON sm.space_id = i.space_id WHERE i.id = milestones.initiative_id AND sm.user_id = auth.uid())
         OR space_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.space_members WHERE space_id = milestones.space_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "Space members can manage milestones" ON public.milestones;
CREATE POLICY "Space members can manage milestones" ON public.milestones FOR ALL
  USING (EXISTS (SELECT 1 FROM public.initiatives i JOIN public.space_members sm ON sm.space_id = i.space_id WHERE i.id = milestones.initiative_id AND sm.user_id = auth.uid())
         OR space_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.space_members WHERE space_id = milestones.space_id AND user_id = auth.uid()));

-- RLS: NUDGES
ALTER TABLE public.nudges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see nudges they sent or received" ON public.nudges;
CREATE POLICY "Users can see nudges they sent or received" ON public.nudges FOR SELECT
  USING (target_user_id = auth.uid() OR sent_by = auth.uid());
DROP POLICY IF EXISTS "Authorized users can send nudges" ON public.nudges;
CREATE POLICY "Authorized users can send nudges" ON public.nudges FOR INSERT
  WITH CHECK (sent_by = auth.uid() OR sent_by IS NULL);

-- RLS: ACTIVITY LOG
ALTER TABLE public.space_activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Activity visible to space members" ON public.space_activity_log;
CREATE POLICY "Activity visible to space members" ON public.space_activity_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.space_members WHERE space_id = space_activity_log.space_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "System can insert activity" ON public.space_activity_log;
CREATE POLICY "System can insert activity" ON public.space_activity_log FOR INSERT WITH CHECK (true);