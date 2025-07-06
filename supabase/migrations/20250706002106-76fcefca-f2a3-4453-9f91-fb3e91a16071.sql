-- Create user feedback table
CREATE TABLE public.user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('bug', 'feature', 'general', 'story')),
  message text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  admin_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create impact log table for tracking user contributions
CREATE TABLE public.impact_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('post', 'comment', 'reaction', 'project', 'event', 'connection', 'community_join')),
  target_id uuid, -- references the specific item (post, comment, etc.)
  target_type text, -- 'post', 'comment', 'user', 'community', etc.
  points integer DEFAULT 0,
  pillar text CHECK (pillar IN ('connect', 'collaborate', 'contribute')),
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_feedback
CREATE POLICY "Users can create their own feedback"
  ON public.user_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback"
  ON public.user_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
  ON public.user_feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (
        email = 'admin@diasporanetwork.africa' 
        OR email LIKE '%@diasporanetwork.africa'
      )
    )
  );

CREATE POLICY "Admins can update feedback"
  ON public.user_feedback
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (
        email = 'admin@diasporanetwork.africa' 
        OR email LIKE '%@diasporanetwork.africa'
      )
    )
  );

-- RLS policies for impact_log
CREATE POLICY "System can create impact logs"
  ON public.impact_log
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own impact"
  ON public.impact_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all impact logs"
  ON public.impact_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (
        email = 'admin@diasporanetwork.africa' 
        OR email LIKE '%@diasporanetwork.africa'
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX idx_user_feedback_type ON public.user_feedback(type);
CREATE INDEX idx_user_feedback_status ON public.user_feedback(status);
CREATE INDEX idx_user_feedback_created_at ON public.user_feedback(created_at);

CREATE INDEX idx_impact_log_user_id ON public.impact_log(user_id);
CREATE INDEX idx_impact_log_type ON public.impact_log(type);
CREATE INDEX idx_impact_log_pillar ON public.impact_log(pillar);
CREATE INDEX idx_impact_log_created_at ON public.impact_log(created_at);

-- Create view for user impact summaries
CREATE VIEW public.user_impact_summary AS
SELECT 
  user_id,
  COUNT(*) as total_actions,
  SUM(points) as total_points,
  COUNT(*) FILTER (WHERE type = 'post') as posts_created,
  COUNT(*) FILTER (WHERE type = 'comment') as comments_made,
  COUNT(*) FILTER (WHERE type = 'reaction') as reactions_given,
  COUNT(*) FILTER (WHERE type = 'connection') as connections_made,
  COUNT(*) FILTER (WHERE pillar = 'connect') as connect_actions,
  COUNT(*) FILTER (WHERE pillar = 'collaborate') as collaborate_actions,
  COUNT(*) FILTER (WHERE pillar = 'contribute') as contribute_actions,
  MAX(created_at) as last_activity
FROM public.impact_log
GROUP BY user_id;

-- Function to calculate user impact score
CREATE OR REPLACE FUNCTION public.calculate_impact_score(target_user_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(
    CASE 
      WHEN type = 'post' THEN 10
      WHEN type = 'comment' THEN 3
      WHEN type = 'reaction' THEN 1
      WHEN type = 'connection' THEN 5
      WHEN type = 'project' THEN 20
      WHEN type = 'event' THEN 15
      WHEN type = 'community_join' THEN 8
      ELSE points
    END
  ), 0)::integer
  FROM public.impact_log 
  WHERE user_id = target_user_id;
$$;