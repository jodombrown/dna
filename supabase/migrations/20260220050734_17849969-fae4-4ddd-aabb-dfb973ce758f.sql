
-- ============================================================
-- STEP 1: Extend conversations_new with thread type columns
-- ============================================================

ALTER TABLE conversations_new
  ADD COLUMN IF NOT EXISTS conversation_type text NOT NULL DEFAULT 'direct',
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS origin_type text,
  ADD COLUMN IF NOT EXISTS origin_id uuid,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- Add CHECK constraints separately (IF NOT EXISTS not supported on constraints)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversations_new_conversation_type_check') THEN
    ALTER TABLE conversations_new ADD CONSTRAINT conversations_new_conversation_type_check
      CHECK (conversation_type IN ('direct', 'event', 'space', 'opportunity', 'group'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversations_new_origin_type_check') THEN
    ALTER TABLE conversations_new ADD CONSTRAINT conversations_new_origin_type_check
      CHECK (origin_type IN ('event', 'space', 'opportunity') OR origin_type IS NULL);
  END IF;
END $$;

-- Index for fast lookup by origin
CREATE INDEX IF NOT EXISTS idx_conversations_new_origin
  ON conversations_new (origin_type, origin_id)
  WHERE origin_type IS NOT NULL;

-- Index for type filtering
CREATE INDEX IF NOT EXISTS idx_conversations_new_type
  ON conversations_new (conversation_type);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_conversations_new_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_conversations_new_updated_at ON conversations_new;
CREATE TRIGGER trg_conversations_new_updated_at
  BEFORE UPDATE ON conversations_new
  FOR EACH ROW EXECUTE FUNCTION update_conversations_new_updated_at();

-- ============================================================
-- STEP 2: RLS policies for the new columns
-- ============================================================

DROP POLICY IF EXISTS "Users can create conversations" ON conversations_new;
DROP POLICY IF EXISTS "conversations_new_insert" ON conversations_new;
CREATE POLICY "conversations_new_insert"
  ON conversations_new FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND created_by = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "Users can view their conversations" ON conversations_new;
DROP POLICY IF EXISTS "conversations_new_select" ON conversations_new;
CREATE POLICY "conversations_new_select"
  ON conversations_new FOR SELECT
  USING (
    id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "conversations_new_update" ON conversations_new;
CREATE POLICY "conversations_new_update"
  ON conversations_new FOR UPDATE
  USING (
    created_by = (SELECT auth.uid())
    OR id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- ============================================================
-- STEP 3: Helper — get or create a thread for an origin
-- ============================================================

CREATE OR REPLACE FUNCTION get_or_create_origin_conversation(
  p_origin_type text,
  p_origin_id uuid,
  p_title text,
  p_created_by uuid
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
BEGIN
  SELECT id INTO v_conversation_id
  FROM conversations_new
  WHERE origin_type = p_origin_type
    AND origin_id = p_origin_id
  LIMIT 1;

  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations_new (
      conversation_type, title, origin_type, origin_id, created_by
    ) VALUES (
      p_origin_type, p_title, p_origin_type, p_origin_id, p_created_by
    )
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$;

-- ============================================================
-- STEP 4: RPC — create_event_messaging_thread
-- ============================================================

CREATE OR REPLACE FUNCTION create_event_messaging_thread(
  p_event_id uuid,
  p_title text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
  v_event_title text;
  v_organizer_id uuid;
BEGIN
  SELECT title, organizer_id INTO v_event_title, v_organizer_id
  FROM events
  WHERE id = p_event_id;

  IF v_organizer_id IS NULL THEN
    RAISE EXCEPTION 'Event not found: %', p_event_id;
  END IF;

  v_conversation_id := get_or_create_origin_conversation(
    'event', p_event_id,
    COALESCE(p_title, v_event_title || ' — Discussion'),
    v_organizer_id
  );

  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (v_conversation_id, v_organizer_id)
  ON CONFLICT DO NOTHING;

  RETURN v_conversation_id;
END;
$$;

-- ============================================================
-- STEP 5: RPC — create_space_messaging_channel
-- FIX: collaboration_spaces uses 'title' not 'name'
-- ============================================================

CREATE OR REPLACE FUNCTION create_space_messaging_channel(
  p_space_id uuid,
  p_title text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
  v_space_name text;
  v_created_by uuid;
BEGIN
  -- Try spaces table first (uses 'name')
  SELECT name, created_by INTO v_space_name, v_created_by
  FROM spaces
  WHERE id = p_space_id;

  -- Fall back to collaboration_spaces (uses 'title')
  IF v_created_by IS NULL THEN
    SELECT title, created_by INTO v_space_name, v_created_by
    FROM collaboration_spaces
    WHERE id = p_space_id;
  END IF;

  IF v_created_by IS NULL THEN
    RAISE EXCEPTION 'Space not found: %', p_space_id;
  END IF;

  v_conversation_id := get_or_create_origin_conversation(
    'space', p_space_id,
    COALESCE(p_title, v_space_name || ' — Channel'),
    v_created_by
  );

  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (v_conversation_id, v_created_by)
  ON CONFLICT DO NOTHING;

  RETURN v_conversation_id;
END;
$$;

-- ============================================================
-- STEP 6: RPC — create_opportunity_messaging_thread
-- ============================================================

CREATE OR REPLACE FUNCTION create_opportunity_messaging_thread(
  p_opportunity_id uuid,
  p_title text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
  v_opp_title text;
  v_created_by uuid;
BEGIN
  SELECT title, created_by INTO v_opp_title, v_created_by
  FROM opportunities
  WHERE id = p_opportunity_id;

  IF v_created_by IS NULL THEN
    RAISE EXCEPTION 'Opportunity not found: %', p_opportunity_id;
  END IF;

  v_conversation_id := get_or_create_origin_conversation(
    'opportunity', p_opportunity_id,
    COALESCE(p_title, v_opp_title || ' — Thread'),
    v_created_by
  );

  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (v_conversation_id, v_created_by)
  ON CONFLICT DO NOTHING;

  RETURN v_conversation_id;
END;
$$;

-- ============================================================
-- STEP 7: Trigger — auto-create thread on event INSERT
-- ============================================================

CREATE OR REPLACE FUNCTION trg_auto_create_event_thread()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    PERFORM create_event_messaging_thread(NEW.id, NEW.title || ' — Discussion');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Auto-create event thread failed for event %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_event_create_thread ON events;
CREATE TRIGGER trg_event_create_thread
  AFTER INSERT ON events
  FOR EACH ROW EXECUTE FUNCTION trg_auto_create_event_thread();

-- ============================================================
-- STEP 8: Trigger — auto-add registrant to event thread
-- ============================================================

CREATE OR REPLACE FUNCTION trg_auto_join_event_thread()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
BEGIN
  SELECT id INTO v_conversation_id
  FROM conversations_new
  WHERE origin_type = 'event' AND origin_id = NEW.event_id
  LIMIT 1;

  IF v_conversation_id IS NOT NULL THEN
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (v_conversation_id, NEW.user_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Auto-join event thread failed for registration %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_registration_join_thread ON event_registrations;
CREATE TRIGGER trg_registration_join_thread
  AFTER INSERT ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION trg_auto_join_event_thread();

-- ============================================================
-- STEP 9: Trigger — auto-create channel on space INSERT
-- FIX: collaboration_spaces uses 'title', spaces uses 'name'
-- ============================================================

CREATE OR REPLACE FUNCTION trg_auto_create_space_channel()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_space_name text;
BEGIN
  -- Detect which table fired: spaces has 'name', collaboration_spaces has 'title'
  v_space_name := COALESCE(
    NULLIF(NEW.title, ''),   -- collaboration_spaces
    NEW.name                  -- spaces (will error if column missing, caught below)
  );

  BEGIN
    PERFORM create_space_messaging_channel(NEW.id, v_space_name || ' — Channel');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Auto-create space channel failed for space %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_space_create_channel ON spaces;
CREATE TRIGGER trg_space_create_channel
  AFTER INSERT ON spaces
  FOR EACH ROW EXECUTE FUNCTION trg_auto_create_space_channel();

-- Separate trigger function for collaboration_spaces (uses 'title')
CREATE OR REPLACE FUNCTION trg_auto_create_collab_space_channel()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    PERFORM create_space_messaging_channel(NEW.id, NEW.title || ' — Channel');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Auto-create collab space channel failed for space %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_collab_space_create_channel ON collaboration_spaces;
CREATE TRIGGER trg_collab_space_create_channel
  AFTER INSERT ON collaboration_spaces
  FOR EACH ROW EXECUTE FUNCTION trg_auto_create_collab_space_channel();

-- ============================================================
-- STEP 10: Trigger — auto-add member to space channel
-- ============================================================

CREATE OR REPLACE FUNCTION trg_auto_join_space_channel()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
BEGIN
  SELECT id INTO v_conversation_id
  FROM conversations_new
  WHERE origin_type = 'space' AND origin_id = NEW.space_id
  LIMIT 1;

  IF v_conversation_id IS NOT NULL THEN
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (v_conversation_id, NEW.user_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Auto-join space channel failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_space_member_join_channel ON space_members;
CREATE TRIGGER trg_space_member_join_channel
  AFTER INSERT ON space_members
  FOR EACH ROW EXECUTE FUNCTION trg_auto_join_space_channel();

-- ============================================================
-- STEP 11: Trigger — auto-create thread on opportunity INSERT
-- ============================================================

CREATE OR REPLACE FUNCTION trg_auto_create_opportunity_thread()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    PERFORM create_opportunity_messaging_thread(NEW.id, NEW.title || ' — Thread');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Auto-create opportunity thread failed for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_opportunity_create_thread ON opportunities;
CREATE TRIGGER trg_opportunity_create_thread
  AFTER INSERT ON opportunities
  FOR EACH ROW EXECUTE FUNCTION trg_auto_create_opportunity_thread();
