# Social sign in: Google, Apple, Microsoft, LinkedIn

Today `/auth` has email + password on both tabs and one "Continue with LinkedIn" button that shows only on the Sign in tab. This adds Google, Apple, and Microsoft alongside it, on both tabs, and makes the LinkedIn path reliable.

Two halves: what I change in the app, and what only you can do in the provider consoles and the Supabase dashboard. Providers are configured in your own Supabase project, which is outside my lane, so those steps are yours with exact values supplied.

## Part 1: what I build

**New `src/components/auth/SocialAuthButtons.tsx`**

- Four buttons in one stack: Continue with Google, Continue with Apple, Continue with Microsoft, Continue with LinkedIn.
- One shared handler calling `supabase.auth.signInWithOAuth` with the provider id (`google`, `apple`, `azure`, `linkedin_oidc`), `redirectTo` pointing at a single callback route, and the post-auth destination carried in the URL so `?redirect=` and `state.from` survive the round trip.
- A button only renders if its provider is switched on, read from one small config list, so nothing dead shows before you finish a provider's console setup.
- Per-button pending state, error surfaced through the existing toast, no silent failure.

**New `src/pages/AuthCallback.tsx` and `/auth/callback` route**

- Waits for the Supabase client to finish the PKCE exchange, then sends the user to the saved destination. Brand new accounts fall through to `OnboardingGuard`, which already routes anyone without `n_at` into orientation, so a Google or Apple signup lands in the same orientation flow as an email signup.
- Failure state: a clear message plus a link back to `/auth`, never a blank screen or a throw.

**`src/pages/Auth.tsx`**

- Renders `SocialAuthButtons` on both tabs (currently sign in only), above the "Or continue with" divider, with the existing inline LinkedIn button and its inline SVG removed in favour of the shared component. Nothing else on the page changes.

Icons come from a small local set of brand marks inside the new component. No new dependency (a frozen lockfile makes that a merge blocker).

## Part 2: your steps, in order

Each provider needs an app on their side, then the client id and secret pasted into Supabase.

**First, once: Supabase URL configuration**

Supabase dashboard, Authentication, URL Configuration.

- Site URL: `https://diasporanetwork.africa`
- Redirect URLs, add all of these: `https://diasporanetwork.africa/auth/callback`, `https://www.diasporanetwork.africa/auth/callback`, `https://diaspora-network-of-africa.lovable.app/auth/callback`, `https://id-preview--866bbb52-dc1d-4eb7-807c-62f17d69e56e.lovable.app/auth/callback`, `http://localhost:8080/auth/callback`

The one callback every provider needs is: `https://ybhssuehmfnxrzneobok.supabase.co/auth/v1/callback`

**Google (about 10 minutes)**

1. Google Cloud console, create or pick a project.
2. APIs and Services, OAuth consent screen. External. App name, support email, your logo. Add authorized domain `diasporanetwork.africa` and `supabase.co`.
3. Scopes: `openid`, `userinfo.email`, `userinfo.profile`. Nothing sensitive, so no Google review needed.
4. Credentials, Create credentials, OAuth client ID, Web application.
5. Authorized redirect URI: the Supabase callback above.
6. Copy client ID and secret into Supabase, Authentication, Providers, Google, enable, save.
7. Publish the consent screen so it is not limited to test users.

**Microsoft (about 15 minutes, provider is named Azure in Supabase)**

1. Microsoft Entra admin center, App registrations, New registration.
2. Supported account types: accounts in any organizational directory and personal Microsoft accounts. That is what lets both work and personal Outlook or Hotmail addresses in.
3. Redirect URI, platform Web, value is the Supabase callback above.
4. Certificates and secrets, New client secret, copy the value immediately (it is shown once).
5. Copy the Application (client) ID and that secret into Supabase, Authentication, Providers, Azure, enable. Leave Azure Tenant URL blank for the multi-tenant plus personal setup.

**Apple (longest, and it has a cost)**

Apple requires a paid Apple Developer Program membership, 99 USD a year. If you do not have one, tell me and I ship Google, Microsoft, and LinkedIn now and Apple lands in a later pass.

1. Apple Developer, Certificates, Identifiers and Profiles, Identifiers. Register an App ID first if you have none.
2. Register a new Services ID, for example `africa.diasporanetwork.web`. This value is your client id.
3. Configure it: pick your primary App ID, domain `diasporanetwork.africa` plus `ybhssuehmfnxrzneobok.supabase.co`, return URL is the Supabase callback above.
4. Keys, create a new key with Sign in with Apple enabled, download the `.p8` once. Note the Key ID and your Team ID.
5. Supabase, Authentication, Providers, Apple, enable. Client ID is the Services ID. For the secret, Supabase asks for a generated JWT built from Team ID, Key ID, and the `.p8` contents; the provider page links its generator. That JWT expires at most every six months, so it is a recurring renewal, which I will note in the repo docs.
6. Apple only returns a name on the very first authorization, and users may hide their real email behind a relay address. Orientation already asks for name and place, so nothing breaks; the profile just starts emptier.

**LinkedIn (verifying what already exists)**

1. LinkedIn Developers, your app, Products tab: "Sign In with LinkedIn using OpenID Connect" must be added. The older "Sign In with LinkedIn" v1 product no longer issues the scopes `linkedin_oidc` needs and is the usual cause of a silent failure.
2. Auth tab, Authorized redirect URLs: the Supabase callback above.
3. Scopes should read `openid`, `profile`, `email`.
4. The app must be associated with a verified LinkedIn Page, otherwise consent errors for anyone outside your own account.
5. Confirm client ID and secret in Supabase, Authentication, Providers, LinkedIn (OIDC) match the LinkedIn app.

**Then, together**

Tell me which providers are live and I flip them on in the config list, one line each. Then we walk each button end to end at 375px and 1440px: new account into orientation, returning account straight to the feed.

## Notes

- One email, one account. If someone signs up with a password and later uses Google on the same address, Supabase links them only when the provider's email is verified; otherwise they get a distinct identity. Worth knowing before we test with the same address twice.
- `handle_new_user` already creates the profile row on any new auth user, so OAuth signups need no database change. No migration in this cycle.
- Design system: existing `Button` and tokens only, no arbitrary values, no new colour. Brand marks are inline SVG inside the buttons component.

Files touched: `src/components/auth/SocialAuthButtons.tsx` (new), `src/pages/AuthCallback.tsx` (new), `src/App.tsx` (one route), `src/pages/Auth.tsx`, plus a short setup doc under `docs/`.
