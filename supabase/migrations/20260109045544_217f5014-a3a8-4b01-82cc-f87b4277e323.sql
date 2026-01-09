-- ============================================
-- BATCH 1: CREATE/ALTER TABLES
-- ============================================

-- 1. SPACE TEMPLATES (New Table)
CREATE TABLE IF NOT EXISTS public.space_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'users',
  category VARCHAR(50) NOT NULL CHECK (category IN ('professional', 'community', 'investment', 'learning', 'advocacy')),
  default_roles JSONB DEFAULT '[]'::jsonb,
  default_initiatives JSONB DEFAULT '[]'::jsonb,
  suggested_milestones JSONB DEFAULT '[]'::jsonb,
  tier_availability VARCHAR[] DEFAULT ARRAY['free', 'pro', 'org'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SPACE ROLES (New Table)
CREATE TABLE IF NOT EXISTS public.space_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  required_skills TEXT[],
  permissions JSONB DEFAULT '{
    "can_edit_space": false,
    "can_invite_members": false,
    "can_create_initiatives": false,
    "can_assign_tasks": false,
    "can_send_nudges": false,
    "can_manage_roles": false
  }'::jsonb,
  is_lead BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. INITIATIVES (New Table)
CREATE TABLE IF NOT EXISTS public.initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'abandoned')),
  target_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_metrics JSONB,
  order_index INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. MILESTONES (New Table)
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID REFERENCES public.initiatives(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  target_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed')),
  completion_date TIMESTAMPTZ,
  celebration_shared BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. NUDGES (New Table)
CREATE TABLE IF NOT EXISTS public.nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sent_by UUID REFERENCES auth.users(id),
  type VARCHAR(20) DEFAULT 'automated' CHECK (type IN ('automated', 'manual', 'escalation')),
  tone VARCHAR(20) DEFAULT 'gentle' CHECK (tone IN ('gentle', 'checkin', 'urgent')),
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. SPACE ACTIVITY LOG (New Table)
CREATE TABLE IF NOT EXISTS public.space_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  action_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);