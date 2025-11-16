-- ADA Phase 2 M1: Personalization & Layout Presets

-- Add role and intents to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_role text,
ADD COLUMN IF NOT EXISTS intents text[] DEFAULT '{}';

-- Create user_dashboard_preferences table
CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  visible_modules jsonb NOT NULL DEFAULT '["upcoming_events", "recommended_spaces", "open_needs", "suggested_people", "recent_stories", "resume_section"]'::jsonb,
  collapsed_modules jsonb NOT NULL DEFAULT '[]'::jsonb,
  density text NOT NULL DEFAULT 'standard' CHECK (density IN ('standard', 'compact')),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user_dashboard_preferences
ALTER TABLE user_dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_dashboard_preferences
CREATE POLICY "Users can view their own dashboard preferences"
  ON user_dashboard_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboard preferences"
  ON user_dashboard_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard preferences"
  ON user_dashboard_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Create user_last_view_state table
CREATE TABLE IF NOT EXISTS user_last_view_state (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  last_view_state text NOT NULL,
  last_visited_at timestamp with time zone NOT NULL DEFAULT now(),
  context jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on user_last_view_state
ALTER TABLE user_last_view_state ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_last_view_state
CREATE POLICY "Users can view their own last view state"
  ON user_last_view_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own last view state"
  ON user_last_view_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own last view state"
  ON user_last_view_state FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to get or create dashboard preferences with defaults
CREATE OR REPLACE FUNCTION get_dashboard_preferences(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prefs jsonb;
BEGIN
  -- Try to get existing preferences
  SELECT jsonb_build_object(
    'visible_modules', visible_modules,
    'collapsed_modules', collapsed_modules,
    'density', density
  )
  INTO v_prefs
  FROM user_dashboard_preferences
  WHERE user_id = p_user_id;

  -- If no preferences exist, create defaults
  IF v_prefs IS NULL THEN
    INSERT INTO user_dashboard_preferences (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING jsonb_build_object(
      'visible_modules', visible_modules,
      'collapsed_modules', collapsed_modules,
      'density', density
    ) INTO v_prefs;
  END IF;

  RETURN v_prefs;
END;
$$;

-- Function to update last view state with debounce logic
CREATE OR REPLACE FUNCTION update_last_view_state(
  p_user_id uuid,
  p_view_state text,
  p_context jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_last_view_state (user_id, last_view_state, last_visited_at, context)
  VALUES (p_user_id, p_view_state, now(), p_context)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    last_view_state = p_view_state,
    last_visited_at = now(),
    context = p_context;
END;
$$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_last_view_state_user_id ON user_last_view_state(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dashboard_preferences_user_id ON user_dashboard_preferences(user_id);