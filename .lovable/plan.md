## What changes

Public signup closes now and reopens by itself at the announced moment. In the meantime the signup route shows the announcement plus a Beta Access request form whose entries land in the existing Admin > Waitlist tracker. Login, password reset, and every authenticated surface stay untouched.

## 1. The dated gate

New in `src/config/featureFlags.ts`:

- `SIGNUPS_OPEN_AT` = August 15, 2026, 12:00 noon **UTC** (say the word if you want a different zone, for example New York or London, and I will set that instant instead).
- `areSignupsOpen()` returns `Date.now() >= SIGNUPS_OPEN_AT`. No deploy needed on the day: the notice disappears and signup opens on the next page load after the moment passes.
- `WAITLIST_MODE` stays `false` and is left alone. This gate is separate and does not resurrect the waitlist funnel.

`src/pages/Auth.tsx`: when the signup tab is requested and signups are closed and the bypass is not held, render the Beta Access screen instead of the signup form. The sign-in tab renders exactly as it does today, and the "Sign up" toggle becomes "Request beta access".

## 2. Your bypass

`/auth?mode=signup&key=<token>` sets a flag in `localStorage` so you keep signup access across reloads on that browser. A constant in the frontend is obscurity, not security: anyone reading the bundle can find it. It is fine for holding back a launch date, it is not an access control, and I will say so in a comment. If you would rather it be real, the alternative is an admin-only invite row, which is a bigger build.

## 3. The Beta Access screen

New `src/pages/BetaAccess.tsx`, route `/beta-access`, plus the same component rendered inline on the closed signup tab so nobody has to navigate twice.

- Heading: "Signups open August 15, 2026 at 12pm noon" (sentence case, no em dashes).
- Body: one line on what beta access means and what happens next.
- A live countdown is optional; say if you want it and I will add a quiet one.
- Fields: first name, last name, email, location (optional), and one short "why you want in" box. Client-side validation mirrors the database constraint already on the table (valid email, name under 160 chars, message under 2000).
- Submit inserts into `beta_waitlist` with `status = 'pending'`. I verified the live policy: anon may insert exactly this shape, so no migration and no schema change is needed.
- Duplicate email returns a friendly "you are already on the list" instead of an error.
- Confirmation email fires through the existing `send-universal-email` function, same pattern the waitlist page uses, and a failure there never blocks the signup.
- Success state replaces the form. No error surface for a visitor.

## 4. Tracking

Nothing new to build. `Admin > Waitlist` (`src/pages/admin/WaitlistManagement.tsx`) already reads `beta_waitlist` with search, status filter, notes, and CSV export, so requests appear there the moment they arrive.

## 5. Copy sweep

Public "Sign up" CTAs that point at `/auth?mode=signup` continue to work: they land on the announcement, which is the correct destination. I will not mass-rename them, so the labels revert to correct on their own on August 15. Flag it if you would rather they read "Request beta access" until then.

## Technical notes

- Files touched: `src/config/featureFlags.ts`, `src/pages/Auth.tsx`, `src/App.tsx` (one route), new `src/pages/BetaAccess.tsx`, new `src/components/auth/BetaAccessForm.tsx`.
- No database migration, no RLS change, no edge function deploy.
- Existing `src/components/auth/BetaWaitlist.tsx` carries stale December 2025 beta dates. It is a separate modal; I will leave it alone unless you want it retired in the same pass, in which case tell me and I will name what I remove.
- Design system: `Section` / `Container` / `Stack`, DNA type tokens only, no arbitrary values, no raw hex.
- Verification: typecheck, lint, token and scale gates, and I will confirm a real row lands in `beta_waitlist` and read it back rather than trusting a success toast.
