
-- =============================================
-- Sprint 14: Missing database objects
-- =============================================

-- 1. Space health columns
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS health_score INTEGER DEFAULT 100;
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS health_updated_at TIMESTAMPTZ;
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS contributor_stats JSONB DEFAULT '{}';

-- 2. Add assigned_to alias column to space_tasks (code references it)
ALTER TABLE space_tasks ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);
-- Backfill from assignee_id
UPDATE space_tasks SET assigned_to = assignee_id WHERE assigned_to IS NULL AND assignee_id IS NOT NULL;

-- 3. Group conversation RPCs
CREATE OR REPLACE FUNCTION public.create_group_conversation(
  p_title TEXT,
  p_participant_ids UUID[],
  p_created_by UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id UUID;
  v_participant_id UUID;
BEGIN
  -- Create the group conversation
  INSERT INTO conversations_new (
    conversation_type, title, created_by, last_message_at
  ) VALUES (
    'group', p_title, p_created_by, NOW()
  ) RETURNING id INTO v_conversation_id;

  -- Add creator as participant
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (v_conversation_id, p_created_by)
  ON CONFLICT DO NOTHING;

  -- Add all selected participants
  FOREACH v_participant_id IN ARRAY p_participant_ids
  LOOP
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (v_conversation_id, v_participant_id)
    ON CONFLICT DO NOTHING;
  END LOOP;

  RETURN v_conversation_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_group_participant(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (p_conversation_id, p_user_id)
  ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_group_participant(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM conversation_participants
  WHERE conversation_id = p_conversation_id
  AND user_id = p_user_id;
END;
$$;
