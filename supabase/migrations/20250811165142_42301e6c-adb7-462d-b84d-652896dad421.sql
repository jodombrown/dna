-- Cleanup migration: remove all user profiles and all associated user-generated content
-- Keeps marketing/mock site content (static in code), does not touch auth.users

DO $$
DECLARE
  has_posts boolean := to_regclass('public.posts') is not null;
  has_events boolean := to_regclass('public.events') is not null;
  has_communities boolean := to_regclass('public.communities') is not null;
BEGIN
  -- Collect all current profile ids
  CREATE TEMP TABLE tmp_user_ids ON COMMIT DROP AS
    SELECT id FROM public.profiles;

  -- If none, exit early
  IF (SELECT count(*) FROM tmp_user_ids) = 0 THEN
    RAISE NOTICE 'No profiles found to delete.';
    RETURN;
  END IF;

  -- Precompute dependent entity ids
  IF has_posts THEN
    CREATE TEMP TABLE tmp_post_ids ON COMMIT DROP AS
      SELECT id FROM public.posts WHERE author_id IN (SELECT id FROM tmp_user_ids);
  END IF;

  IF has_events THEN
    CREATE TEMP TABLE tmp_event_ids ON COMMIT DROP AS
      SELECT id FROM public.events WHERE created_by IN (SELECT id FROM tmp_user_ids);
  END IF;

  IF has_communities THEN
    CREATE TEMP TABLE tmp_community_ids ON COMMIT DROP AS
      SELECT id FROM public.communities WHERE created_by IN (SELECT id FROM tmp_user_ids);
  END IF;

  -- Contact requests
  IF to_regclass('public.contact_requests') IS NOT NULL THEN
    DELETE FROM public.contact_requests
    WHERE sender_id IN (SELECT id FROM tmp_user_ids)
       OR receiver_id IN (SELECT id FROM tmp_user_ids);
  END IF;

  -- Contributions and badges
  IF to_regclass('public.user_contributions') IS NOT NULL THEN
    DELETE FROM public.user_contributions WHERE user_id IN (SELECT id FROM tmp_user_ids);
  END IF;
  IF to_regclass('public.user_badges') IS NOT NULL THEN
    DELETE FROM public.user_badges WHERE user_id IN (SELECT id FROM tmp_user_ids);
  END IF;

  -- Notifications
  IF to_regclass('public.notifications') IS NOT NULL THEN
    DELETE FROM public.notifications WHERE user_id IN (SELECT id FROM tmp_user_ids);
  END IF;

  -- Comments (by author and on posts authored by these users)
  IF to_regclass('public.comments') IS NOT NULL THEN
    IF has_posts THEN
      DELETE FROM public.comments WHERE post_id IN (SELECT id FROM tmp_post_ids);
    END IF;
    DELETE FROM public.comments WHERE author_id IN (SELECT id FROM tmp_user_ids);
  END IF;

  -- Posts by users
  IF has_posts THEN
    DELETE FROM public.posts WHERE id IN (SELECT id FROM tmp_post_ids);
  END IF;

  -- Communities and related
  IF to_regclass('public.community_memberships') IS NOT NULL THEN
    DELETE FROM public.community_memberships WHERE user_id IN (SELECT id FROM tmp_user_ids);
  END IF;
  IF to_regclass('public.community_posts') IS NOT NULL THEN
    DELETE FROM public.community_posts WHERE author_id IN (SELECT id FROM tmp_user_ids);
  END IF;
  IF has_communities THEN
    DELETE FROM public.communities WHERE id IN (SELECT id FROM tmp_community_ids);
  END IF;

  -- Conversations/messages
  IF to_regclass('public.conversations') IS NOT NULL THEN
    DELETE FROM public.conversations
    WHERE user_1_id IN (SELECT id FROM tmp_user_ids)
       OR user_2_id IN (SELECT id FROM tmp_user_ids);
  END IF;

  -- Collaboration spaces and memberships
  IF to_regclass('public.collaboration_memberships') IS NOT NULL THEN
    DELETE FROM public.collaboration_memberships WHERE user_id IN (SELECT id FROM tmp_user_ids);
  END IF;
  IF to_regclass('public.collaboration_spaces') IS NOT NULL THEN
    DELETE FROM public.collaboration_spaces WHERE created_by IN (SELECT id FROM tmp_user_ids);
  END IF;

  -- Contribution cards
  IF to_regclass('public.contribution_cards') IS NOT NULL THEN
    DELETE FROM public.contribution_cards WHERE created_by IN (SELECT id FROM tmp_user_ids);
  END IF;

  -- Events and related tables
  IF to_regclass('public.event_registrations') IS NOT NULL THEN
    DELETE FROM public.event_registrations WHERE user_id IN (SELECT id FROM tmp_user_ids);
  END IF;
  IF to_regclass('public.event_waitlist') IS NOT NULL THEN
    DELETE FROM public.event_waitlist WHERE user_id IN (SELECT id FROM tmp_user_ids);
  END IF;
  IF to_regclass('public.event_checkins') IS NOT NULL THEN
    DELETE FROM public.event_checkins WHERE by_profile_id IN (SELECT id FROM tmp_user_ids);
  END IF;
  IF has_events THEN
    IF to_regclass('public.event_analytics') IS NOT NULL THEN
      DELETE FROM public.event_analytics WHERE event_id IN (SELECT id FROM tmp_event_ids);
    END IF;
    IF to_regclass('public.event_blasts') IS NOT NULL THEN
      DELETE FROM public.event_blasts WHERE event_id IN (SELECT id FROM tmp_event_ids);
    END IF;
    IF to_regclass('public.event_ticket_holds') IS NOT NULL THEN
      DELETE FROM public.event_ticket_holds
      WHERE event_id IN (SELECT id FROM tmp_event_ids)
         OR user_id IN (SELECT id FROM tmp_user_ids)
         OR ticket_type_id IN (
            SELECT id FROM public.event_ticket_types WHERE event_id IN (SELECT id FROM tmp_event_ids)
         );
    END IF;
    IF to_regclass('public.event_registrations') IS NOT NULL THEN
      DELETE FROM public.event_registrations WHERE event_id IN (SELECT id FROM tmp_event_ids);
    END IF;
    IF to_regclass('public.event_waitlist') IS NOT NULL THEN
      DELETE FROM public.event_waitlist WHERE event_id IN (SELECT id FROM tmp_event_ids);
    END IF;
    IF to_regclass('public.event_checkins') IS NOT NULL THEN
      DELETE FROM public.event_checkins WHERE registration_id IN (
        SELECT id FROM public.event_registrations WHERE event_id IN (SELECT id FROM tmp_event_ids)
      );
    END IF;
    IF to_regclass('public.event_ticket_types') IS NOT NULL THEN
      DELETE FROM public.event_ticket_types WHERE event_id IN (SELECT id FROM tmp_event_ids);
    END IF;
    DELETE FROM public.events WHERE id IN (SELECT id FROM tmp_event_ids);
  END IF;

  -- ADIN tables
  IF to_regclass('public.adin_connection_matches') IS NOT NULL THEN
    DELETE FROM public.adin_connection_matches
    WHERE user_id IN (SELECT id FROM tmp_user_ids)
       OR matched_user_id IN (SELECT id FROM tmp_user_ids);
  END IF;
  IF to_regclass('public.adin_connection_signals') IS NOT NULL THEN
    DELETE FROM public.adin_connection_signals
    WHERE source_user IN (SELECT id FROM tmp_user_ids)
       OR target_user IN (SELECT id FROM tmp_user_ids);
  END IF;
  IF to_regclass('public.adin_contributor_requests') IS NOT NULL THEN
    DELETE FROM public.adin_contributor_requests WHERE user_id IN (SELECT id FROM tmp_user_ids);
  END IF;
  IF to_regclass('public.adin_signals') IS NOT NULL THEN
    DELETE FROM public.adin_signals WHERE user_id IN (SELECT id FROM tmp_user_ids)
                                  OR created_by IN (SELECT id FROM tmp_user_ids);
  END IF;

  -- Admin data attached to users
  IF to_regclass('public.admin_notifications') IS NOT NULL THEN
    DELETE FROM public.admin_notifications WHERE admin_id IN (SELECT id FROM tmp_user_ids);
  END IF;
  IF to_regclass('public.admin_logs') IS NOT NULL THEN
    DELETE FROM public.admin_logs WHERE admin_id IN (SELECT id FROM tmp_user_ids);
  END IF;
  IF to_regclass('public.admin_users') IS NOT NULL THEN
    DELETE FROM public.admin_users WHERE user_id IN (SELECT id FROM tmp_user_ids);
  END IF;

  -- Error logs
  IF to_regclass('public.error_logs') IS NOT NULL THEN
    DELETE FROM public.error_logs WHERE user_id IN (SELECT id FROM tmp_user_ids);
  END IF;

  -- Finally, remove the profiles themselves
  DELETE FROM public.profiles WHERE id IN (SELECT id FROM tmp_user_ids);
END $$;