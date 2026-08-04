# Let a throwaway address complete signup

You already have everything needed to reach the signup form. The only blocker for an address that cannot receive mail is the email confirmation step.

## What you can do right now, no changes needed

Open this and the signup tab unlocks for your browser only (the key is remembered in localStorage). Everyone else still sees the August 15 notice.

`/auth?mode=signup&key=dna-early-1815`

## The one change to make

Turn on auto-confirm for email signups, temporarily, so a fake address does not need to click a link. With it on, `signUp()` returns a live session and you land straight in orientation, exactly as a real user would after confirming.

Steps:

1. Read the project's current auth settings and report whether email confirmation is on today.
2. Enable auto-confirm email.
3. You run the full journey: signup form, orientation, first post.
4. Tell me when you are done and I turn auto-confirm back off in the same session.

## What this affects while it is on

- Any signup during the window skips email verification. The signup gate is still closed to the public until August 15, and the bypass key is required to see the form, so exposure is small but not zero.
- Password reset by email is unaffected.
- No code changes. This is an auth setting, reverted the moment you say the test is finished.

## Technical notes

- Setting: GoTrue `auto_confirm_email`, applied with the auth config tool against project `ybhssuehmfnxrzneobok`. Nothing in `src/` changes.
- `src/config/featureFlags.ts` stays as is: `SIGNUPS_OPEN_AT` remains August 15, 2026 at 9:00 am PDT, and `SIGNUP_BYPASS_KEY` remains `dna-early-1815`.
- I will read the setting back after each flip rather than trusting the success response, and I will name the value I read.
