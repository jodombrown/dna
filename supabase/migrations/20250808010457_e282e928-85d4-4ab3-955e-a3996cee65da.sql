-- Retry migration with correct ordering (create tables before cross-referencing policies)

-- 0) Tables first (no cross-table policy yet)
CREATE TABLE IF NOT EXISTS public.collaboration_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  visibility TEXT NOT NULL DEFAULT 'private',
  status TEXT NOT NULL DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collaboration_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'approved',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (space_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_collab_memberships_space ON public.collaboration_memberships(space_id);
CREATE INDEX IF NOT EXISTS idx_collab_memberships_user ON public.collaboration_memberships(user_id);

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'normal',
  assignee_id UUID,
  due_date DATE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_space ON public.tasks(space_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);

CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'planned',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_milestones_space ON public.milestones(space_id);

CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  space_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'active',
  visibility TEXT NOT NULL DEFAULT 'public',
  tags TEXT[] DEFAULT '{}',
  location TEXT,
  link TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_creator ON public.opportunities(created_by);
CREATE INDEX IF NOT EXISTS idx_opportunities_space ON public.opportunities(space_id);

CREATE TABLE IF NOT EXISTS public.user_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  target_id UUID,
  target_title TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_contributions_user ON public.user_contributions(user_id);

CREATE TABLE IF NOT EXISTS public.impact_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  criteria JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_type)
);

-- 1) Enable RLS
ALTER TABLE public.collaboration_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- 2) Policies (now safe to reference memberships)
DO $$ BEGIN
  -- collaboration_spaces
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='collaboration_spaces' AND policyname='Public can view public spaces or members can view'
  ) THEN
    CREATE POLICY "Public can view public spaces or members can view"
    ON public.collaboration_spaces
    FOR SELECT USING (
      visibility = 'public'
      OR EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = collaboration_spaces.id
          AND m.user_id = auth.uid()
          AND m.status = 'approved'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='collaboration_spaces' AND policyname='Users can create their own spaces'
  ) THEN
    CREATE POLICY "Users can create their own spaces"
    ON public.collaboration_spaces
    FOR INSERT WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='collaboration_spaces' AND policyname='Owners/admins can update spaces'
  ) THEN
    CREATE POLICY "Owners/admins can update spaces"
    ON public.collaboration_spaces
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = collaboration_spaces.id
          AND m.user_id = auth.uid()
          AND m.role IN ('owner','admin')
          AND m.status = 'approved'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='collaboration_spaces' AND policyname='Owners/admins can delete spaces'
  ) THEN
    CREATE POLICY "Owners/admins can delete spaces"
    ON public.collaboration_spaces
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = collaboration_spaces.id
          AND m.user_id = auth.uid()
          AND m.role IN ('owner','admin')
          AND m.status = 'approved'
      )
    );
  END IF;

  -- collaboration_memberships
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='collaboration_memberships' AND policyname='Members can view memberships of their spaces'
  ) THEN
    CREATE POLICY "Members can view memberships of their spaces"
    ON public.collaboration_memberships
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = collaboration_memberships.space_id
          AND m.user_id = auth.uid()
          AND m.status = 'approved'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='collaboration_memberships' AND policyname='Owners/admins can add memberships or users can request'
  ) THEN
    CREATE POLICY "Owners/admins can add memberships or users can request"
    ON public.collaboration_memberships
    FOR INSERT WITH CHECK (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = collaboration_memberships.space_id
          AND m.user_id = auth.uid()
          AND m.role IN ('owner','admin')
          AND m.status = 'approved'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='collaboration_memberships' AND policyname='Owners/admins or self can update memberships'
  ) THEN
    CREATE POLICY "Owners/admins or self can update memberships"
    ON public.collaboration_memberships
    FOR UPDATE USING (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = collaboration_memberships.space_id
          AND m.user_id = auth.uid()
          AND m.role IN ('owner','admin')
          AND m.status = 'approved'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='collaboration_memberships' AND policyname='Owners/admins or self can delete memberships'
  ) THEN
    CREATE POLICY "Owners/admins or self can delete memberships"
    ON public.collaboration_memberships
    FOR DELETE USING (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = collaboration_memberships.space_id
          AND m.user_id = auth.uid()
          AND m.role IN ('owner','admin')
          AND m.status = 'approved'
      )
    );
  END IF;

  -- tasks
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tasks' AND policyname='Members can view tasks in their spaces'
  ) THEN
    CREATE POLICY "Members can view tasks in their spaces"
    ON public.tasks
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = tasks.space_id
          AND m.user_id = auth.uid()
          AND m.status = 'approved'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tasks' AND policyname='Members can create tasks in their spaces'
  ) THEN
    CREATE POLICY "Members can create tasks in their spaces"
    ON public.tasks
    FOR INSERT WITH CHECK (
      created_by = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = tasks.space_id
          AND m.user_id = auth.uid()
          AND m.status = 'approved'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tasks' AND policyname='Creators, assignees, admins can update tasks'
  ) THEN
    CREATE POLICY "Creators, assignees, admins can update tasks"
    ON public.tasks
    FOR UPDATE USING (
      created_by = auth.uid()
      OR assignee_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = tasks.space_id
          AND m.user_id = auth.uid()
          AND m.role IN ('owner','admin')
          AND m.status = 'approved'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tasks' AND policyname='Creators or admins can delete tasks'
  ) THEN
    CREATE POLICY "Creators or admins can delete tasks"
    ON public.tasks
    FOR DELETE USING (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = tasks.space_id
          AND m.user_id = auth.uid()
          AND m.role IN ('owner','admin')
          AND m.status = 'approved'
      )
    );
  END IF;

  -- milestones
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='milestones' AND policyname='Members can view milestones in their spaces'
  ) THEN
    CREATE POLICY "Members can view milestones in their spaces"
    ON public.milestones
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = milestones.space_id
          AND m.user_id = auth.uid()
          AND m.status = 'approved'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='milestones' AND policyname='Members can create milestones in their spaces'
  ) THEN
    CREATE POLICY "Members can create milestones in their spaces"
    ON public.milestones
    FOR INSERT WITH CHECK (
      created_by = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = milestones.space_id
          AND m.user_id = auth.uid()
          AND m.status = 'approved'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='milestones' AND policyname='Creators or admins can update milestones'
  ) THEN
    CREATE POLICY "Creators or admins can update milestones"
    ON public.milestones
    FOR UPDATE USING (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = milestones.space_id
          AND m.user_id = auth.uid()
          AND m.role IN ('owner','admin')
          AND m.status = 'approved'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='milestones' AND policyname='Creators or admins can delete milestones'
  ) THEN
    CREATE POLICY "Creators or admins can delete milestones"
    ON public.milestones
    FOR DELETE USING (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = milestones.space_id
          AND m.user_id = auth.uid()
          AND m.role IN ('owner','admin')
          AND m.status = 'approved'
      )
    );
  END IF;

  -- opportunities
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='opportunities' AND policyname='Active public opportunities are viewable by everyone'
  ) THEN
    CREATE POLICY "Active public opportunities are viewable by everyone"
    ON public.opportunities
    FOR SELECT USING (
      visibility = 'public' AND status = 'active'
      OR EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = opportunities.space_id
          AND m.user_id = auth.uid()
          AND m.status = 'approved'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='opportunities' AND policyname='Users can create their own opportunities'
  ) THEN
    CREATE POLICY "Users can create their own opportunities"
    ON public.opportunities
    FOR INSERT WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='opportunities' AND policyname='Creators or space admins can update opportunities'
  ) THEN
    CREATE POLICY "Creators or space admins can update opportunities"
    ON public.opportunities
    FOR UPDATE USING (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = opportunities.space_id
          AND m.user_id = auth.uid()
          AND m.role IN ('owner','admin')
          AND m.status = 'approved'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='opportunities' AND policyname='Creators or space admins can delete opportunities'
  ) THEN
    CREATE POLICY "Creators or space admins can delete opportunities"
    ON public.opportunities
    FOR DELETE USING (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.collaboration_memberships m
        WHERE m.space_id = opportunities.space_id
          AND m.user_id = auth.uid()
          AND m.role IN ('owner','admin')
          AND m.status = 'approved'
      )
    );
  END IF;

  -- user_contributions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_contributions' AND policyname='Users can view their own contributions'
  ) THEN
    CREATE POLICY "Users can view their own contributions"
    ON public.user_contributions
    FOR SELECT USING (user_id = auth.uid() OR is_admin_user(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_contributions' AND policyname='Users can insert their own contributions'
  ) THEN
    CREATE POLICY "Users can insert their own contributions"
    ON public.user_contributions
    FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;

  -- impact_badges
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='impact_badges' AND policyname='Badges are viewable by everyone'
  ) THEN
    CREATE POLICY "Badges are viewable by everyone"
    ON public.impact_badges
    FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='impact_badges' AND policyname='Admins can manage badges'
  ) THEN
    CREATE POLICY "Admins can manage badges"
    ON public.impact_badges
    FOR ALL USING (is_admin_user(auth.uid()))
    WITH CHECK (is_admin_user(auth.uid()));
  END IF;

  -- user_badges
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_badges' AND policyname='Users can view their own badges'
  ) THEN
    CREATE POLICY "Users can view their own badges"
    ON public.user_badges
    FOR SELECT USING (user_id = auth.uid() OR is_admin_user(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_badges' AND policyname='System can insert user badges'
  ) THEN
    CREATE POLICY "System can insert user badges"
    ON public.user_badges
    FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 3) Triggers
CREATE OR REPLACE FUNCTION public.create_collab_owner_membership()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.collaboration_memberships (space_id, user_id, role, status)
  VALUES (NEW.id, NEW.created_by, 'owner', 'approved')
  ON CONFLICT (space_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_create_collab_owner_membership ON public.collaboration_spaces;
CREATE TRIGGER trg_create_collab_owner_membership
AFTER INSERT ON public.collaboration_spaces
FOR EACH ROW EXECUTE FUNCTION public.create_collab_owner_membership();

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_collab_spaces_updated_at') THEN
    CREATE TRIGGER update_collab_spaces_updated_at
    BEFORE UPDATE ON public.collaboration_spaces
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_tasks_updated_at') THEN
    CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_milestones_updated_at') THEN
    CREATE TRIGGER update_milestones_updated_at
    BEFORE UPDATE ON public.milestones
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_opportunities_updated_at') THEN
    CREATE TRIGGER update_opportunities_updated_at
    BEFORE UPDATE ON public.opportunities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
