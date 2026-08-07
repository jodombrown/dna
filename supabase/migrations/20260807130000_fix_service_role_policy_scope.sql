-- Fix H1 from the 2026-08-07 codebase bug audit: RLS policies named
-- "Service role manages..." / "System can manage/insert/update/delete..."
-- were created with no `TO` clause (defaulting to `PUBLIC`) or scoped to
-- "any authenticated user" (`auth.uid() IS NOT NULL`) instead of the
-- service role their name implies. Since Postgres OR-combines permissive
-- policies together, each of these silently granted access to any
-- authenticated (or, for badge_counts, even anon) caller, defeating the
-- co-located "own row only" policies on the same tables.
--
-- Note on scope: `entity_vectors`' equivalent write policies
-- ("System can insert/update/delete entity vectors") were already dropped
-- with no replacement by 20260218053744_e5fb06ef-...sql ("FIX 5"),
-- correctly locking those writes down to service_role only (which bypasses
-- RLS entirely via the BYPASSRLS role attribute) — no action needed there.
-- `user_vectors`' SELECT policy was likewise already corrected by that
-- same migration (superseded again by 20260713001028_...sql) to
-- `user_id = auth.uid() OR admin`. What was NOT fixed anywhere in the
-- migration history is `user_vectors`' three write policies
-- ("System can insert/update/delete user vectors", from
-- 20251116072614_...sql), which remain scoped to "any authenticated user"
-- to this day — any signed-in user can overwrite or delete any other
-- user's personalization vector. The one client call site
-- (`saveUserVector` in src/services/embeddingService.ts) is dead code, not
-- imported anywhere in the app, so tightening this to service_role is
-- fully non-breaking.
--
-- Fix: scope badge_counts' and user_vectors' write policies to
-- `service_role`, matching the correctly-scoped `adin_queries_all_service_role`
-- policy elsewhere in the migration history and the `entity_vectors`
-- precedent above.
--
-- See docs/audits/codebase-bug-audit-2026-08-07.md, finding H1.

ALTER POLICY "Service role manages badge counts" ON public.badge_counts TO service_role;

ALTER POLICY "System can insert user vectors" ON public.user_vectors TO service_role;
ALTER POLICY "System can update user vectors" ON public.user_vectors TO service_role;
ALTER POLICY "System can delete user vectors" ON public.user_vectors TO service_role;
