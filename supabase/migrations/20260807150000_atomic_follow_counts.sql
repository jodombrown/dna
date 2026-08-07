-- Fix M6 (part 1) from the 2026-08-07 codebase bug audit: follower_count/
-- following_count on profiles were maintained by the client
-- (src/hooks/useFollow.ts) doing a read-then-write of a JS-computed value
-- (`counts.followerCount - 1`, etc.) instead of an atomic DB-side
-- increment. Two concurrent follow/unfollow actions (double-click, two
-- tabs, or two different followers acting near-simultaneously) can each
-- read the same stale count and write back the same "+1", losing an
-- increment — and the errors were silently swallowed
-- (`.catch(() => {})`), so counts could drift indefinitely with no
-- visible failure.
--
-- Fix: a trigger on user_follows maintains both counters atomically via
-- `SET count = count + 1` (a single UPDATE statement, safe under
-- concurrent writes via row-level locking) — the same pattern already
-- used correctly for unread_count in groupMessageService's messaging
-- triggers. src/hooks/useFollow.ts no longer writes to profiles directly;
-- it only inserts/deletes the user_follows row and refetches the counts.
--
-- See docs/audits/codebase-bug-audit-2026-08-07.md, finding M6.

CREATE OR REPLACE FUNCTION public.sync_follow_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET follower_count = COALESCE(follower_count, 0) + 1 WHERE id = NEW.followed_id;
    UPDATE public.profiles SET following_count = COALESCE(following_count, 0) + 1 WHERE id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET follower_count = GREATEST(COALESCE(follower_count, 0) - 1, 0) WHERE id = OLD.followed_id;
    UPDATE public.profiles SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0) WHERE id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_follow_counts ON public.user_follows;
CREATE TRIGGER trg_sync_follow_counts
AFTER INSERT OR DELETE ON public.user_follows
FOR EACH ROW EXECUTE FUNCTION public.sync_follow_counts();
