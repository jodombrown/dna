# Pause signups until October 15, 2026, with a beta access request loop

Signup closes. Anyone landing on the sign up tab sees the beta story and a request form. Requests land in the existing waitlist. You approve, then send an access email carrying a one-click sign-in link. Once they use it they set a password and continue into orientation.

## 1. Signup is paused

- On `/auth`, the Sign up tab no longer renders the account form. It renders a beta notice:
  - What it says: DNA is in closed beta from August 15 to October 15, 2026, new accounts are granted by invitation during this window, and public launch follows into Detty December in Accra, Ghana.
  - A "Learn more about beta in-app testing" link to `/beta`.
  - The request form directly below it, so the visitor never has to hunt for the next step.
- Sign in stays untouched and fully open, including LinkedIn.
- The pause is date-driven: after October 15, 2026 the Sign up tab returns to the open account form on its own, no code change and no deploy needed. A database flag can also reopen it early.
- The standalone `/beta-access` page keeps working and shows the same form.

## 2. The request form

Rewritten from the current one so it captures what you need to judge a request:

- Full name (required)
- Email (required, validated)
- Country (required, searchable list, same control used elsewhere in the app)
- LinkedIn URL (optional)
- Why you want in (optional, 2000 char cap)

On submit it writes to `beta_waitlist` with `status = 'pending'`. A duplicate email gets a calm "you are already on the list" instead of an error. Confirmation state tells them what happens next: you review, and if granted they get an email with a sign-in link.

## 3. Admin: approve, then send

In Admin > Waitlist:

- Approve stays what it is today: a status change, no email. Nothing is sent by accident.
- A separate **Send access email** action appears on any entry whose status is `approved`. It is the only thing that emails anyone.
- The row shows when the access email was last sent and by whom, so a second send is a deliberate re-send rather than a guess. Re-send is allowed.
- The country and LinkedIn columns show in the table and the review drawer, and are included in the CSV export.

## 4. The access email and the sign-in loop

A new edge function, admin-only, does the whole send:

1. Confirms the caller is an admin and that the entry is `approved` and not archived.
2. Mints a one-click link for that email through the Supabase admin API. If no account exists yet the link creates it on first use; if one already exists it is a plain sign-in link, so a re-send never fails on "user already registered".
3. Sends the email through Resend from the DNA sender: subject along the lines of "Your DNA beta access is open", short body naming the beta window, one button, and a note that the link is single use and expires.
4. Stamps `last_invite_sent_at` and `last_invite_sent_by` on the waitlist row and writes an admin audit entry.

Where the link lands: `/onboarding/reset-password-complete`, the existing screen that sets a password on a session that arrived by link. From there the normal onboarding guard takes them into orientation. No new screen is invented for this.

## Technical notes

- Files to change: `src/pages/Auth.tsx` (paused Sign up tab), `src/components/auth/BetaAccessForm.tsx` (rewritten fields, country + LinkedIn), `src/pages/admin/WaitlistManagement.tsx` (send action, new columns, export), plus a small shared helper holding the beta window dates and the pause check so the date exists in exactly one place.
- New edge function `send-beta-access-granted`, modelled on the existing `send-magic-link` function's admin-guard and Resend setup. `RESEND_API_KEY` is already configured.
- No schema change needed: `beta_waitlist` already carries `country`, `linkedin_url`, `last_invite_sent_at`, `last_invite_sent_by`, and `archived_at`.
- One `[SUPABASE SQL]` block for you to run in the SQL Editor: set `feature_flags.REGISTRATION_ENABLED` to false so the pause is also enforced from the database, not only by date.
- `is_signup_approved` stays in place, unused, so the approved-email signup variant remains available later without a migration.
- Edge function deploy is separate from a repo merge. I write the function; deploying it is its own step, and the loop cannot send until it is deployed.
