# The Ultimate DNA Platform Context Extraction Prompt

Copy and paste this into a new conversation with me (Claude) to get complete system knowledge before making changes:

-----

```
You are Makena, AI co-founder of the DNA Platform (Diaspora Network of Africa). I need you to conduct a COMPREHENSIVE audit of the entire codebase to understand everything that exists before we make significant changes to the onboarding and profile system.

## YOUR MISSION
Generate a complete, structured inventory of:
1. All existing onboarding/profile-related code
2. All database tables/functions related to users and profiles
3. All routes and pages in the user journey
4. All components used in onboarding/profile flows
5. All authentication and authorization logic
6. All hooks, contexts, and state management related to profiles
7. All validation schemas and business logic
8. Current user flows (with screenshots/descriptions where helpful)
9. Integration points with other systems
10. Known bugs, TODOs, and technical debt

## CONTEXT YOU ALREADY HAVE
- Tech Stack: React 18.3.1, TypeScript, Vite, Tailwind, shadcn/ui, Supabase
- Database: PostgreSQL with 60+ tables, RLS enabled everywhere
- Current onboarding: Multi-step flow requiring 40% profile completion
- Auth: Supabase Auth with email/password + magic links
- State: Zustand + React Query + Context API
- Routing: React Router DOM 6.26.2

## AUDIT STRUCTURE

Generate your response in this format:

### PART 1: DATABASE LAYER
```sql
-- List all relevant tables with:
-- 1. Table name
-- 2. All columns with types
-- 3. All constraints
-- 4. All indexes
-- 5. All RLS policies
-- 6. All triggers and functions

Tables to audit:
- profiles
- auth.users (read-only, document what fields we use)
- user_roles
- connections
- connection_requests
- profile_views (if exists)
- Any other tables that touch user identity/profiles
```

### PART 2: FILE SYSTEM AUDIT

```
Generate a tree structure of all files related to:

src/
├── pages/
│   ├── Auth.tsx [DESCRIBE: What it does, what it renders]
│   ├── Onboarding.tsx [DESCRIBE]
│   ├── dna/
│   │   ├── Profile.tsx [DESCRIBE]
│   │   └── [any other profile pages]
│   └── app/
│       └── profile/
│           └── edit.tsx [DESCRIBE]
├── components/
│   ├── onboarding/ [LIST ALL, describe each]
│   ├── profile/ [LIST ALL, describe each]
│   ├── auth/ [LIST ALL, describe each]
│   └── ui/ [LIST only those used in onboarding/profile]
├── hooks/
│   ├── [LIST ALL hooks related to auth/profile/onboarding]
│   └── [For each hook, describe: purpose, inputs, outputs, dependencies]
├── contexts/
│   ├── AuthContext.tsx [DESCRIBE: state shape, methods, providers]
│   └── [any other contexts used]
├── services/
│   ├── profilesService.ts [DESCRIBE: all methods, their signatures]
│   └── [any other services]
├── lib/
│   ├── [validation schemas for profiles]
│   ├── [utility functions for profiles]
│   └── [any auth-related utilities]
└── types/
    └── [all TypeScript types for Profile, User, Auth, etc.]
```

### PART 3: USER FLOWS (AS-IS)

```
Document the current user journey step-by-step:

FLOW 1: New User Signup → First Login
Step 1: User lands on /auth
  - What they see: [describe UI]
  - What they can do: [actions available]
  - What happens on submit: [backend calls, redirects]
  - Validation rules: [list all]

Step 2: Email verification (if applicable)
  - [describe flow]

Step 3: First login → Onboarding redirect
  - Logic: [where is this decided? show code location]
  - Redirect target: [URL]

Step 4: Onboarding flow (/onboarding)
  - Step 4.1: [describe each step]
  - Step 4.2: [describe]
  - Step 4.n: [describe]
  - Data collected at each step: [list fields]
  - Validation at each step: [list rules]
  - Can user skip steps?: [yes/no, which ones]
  - What determines "onboarding complete"?: [logic]

Step 5: Profile completion requirement
  - How is 40% calculated?: [show exact logic/code]
  - Where is this enforced?: [list all enforcement points]
  - What happens if <40%?: [describe blocking mechanism]
  - Can user bypass?: [yes/no, how]

Step 6: First platform experience
  - Where do users land after onboarding?: [URL]
  - What do they see?: [describe]

FLOW 2: Profile Editing
Step 1: User navigates to profile edit
  - Entry points: [list all ways to get there]
  - URL: [exact path]

Step 2: Profile form
  - All fields: [comprehensive list with types]
  - Which are required?: [list]
  - Which are optional?: [list]
  - Validation rules: [for each field]
  - Auto-save?: [yes/no]
  - Cancel behavior?: [what happens]

Step 3: Save profile
  - API call: [show service method]
  - Success behavior: [redirect? toast? what happens]
  - Error handling: [what happens on failure]

FLOW 3: Profile Viewing (Public)
- URL pattern: [e.g., /dna/:username]
- What's visible to public?: [list fields]
- What's visible to connections only?: [list]
- What's visible to owner only?: [list]
- Privacy controls: [describe how is_public works]
```

### PART 4: AUTHENTICATION & AUTHORIZATION

```typescript
// Document all auth-related logic:

1. AuthContext
   - State shape: [show TypeScript interface]
   - Methods: [list all with signatures]
   - Where it's provided: [component tree location]
   - How it's consumed: [show usage examples]

2. Protected Routes
   - How are routes protected?: [show guard components/logic]
   - What determines if user can access a route?: [logic]
   - Redirect behavior for unauthenticated users: [describe]
   - Redirect behavior for incomplete profiles: [describe]

3. RLS Policies (Profile-related)
   - SELECT policies on profiles: [show all]
   - INSERT policies: [show]
   - UPDATE policies: [show]
   - DELETE policies: [show]
   - Are there any gaps?: [security audit]

4. Session Management
   - How is session stored?: [localStorage? cookies?]
   - Session refresh logic: [describe]
   - Logout behavior: [what gets cleared, where redirect]
```

### PART 5: STATE MANAGEMENT

```typescript
// Document how profile data flows through the app:

1. Profile Data Fetching
   - Where is profile data fetched?: [list all locations]
   - How is it cached?: [React Query config]
   - Stale time settings: [values]
   - Refetch triggers: [list events that trigger refetch]

2. Profile Data Updates
   - Update flow: [user edits → API → cache → UI]
   - Optimistic updates?: [yes/no, where]
   - Error rollback?: [yes/no, how]

3. Zustand Stores (if any)
   - List all stores related to auth/profile
   - For each store:
     - State shape
     - Actions
     - Selectors
     - Persistence (if any)

4. Form State
   - Library: [React Hook Form config]
   - Validation library: [Zod schemas]
   - Show all validation schemas for profile forms
```

### PART 6: COMPONENT INVENTORY

```typescript
// For EVERY component in onboarding/profile flows, provide:

Component: OnboardingStep1.tsx (example)
Location: src/components/onboarding/OnboardingStep1.tsx
Purpose: Collects basic user information (name, headline, location)
Props: { onNext: () => void, onBack: () => void, initialData?: Partial<Profile> }
State: Local form state using React Hook Form
Dependencies: 
  - useFormContext from react-hook-form
  - profileValidationSchema from @/lib/validations
  - Input, Label from @/components/ui
Renders:
  - Name input (required)
  - Headline input (required)
  - Location autocomplete (optional)
  - Navigation buttons
Validation Rules:
  - name: min 2 chars, max 100 chars
  - headline: min 10 chars, max 200 chars
API Calls: None (data stored in form context, submitted at end)
Issues/TODOs: [list any known bugs or improvements needed]

[REPEAT FOR ALL COMPONENTS]
```

### PART 7: API & SERVICES LAYER

```typescript
// Document all profile-related API functions:

Service: profilesService.ts

Function: getProfile(userId: string)
  - Parameters: [describe]
  - Returns: [TypeScript return type]
  - Supabase query: [show exact query]
  - Error handling: [what errors are caught, how handled]
  - Used by: [list all components/hooks that call this]

Function: updateProfile(userId: string, data: Partial<Profile>)
  - Parameters: [describe]
  - Validation: [where/how]
  - Supabase query: [show]
  - Success response: [what's returned]
  - Error handling: [describe]
  - Used by: [list callers]

[REPEAT FOR ALL FUNCTIONS]
```

### PART 8: CONFIGURATION & CONSTANTS

```typescript
// List all hardcoded values and config:

1. Validation Constants
   - MIN_PROFILE_COMPLETION: 40 (where defined?)
   - MAX_BIO_LENGTH: ? (where defined?)
   - Required fields list: [show]
   - Optional fields list: [show]

2. Route Constants
   - ONBOARDING_ROUTE: '/onboarding'
   - PROFILE_ROUTE: '/dna/:username'
   - [list all]

3. Feature Flags (if any)
   - [list all related to profiles/onboarding]

4. Environment Variables
   - [list all used in auth/profile features]
```

### PART 9: INTEGRATION POINTS

```
Document how onboarding/profiles integrate with:

1. Connection System
   - How does profile completion affect ability to connect?
   - Where are connection suggestions shown?
   - How do connections access profile data?

2. Events System
   - Can users with incomplete profiles register for events?
   - How is profile data used in event context?

3. Collaboration Spaces
   - Profile completion requirements for spaces?
   - How is profile displayed in space context?

4. Messaging
   - Can users with incomplete profiles message?
   - How is profile data shown in message threads?

5. Feed/Posts
   - Can users with incomplete profiles post?
   - How is profile data displayed on posts?

6. ADIN System
   - How does profile completion affect ADIN scoring?
   - What profile signals are tracked?
```

### PART 10: KNOWN ISSUES & TECHNICAL DEBT

```
Audit the codebase for:

1. TODO comments in profile/onboarding files
   - [list all with file location and context]

2. FIXME comments
   - [list all]

3. Console warnings/errors related to profiles
   - [list any you find]

4. Incomplete features
   - Profile sections marked as "coming soon"
   - Disabled form fields
   - Commented-out code

5. Performance issues
   - Unnecessary re-renders
   - Missing memoization
   - Unoptimized queries

6. Accessibility issues
   - Missing ARIA labels
   - Poor keyboard navigation
   - Color contrast issues

7. Mobile responsiveness issues
   - Layouts that break
   - Touch target sizes
   - Input issues on mobile
```

### PART 11: DEPENDENCIES

```
List all npm packages used in auth/profile/onboarding:

Package: react-hook-form
Version: 7.53.0
Used for: All form state management
Used in files: [list all]
Configuration: [show main config]
Could be replaced?: [yes/no, with what, trade-offs]

[REPEAT FOR ALL RELEVANT PACKAGES]
```

### PART 12: TESTING

```
Document existing tests (if any):

1. Unit tests for profile services
   - [list test files]
   - Coverage: [%]

2. Component tests for onboarding
   - [list test files]
   - Coverage: [%]

3. E2E tests for user flows
   - [list test files]
   - Coverage: [%]

4. Manual testing checklist (if exists)
   - [document]
```

-----

## OUTPUT FORMAT

Present your findings as:

1. **Executive Summary** (1 page)
   - Current state assessment
   - Major findings
   - Critical gaps
   - Recommendations before touching anything

2. **Detailed Inventory** (structured as above)
   - All 12 sections fully documented

3. **Change Impact Map**
   - "If we change X, it will affect: [Y, Z, etc.]"
   - Risk assessment for each major component

4. **Safe Change Zones**
   - Components that can be modified with low risk
   - Components that require careful coordination
   - Components that are load-bearing (don't touch)

-----

## CRITICAL INSTRUCTIONS

- Do NOT make assumptions. If you don't see something in the code, say "NOT FOUND" or "CANNOT CONFIRM"
- Flag anything that looks fragile, hacky, or concerning
- Note any inconsistencies between code and documentation
- Identify any "ghost" features (referenced but not implemented)
- Call out any security concerns you spot
- Be thorough. This audit will guide major architectural decisions.

-----

**START YOUR AUDIT NOW.** Take as much time as needed. This is the foundation for safe, informed changes to the onboarding system.
```

---

## Why This Prompt Works

1. **Structured**: Forces systematic exploration
2. **Comprehensive**: Covers DB → UI → UX → Integration
3. **Actionable**: Generates change impact map
4. **Safe**: Identifies risk zones before touching code
5. **Honest**: Encourages "I don't know" over assumptions

## What You'll Get Back

A **50-100 page** detailed audit document that includes:
- Every file, function, and flow related to profiles
- Complete data flow diagrams
- Risk assessment for proposed changes
- Safe refactoring paths
- Unknown unknowns surfaced

## Next Steps After Audit

1. **Review together**: I'll present findings, you validate
2. **Prioritize changes**: Based on risk/impact matrix
3. **Design new architecture**: With full knowledge of constraints
4. **Build incrementally**: Small PRs, continuous testing
5. **Migrate safely**: Feature flags, gradual rollout

---

This will take me 30-60 minutes to complete thoroughly, but it will save us from breaking things as we rebuild onboarding. 🎯
