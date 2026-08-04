# Approved-only signup on /auth

Three tabs on `/auth`: **Sign up**, **Request access**, **Sign in**. Sign up only completes for an email you have approved in Admin > Waitlist. Nothing changes anywhere else on the platform: no new signup entry point on any other page.

## What you get

**Sign up tab (new, /auth only)**
- Email first. On blur, the form asks the database whether that email is approved.
- Approved: the rest of the form unlocks (name, password, confirm) and signup proceeds into orientation exactly as today.
- Not approved: the form stays locked with one line, "This email is not approved yet," and a link to the Request access tab. No hint about whether the email exists.

**Request access tab**
- The existing beta request form, unchanged. Still writes to the waitlist tracker.

**Sign in tab**
- Unchanged, including Continue with LinkedIn.

**Admin > Waitlist**
- An "Approve for signup" action that sets a request to approved. Approved rows are what the signup gate reads. Rejecting or archiving removes the approval.

For your own throwaway test account: approve the address in Admin > Waitlist first, then sign up with it.

## Honest limit, and what closes it

The check above lives in the browser. It is the gate a real visitor meets, and it is not a security boundary: anyone can call the signup endpoint directly and bypass the tab. Closing that needs two things outside Lovable's lane, and I will hand you both blocks rather than pretend a client check is enforcement:

1. A small server function that verifies approval and creates the account, using the admin key server-side. I can write it into the repo; I cannot deploy it, and a merge is not a deploy.
2. Turning off open signup in Supabase Auth settings so the direct endpoint stops accepting new users.

Say the word and I include step 1's code plus the exact Supabase setting to flip. Until both are done, treat the gate as a product gate, not a lock.

## Technical notes

Files edited:
- `src/pages/Auth.tsx`: three-way tab state replacing the two-way `isSignUp` boolean, driven by `?mode=signup|request|signin`. Existing `?mode=signup` deep links keep working. Approval check gates the password fields.
- `src/components/auth/SignUpApprovalGate.tsx` (new): email field, approval lookup, locked/unlocked states.
- `src/pages/admin/WaitlistManagement.tsx`: approve action and an approved filter option.
- `src/config/featureFlags.ts`: the dated gate stops driving the signup tab. `SIGNUPS_OPEN_AT` and the bypass key stay in the file for the public announcement copy, unused by the tab logic.

Migration (one, additive):
- `public.is_signup_approved(p_email text) returns boolean`, SECURITY DEFINER, `set search_path = public`, `REVOKE EXECUTE FROM PUBLIC` then `GRANT EXECUTE TO anon, authenticated`. Returns true only for a `beta_waitlist` row with `status = 'approved'` and `archived_at is null`, matched on lowercased email. Returns a boolean only, never a row, so it cannot be used to enumerate the waitlist.
- No RLS change. `beta_waitlist` stays admin-read, anon-insert as it is now.

Design system: `text-body` / `text-meta` tokens only, existing `Button` / `Input` / `Label` primitives, no arbitrary values, tabs reuse the current segmented control markup extended to three cells.

Verification before I call it done: read the function out of the live catalog, run it against one approved and one unapproved address and print both results, then walk the three tabs at 375px and 1440px.
