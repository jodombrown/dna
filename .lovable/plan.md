# Open signup to everyone today

Signup on `/auth` currently only completes for an email you approved in Admin > Waitlist, and the Request access tab still announces "Signups open August 15, 2026 at 9:00 am PDT". Both go.

## What changes

**Sign up tab (/auth?mode=signup)**

- The email approval lookup is gone. Full name, password, and confirm password are visible from the start, so any visitor can create an account and continue into orientation.
- "This email is not approved yet" and the "Request access" nudge are removed from that tab.
- Button reads "Create account" throughout.

**Request access tab**

- Stays, unchanged in function, for people who prefer to reach out. The dated line "Beta access opens August 15, 2026..." and the "Signups open ..." heading are replaced with copy that reflects open signup and points to the Sign up tab.

**Sign in tab**

- Untouched, including Continue with LinkedIn.

**Admin > Waitlist**

- Unchanged. Existing requests and the approve action stay; approval simply no longer gates signup.

## What is not part of this

No database change. The `is_signup_approved` function stays in the database, unused, so approval-only signup can be turned back on later without a migration. Supabase Auth signup itself is already enabled, so no Supabase dashboard setting needs flipping.

## Technical notes

Files to edit:

- `src/components/auth/SignUpApprovalGate.tsx`: drop the `is_signup_approved` RPC call, the `ApprovalState` machine, and the locked/unlocked branch. It becomes a plain signup form (email, full name, password, confirm) keeping the existing validation, `signUp`, toast, and `navigate('/onboarding')` flow. The `onRequestAccess` prop is removed since nothing calls it.
- `src/pages/Auth.tsx`: drop the now-unused `onRequestAccess` prop; update the sign up subtitle from "Create your account with an approved email" to "Create your account".
- `src/components/auth/BetaAccessForm.tsx`: remove the `SIGNUPS_OPEN_LABEL` import and the two dated lines, replacing them with open-signup copy.
- `src/config/featureFlags.ts`: mark `SIGNUPS_OPEN_AT` / `SIGNUPS_OPEN_LABEL` / `areSignupsOpen` / `SIGNUP_BYPASS_KEY` as retired and remove them if nothing else imports them (a repo-wide check runs before deleting).

Design system: existing `Button` / `Input` / `Label`, `text-body` / `text-meta` tokens only, no arbitrary values, no new tokens. Copy carries no em dashes.

Verification before calling it done: typecheck, then walk `/auth?mode=signup` at 375px and 1440px confirming the fields are visible with no approval check, and confirm the Request access and Sign in tabs still render.
