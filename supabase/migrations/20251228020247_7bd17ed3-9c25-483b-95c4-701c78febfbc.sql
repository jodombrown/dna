-- Fix function search_path security issues by setting explicit search_path
-- All functions are recreated with SET search_path = public

-- 1. check_user_reshared (SQL function)
CREATE OR REPLACE FUNCTION public.check_user_reshared(p_user_id uuid, p_post_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM posts 
    WHERE author_id = p_user_id 
      AND original_post_id = p_post_id 
      AND post_type = 'reshare'
      AND is_deleted = false
  );
$$;

-- 2. get_reshare_count (SQL function)
CREATE OR REPLACE FUNCTION public.get_reshare_count(p_post_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::bigint 
  FROM posts 
  WHERE original_post_id = p_post_id 
    AND post_type = 'reshare'
    AND is_deleted = false;
$$;

-- 3. delete_reshare
CREATE OR REPLACE FUNCTION public.delete_reshare(p_user_id uuid, p_original_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE posts 
  SET is_deleted = true, updated_at = now()
  WHERE author_id = p_user_id 
    AND original_post_id = p_original_post_id 
    AND post_type = 'reshare'
    AND is_deleted = false;
END;
$$;

-- 4. get_mutual_connection_count (SQL function)
CREATE OR REPLACE FUNCTION public.get_mutual_connection_count(user_a uuid, user_b uuid)
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT p.id)::bigint
  FROM profiles p
  INNER JOIN connections c1 ON (
    (c1.requester_id = user_a AND c1.recipient_id = p.id)
    OR (c1.recipient_id = user_a AND c1.requester_id = p.id)
  )
  INNER JOIN connections c2 ON (
    (c2.requester_id = user_b AND c2.recipient_id = p.id)
    OR (c2.recipient_id = user_b AND c2.requester_id = p.id)
  )
  WHERE c1.status = 'accepted'
    AND c2.status = 'accepted'
    AND p.id != user_a
    AND p.id != user_b;
$$;

-- 5. update_updated_at (trigger function)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 6. auto_join_feedback_channel (trigger function)
CREATE OR REPLACE FUNCTION public.auto_join_feedback_channel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.feedback_channel_memberships (channel_id, user_id, status)
  SELECT id, NEW.id, 'active'
  FROM public.feedback_channels
  WHERE is_default = true AND is_active = true
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- 7. update_feedback_updated_at (trigger function)
CREATE OR REPLACE FUNCTION public.update_feedback_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 8. update_feedback_reply_count (trigger function)
CREATE OR REPLACE FUNCTION public.update_feedback_reply_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
        UPDATE feedback_messages
        SET reply_count = reply_count + 1
        WHERE id = NEW.parent_id;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
        UPDATE feedback_messages
        SET reply_count = reply_count - 1
        WHERE id = OLD.parent_id;
    END IF;
    RETURN NULL;
END;
$$;

-- 9. extract_hashtags
CREATE OR REPLACE FUNCTION public.extract_hashtags(content text)
RETURNS text[]
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  hashtags TEXT[];
BEGIN
  SELECT ARRAY(
    SELECT DISTINCT lower(substring(match[1] FROM 1))
    FROM regexp_matches(content, '#(\w+)', 'g') AS match
  ) INTO hashtags;
  
  RETURN COALESCE(hashtags, ARRAY[]::TEXT[]);
END;
$$;

-- 10. get_or_create_hashtag
CREATE OR REPLACE FUNCTION public.get_or_create_hashtag(p_name text, p_display_name text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hashtag_id UUID;
  v_tag TEXT;
BEGIN
  v_tag := lower(regexp_replace(p_name, '^#', ''));
  
  IF EXISTS (SELECT 1 FROM reserved_hashtags WHERE name = v_tag AND can_be_used = false) THEN
    RAISE EXCEPTION 'Hashtag % is reserved and cannot be used', v_tag;
  END IF;
  
  SELECT id INTO v_hashtag_id FROM hashtags WHERE tag = v_tag;
  
  IF v_hashtag_id IS NULL THEN
    INSERT INTO hashtags (tag, type, usage_count, first_used_at, last_used_at, status)
    VALUES (v_tag, 'community', 0, now(), now(), 'active')
    RETURNING id INTO v_hashtag_id;
  END IF;
  
  RETURN v_hashtag_id;
END;
$$;

-- 11. trigger_process_post_hashtags
CREATE OR REPLACE FUNCTION public.trigger_process_post_hashtags()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.content ~ '#\w+' THEN
    PERFORM process_post_hashtags(NEW.id, NEW.author_id, NEW.content);
  END IF;
  RETURN NEW;
END;
$$;

-- 12. get_hashtag_details
CREATE OR REPLACE FUNCTION public.get_hashtag_details(p_hashtag_name text, p_user_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(id uuid, tag text, name text, display_name text, type text, owner_id uuid, owner_name text, owner_username text, owner_avatar text, description text, status text, is_verified boolean, usage_count integer, follower_count integer, is_following boolean, created_at timestamp with time zone)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tag TEXT;
BEGIN
  v_tag := lower(regexp_replace(p_hashtag_name, '^#', ''));
  
  RETURN QUERY
  SELECT 
    h.id,
    h.tag,
    h.tag as name,
    h.tag as display_name,
    h.type::TEXT,
    h.owner_id,
    p.display_name as owner_name,
    p.username as owner_username,
    p.avatar_url as owner_avatar,
    h.description,
    h.status::TEXT,
    COALESCE(h.is_verified, false),
    COALESCE(h.usage_count, 0),
    COALESCE(h.follower_count, 0),
    EXISTS(
      SELECT 1 FROM hashtag_followers hf 
      WHERE hf.hashtag_id = h.id AND hf.user_id = p_user_id
    ) as is_following,
    h.created_at
  FROM hashtags h
  LEFT JOIN profiles p ON p.id = h.owner_id
  WHERE h.tag = v_tag;
END;
$$;

-- 13. search_hashtags
CREATE OR REPLACE FUNCTION public.search_hashtags(p_query text, p_limit integer DEFAULT 10)
RETURNS TABLE(id uuid, tag text, name text, display_name text, type text, usage_count integer, follower_count integer, is_verified boolean)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_query TEXT;
BEGIN
  v_query := lower(regexp_replace(p_query, '^#', ''));
  
  RETURN QUERY
  SELECT 
    h.id,
    h.tag,
    h.tag as name,
    h.tag as display_name,
    h.type::TEXT,
    COALESCE(h.usage_count, 0),
    COALESCE(h.follower_count, 0),
    COALESCE(h.is_verified, false)
  FROM hashtags h
  WHERE h.status = 'active'
    AND h.tag LIKE v_query || '%'
  ORDER BY 
    CASE WHEN h.tag = v_query THEN 0 ELSE 1 END,
    h.usage_count DESC
  LIMIT p_limit;
END;
$$;

-- 14. process_post_hashtags
CREATE OR REPLACE FUNCTION public.process_post_hashtags(p_post_id uuid, p_user_id uuid, p_content text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hashtag TEXT;
  v_hashtag_id UUID;
  v_hashtags TEXT[];
  v_owner_id UUID;
  v_is_personal BOOLEAN;
  v_requires_approval BOOLEAN;
BEGIN
  v_hashtags := extract_hashtags(p_content);
  
  FOREACH v_hashtag IN ARRAY v_hashtags
  LOOP
    BEGIN
      v_hashtag_id := get_or_create_hashtag(v_hashtag);
      
      SELECT owner_id, is_personal, requires_approval 
      INTO v_owner_id, v_is_personal, v_requires_approval
      FROM hashtags WHERE id = v_hashtag_id;
      
      IF v_is_personal AND v_requires_approval AND v_owner_id IS NOT NULL AND v_owner_id != p_user_id THEN
        PERFORM request_hashtag_usage(p_user_id, v_hashtag_id, p_post_id);
        CONTINUE;
      END IF;
      
      INSERT INTO post_hashtags (post_id, hashtag_id)
      VALUES (p_post_id, v_hashtag_id)
      ON CONFLICT (post_id, hashtag_id) DO NOTHING;
      
      UPDATE hashtags 
      SET usage_count = usage_count + 1, 
          last_used_at = now(),
          updated_at = now()
      WHERE id = v_hashtag_id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Error processing hashtag %: %', v_hashtag, SQLERRM;
        CONTINUE;
    END;
  END LOOP;
END;
$$;

-- 15. get_user_hashtag_limits
CREATE OR REPLACE FUNCTION public.get_user_hashtag_limits(p_user_id uuid)
RETURNS TABLE(max_hashtags integer, active_count integer, archived_count integer, available_slots integer)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max INTEGER := 5;
  v_active INTEGER;
  v_archived INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_active
  FROM hashtags
  WHERE owner_id = p_user_id
    AND type = 'personal'
    AND status = 'active';
  
  SELECT COUNT(*) INTO v_archived
  FROM hashtags
  WHERE owner_id = p_user_id
    AND type = 'personal'
    AND status = 'archived';
  
  RETURN QUERY SELECT v_max, v_active, v_archived, (v_max - v_active);
END;
$$;

-- 16. create_personal_hashtag
CREATE OR REPLACE FUNCTION public.create_personal_hashtag(p_user_id uuid, p_tag text, p_description text DEFAULT NULL::text)
RETURNS TABLE(success boolean, hashtag_id uuid, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tag TEXT;
  v_active_count INTEGER;
  v_existing_id UUID;
  v_new_id UUID;
BEGIN
  v_tag := lower(regexp_replace(p_tag, '^#', ''));
  
  IF EXISTS (SELECT 1 FROM reserved_hashtags WHERE name = v_tag) THEN
    RETURN QUERY SELECT false, NULL::UUID, 'This hashtag is reserved and cannot be owned';
    RETURN;
  END IF;
  
  SELECT id INTO v_existing_id FROM hashtags WHERE tag = v_tag;
  
  IF v_existing_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM hashtags WHERE id = v_existing_id AND owner_id IS NOT NULL AND owner_id != p_user_id) THEN
      RETURN QUERY SELECT false, NULL::UUID, 'This hashtag is already owned by another user';
      RETURN;
    END IF;
    
    IF EXISTS (SELECT 1 FROM hashtags WHERE id = v_existing_id AND owner_id = p_user_id) THEN
      RETURN QUERY SELECT false, v_existing_id, 'You already own this hashtag';
      RETURN;
    END IF;
  END IF;
  
  SELECT COUNT(*) INTO v_active_count
  FROM hashtags
  WHERE owner_id = p_user_id
    AND type = 'personal'
    AND status = 'active';
  
  IF v_active_count >= 5 THEN
    RETURN QUERY SELECT false, NULL::UUID, 'You have reached your limit of 5 personal hashtags. Archive one to create another.';
    RETURN;
  END IF;
  
  IF v_existing_id IS NOT NULL THEN
    UPDATE hashtags
    SET owner_id = p_user_id,
        type = 'personal',
        is_personal = true,
        requires_approval = true,
        description = COALESCE(p_description, description),
        updated_at = now()
    WHERE id = v_existing_id
    RETURNING id INTO v_new_id;
  ELSE
    INSERT INTO hashtags (tag, type, owner_id, is_personal, requires_approval, description, status)
    VALUES (v_tag, 'personal', p_user_id, true, true, p_description, 'active')
    RETURNING id INTO v_new_id;
  END IF;
  
  RETURN QUERY SELECT true, v_new_id, NULL::TEXT;
END;
$$;

-- 17. archive_personal_hashtag
CREATE OR REPLACE FUNCTION public.archive_personal_hashtag(p_user_id uuid, p_hashtag_id uuid)
RETURNS TABLE(success boolean, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM hashtags WHERE id = p_hashtag_id AND owner_id = p_user_id) THEN
    RETURN QUERY SELECT false, 'You do not own this hashtag';
    RETURN;
  END IF;
  
  IF EXISTS (SELECT 1 FROM hashtags WHERE id = p_hashtag_id AND status = 'archived') THEN
    RETURN QUERY SELECT false, 'This hashtag is already archived';
    RETURN;
  END IF;
  
  UPDATE hashtags
  SET status = 'archived',
      archived_at = now(),
      requires_approval = false,
      updated_at = now()
  WHERE id = p_hashtag_id;
  
  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$;

-- 18. reactivate_personal_hashtag
CREATE OR REPLACE FUNCTION public.reactivate_personal_hashtag(p_user_id uuid, p_hashtag_id uuid)
RETURNS TABLE(success boolean, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active_count INTEGER;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM hashtags WHERE id = p_hashtag_id AND owner_id = p_user_id) THEN
    RETURN QUERY SELECT false, 'You do not own this hashtag';
    RETURN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM hashtags WHERE id = p_hashtag_id AND status = 'archived') THEN
    RETURN QUERY SELECT false, 'This hashtag is not archived';
    RETURN;
  END IF;
  
  SELECT COUNT(*) INTO v_active_count
  FROM hashtags
  WHERE owner_id = p_user_id
    AND type = 'personal'
    AND status = 'active';
  
  IF v_active_count >= 5 THEN
    RETURN QUERY SELECT false, 'You have reached your limit of 5 active hashtags. Archive one first.';
    RETURN;
  END IF;
  
  UPDATE hashtags
  SET status = 'active',
      archived_at = NULL,
      requires_approval = true,
      updated_at = now()
  WHERE id = p_hashtag_id;
  
  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$;

-- 19. get_user_owned_hashtags
CREATE OR REPLACE FUNCTION public.get_user_owned_hashtags(p_user_id uuid)
RETURNS TABLE(id uuid, tag text, description text, status text, usage_count integer, follower_count integer, pending_requests bigint, created_at timestamp with time zone, archived_at timestamp with time zone)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.tag,
    h.description,
    h.status::TEXT,
    COALESCE(h.usage_count, 0),
    COALESCE(h.follower_count, 0),
    (SELECT COUNT(*) FROM hashtag_usage_requests r 
     WHERE r.hashtag_id = h.id AND r.status = 'pending'),
    h.created_at,
    h.archived_at
  FROM hashtags h
  WHERE h.owner_id = p_user_id
    AND h.type = 'personal'
  ORDER BY h.status, h.created_at DESC;
END;
$$;

-- 20. get_pending_hashtag_requests
CREATE OR REPLACE FUNCTION public.get_pending_hashtag_requests(p_owner_id uuid)
RETURNS TABLE(request_id uuid, hashtag_id uuid, hashtag_tag text, post_id uuid, post_content text, requester_id uuid, requester_name text, requester_avatar text, created_at timestamp with time zone)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as request_id,
    r.hashtag_id,
    h.tag as hashtag_tag,
    r.post_id,
    p.content as post_content,
    r.requester_id,
    pr.display_name as requester_name,
    pr.avatar_url as requester_avatar,
    r.created_at
  FROM hashtag_usage_requests r
  JOIN hashtags h ON h.id = r.hashtag_id
  JOIN posts p ON p.id = r.post_id
  JOIN profiles pr ON pr.id = r.requester_id
  WHERE r.owner_id = p_owner_id
    AND r.status = 'pending'
  ORDER BY r.created_at DESC;
END;
$$;

-- 21. review_hashtag_request
CREATE OR REPLACE FUNCTION public.review_hashtag_request(p_owner_id uuid, p_request_id uuid, p_approved boolean, p_note text DEFAULT NULL::text)
RETURNS TABLE(success boolean, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hashtag_id UUID;
  v_post_id UUID;
  v_requester_id UUID;
BEGIN
  SELECT hashtag_id, post_id, requester_id INTO v_hashtag_id, v_post_id, v_requester_id
  FROM hashtag_usage_requests
  WHERE id = p_request_id AND owner_id = p_owner_id AND status = 'pending';
  
  IF v_hashtag_id IS NULL THEN
    RETURN QUERY SELECT false, 'Request not found or already reviewed';
    RETURN;
  END IF;
  
  UPDATE hashtag_usage_requests
  SET status = CASE WHEN p_approved THEN 'approved' ELSE 'denied' END,
      reviewed_at = now(),
      review_note = p_note
  WHERE id = p_request_id;
  
  IF p_approved THEN
    INSERT INTO post_hashtags (post_id, hashtag_id)
    VALUES (v_post_id, v_hashtag_id)
    ON CONFLICT (post_id, hashtag_id) DO NOTHING;
    
    UPDATE hashtags
    SET usage_count = usage_count + 1,
        last_used_at = now()
    WHERE id = v_hashtag_id;
  END IF;
  
  INSERT INTO notifications (user_id, type, title, message, link_url, payload)
  VALUES (
    v_requester_id,
    'hashtag_request_reviewed',
    CASE WHEN p_approved 
      THEN 'Your hashtag request was approved' 
      ELSE 'Your hashtag request was denied' 
    END,
    CASE WHEN p_approved
      THEN 'Your post can now use the hashtag'
      ELSE COALESCE(p_note, 'The hashtag owner declined your request')
    END,
    '/feed?post=' || v_post_id,
    jsonb_build_object(
      'request_id', p_request_id,
      'hashtag_id', v_hashtag_id,
      'approved', p_approved
    )
  );
  
  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$;

-- 22. toggle_hashtag_follow
CREATE OR REPLACE FUNCTION public.toggle_hashtag_follow(p_hashtag_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_was_following BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM hashtag_followers
    WHERE hashtag_id = p_hashtag_id AND user_id = p_user_id
  ) INTO v_was_following;

  IF v_was_following THEN
    DELETE FROM hashtag_followers
    WHERE hashtag_id = p_hashtag_id AND user_id = p_user_id;

    UPDATE hashtags
    SET follower_count = GREATEST(follower_count - 1, 0), updated_at = now()
    WHERE id = p_hashtag_id;

    RETURN false;
  ELSE
    INSERT INTO hashtag_followers (hashtag_id, user_id)
    VALUES (p_hashtag_id, p_user_id);

    UPDATE hashtags
    SET follower_count = follower_count + 1, updated_at = now()
    WHERE id = p_hashtag_id;

    RETURN true;
  END IF;
END;
$$;

-- 23. is_hashtag_reserved
CREATE OR REPLACE FUNCTION public.is_hashtag_reserved(p_name text)
RETURNS TABLE(is_reserved boolean, category reserved_category, reason text, can_be_used boolean)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT;
  v_found BOOLEAN := false;
BEGIN
  v_name := lower(regexp_replace(p_name, '^#', ''));

  FOR is_reserved, category, reason, can_be_used IN
    SELECT true, rh.category, rh.reason, rh.can_be_used
    FROM reserved_hashtags rh
    WHERE rh.name = v_name
  LOOP
    v_found := true;
    RETURN NEXT;
  END LOOP;

  IF NOT v_found THEN
    is_reserved := false;
    category := NULL;
    reason := NULL;
    can_be_used := true;
    RETURN NEXT;
  END IF;
END;
$$;

-- 24. request_hashtag_usage
CREATE OR REPLACE FUNCTION public.request_hashtag_usage(p_requester_id uuid, p_hashtag_id uuid, p_post_id uuid)
RETURNS TABLE(success boolean, request_id uuid, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
  v_new_request_id UUID;
  v_hashtag_tag TEXT;
  v_requester_name TEXT;
BEGIN
  SELECT owner_id, tag INTO v_owner_id, v_hashtag_tag
  FROM hashtags
  WHERE id = p_hashtag_id AND type = 'personal' AND requires_approval = true;
  
  IF v_owner_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, 'This hashtag does not require approval';
    RETURN;
  END IF;
  
  IF v_owner_id = p_requester_id THEN
    RETURN QUERY SELECT false, NULL::UUID, 'You own this hashtag, no approval needed';
    RETURN;
  END IF;
  
  IF EXISTS (SELECT 1 FROM hashtag_usage_requests WHERE hashtag_id = p_hashtag_id AND post_id = p_post_id) THEN
    RETURN QUERY SELECT false, NULL::UUID, 'A request for this hashtag on this post already exists';
    RETURN;
  END IF;
  
  INSERT INTO hashtag_usage_requests (hashtag_id, post_id, requester_id, owner_id)
  VALUES (p_hashtag_id, p_post_id, p_requester_id, v_owner_id)
  RETURNING id INTO v_new_request_id;
  
  SELECT display_name INTO v_requester_name FROM profiles WHERE id = p_requester_id;
  
  INSERT INTO notifications (user_id, type, title, message, link_url, payload)
  VALUES (
    v_owner_id,
    'hashtag_request',
    'New hashtag usage request',
    v_requester_name || ' wants to use #' || v_hashtag_tag,
    '/dna/settings/hashtags',
    jsonb_build_object(
      'request_id', v_new_request_id,
      'hashtag_id', p_hashtag_id,
      'post_id', p_post_id,
      'requester_id', p_requester_id
    )
  );
  
  RETURN QUERY SELECT true, v_new_request_id, NULL::TEXT;
END;
$$;