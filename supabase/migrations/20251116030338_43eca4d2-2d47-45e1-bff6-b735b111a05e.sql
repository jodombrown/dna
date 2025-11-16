-- ADA Phase 4 - M1: Adaptive Config & Experiment Framework
-- Creates the foundation for cohort-based experiments and policy-driven adaptation

-- 1. ADA Policies Table
CREATE TABLE IF NOT EXISTS ada_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('layout', 'modules', 'cta', 'nudge', 'other')),
  scope TEXT NOT NULL CHECK (scope IN ('global', 'cohort', 'experiment_variant')),
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ada_policies_type ON ada_policies(type);
CREATE INDEX idx_ada_policies_scope ON ada_policies(scope);
CREATE INDEX idx_ada_policies_active ON ada_policies(is_active);

-- 2. ADA Cohorts Table
CREATE TABLE IF NOT EXISTS ada_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ada_cohorts_active ON ada_cohorts(is_active);

-- 3. ADA Experiments Table
CREATE TABLE IF NOT EXISTS ada_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'running', 'paused', 'completed')) DEFAULT 'draft',
  target_policy_type TEXT NOT NULL CHECK (target_policy_type IN ('layout', 'modules', 'cta', 'nudge', 'other')),
  target_route TEXT,
  cohort_id UUID REFERENCES ada_cohorts(id) ON DELETE SET NULL,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ada_experiments_status ON ada_experiments(status);
CREATE INDEX idx_ada_experiments_cohort ON ada_experiments(cohort_id);
CREATE INDEX idx_ada_experiments_type ON ada_experiments(target_policy_type);

-- 4. ADA Experiment Variants Table
CREATE TABLE IF NOT EXISTS ada_experiment_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES ada_experiments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  policy_id UUID NOT NULL REFERENCES ada_policies(id) ON DELETE CASCADE,
  allocation FLOAT NOT NULL DEFAULT 0.5 CHECK (allocation >= 0 AND allocation <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(experiment_id, name)
);

CREATE INDEX idx_ada_experiment_variants_experiment ON ada_experiment_variants(experiment_id);
CREATE INDEX idx_ada_experiment_variants_policy ON ada_experiment_variants(policy_id);

-- 5. ADA Experiment Assignments Table
CREATE TABLE IF NOT EXISTS ada_experiment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES ada_experiments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES ada_experiment_variants(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(experiment_id, user_id)
);

CREATE INDEX idx_ada_experiment_assignments_user ON ada_experiment_assignments(user_id);
CREATE INDEX idx_ada_experiment_assignments_experiment ON ada_experiment_assignments(experiment_id);
CREATE INDEX idx_ada_experiment_assignments_variant ON ada_experiment_assignments(variant_id);

-- 6. Cohort Membership Cache Table (for performance)
CREATE TABLE IF NOT EXISTS ada_cohort_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES ada_cohorts(id) ON DELETE CASCADE,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
  UNIQUE(user_id, cohort_id)
);

CREATE INDEX idx_ada_cohort_memberships_user ON ada_cohort_memberships(user_id);
CREATE INDEX idx_ada_cohort_memberships_expires ON ada_cohort_memberships(expires_at);

-- Enable RLS
ALTER TABLE ada_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ada_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ada_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ada_experiment_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ada_experiment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ada_cohort_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ada_policies
CREATE POLICY "Admins can manage policies"
  ON ada_policies FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view active policies"
  ON ada_policies FOR SELECT
  USING (is_active = true AND auth.role() = 'authenticated');

-- RLS Policies for ada_cohorts
CREATE POLICY "Admins can manage cohorts"
  ON ada_cohorts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view active cohorts"
  ON ada_cohorts FOR SELECT
  USING (is_active = true AND auth.role() = 'authenticated');

-- RLS Policies for ada_experiments
CREATE POLICY "Admins can manage experiments"
  ON ada_experiments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can view running experiments"
  ON ada_experiments FOR SELECT
  USING (status = 'running' AND auth.role() = 'authenticated');

-- RLS Policies for ada_experiment_variants
CREATE POLICY "Admins can manage variants"
  ON ada_experiment_variants FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can view variants for running experiments"
  ON ada_experiment_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ada_experiments
      WHERE id = ada_experiment_variants.experiment_id
      AND status = 'running'
    )
    AND auth.role() = 'authenticated'
  );

-- RLS Policies for ada_experiment_assignments
CREATE POLICY "Users can view their own assignments"
  ON ada_experiment_assignments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create assignments"
  ON ada_experiment_assignments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can view all assignments"
  ON ada_experiment_assignments FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for ada_cohort_memberships
CREATE POLICY "Users can view their own cohort memberships"
  ON ada_cohort_memberships FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can manage cohort memberships"
  ON ada_cohort_memberships FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Function to evaluate if user matches cohort criteria
CREATE OR REPLACE FUNCTION evaluate_cohort_criteria(
  p_user_id UUID,
  p_criteria JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile RECORD;
  v_stats RECORD;
  v_criteria_key TEXT;
  v_criteria_value JSONB;
BEGIN
  -- Get user profile
  SELECT * INTO v_profile
  FROM profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Evaluate each criterion
  FOR v_criteria_key, v_criteria_value IN
    SELECT * FROM jsonb_each(p_criteria)
  LOOP
    CASE v_criteria_key
      -- Role criteria
      WHEN 'role_in' THEN
        IF NOT (v_profile.user_role = ANY(ARRAY(SELECT jsonb_array_elements_text(v_criteria_value)))) THEN
          RETURN FALSE;
        END IF;

      -- Region criteria
      WHEN 'region_in' THEN
        IF NOT (v_profile.location = ANY(ARRAY(SELECT jsonb_array_elements_text(v_criteria_value)))) THEN
          RETURN FALSE;
        END IF;

      -- Minimum events attended
      WHEN 'min_events_attended' THEN
        SELECT COUNT(*) INTO v_stats
        FROM event_attendees
        WHERE user_id = p_user_id;
        
        IF COALESCE(v_stats, 0) < (v_criteria_value::text)::int THEN
          RETURN FALSE;
        END IF;

      -- Account age
      WHEN 'max_account_age_days' THEN
        IF EXTRACT(DAY FROM (NOW() - v_profile.created_at)) > (v_criteria_value::text)::int THEN
          RETURN FALSE;
        END IF;

      -- Add more criteria evaluation logic as needed
      ELSE
        -- Unknown criterion - skip
        CONTINUE;
    END CASE;
  END LOOP;

  RETURN TRUE;
END;
$$;

-- Function to get user's cohorts
CREATE OR REPLACE FUNCTION get_user_cohorts(p_user_id UUID)
RETURNS TABLE (cohort_id UUID, cohort_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name
  FROM ada_cohorts c
  WHERE c.is_active = true
    AND evaluate_cohort_criteria(p_user_id, c.criteria);
END;
$$;

-- Insert default global policies
INSERT INTO ada_policies (name, description, type, scope, config) VALUES
  ('default_feed_modules', 'Default module order for /dna/feed right rail', 'modules', 'global', 
   '{"modules_order": ["resume_section", "whats_next", "upcoming_events", "recommended_spaces", "open_needs", "recent_stories"], "modules_required": ["resume_section"], "modules_optional": ["upcoming_events", "open_needs"]}'::jsonb),
  
  ('default_layout', 'Default three-column layout for dashboard', 'layout', 'global',
   '{"view_state": "DASHBOARD_HOME", "layout_type": "three-column", "left_width": "15%", "center_width": "55%", "right_width": "30%"}'::jsonb),
  
  ('default_event_ctas', 'Default CTAs for event detail views', 'cta', 'global',
   '{"entity_type": "event", "ctas": [{"id": "rsvp", "priority": 1}, {"id": "join_space", "priority": 2}, {"id": "connect_attendees", "priority": 3}]}'::jsonb),
  
  ('default_nudge_limits', 'Default nudge frequency limits', 'nudge', 'global',
   '{"max_per_session": 3, "max_per_day": 5, "min_gap_hours": 2}'::jsonb)
ON CONFLICT (name) DO NOTHING;