# DNA PLATFORM COMPREHENSIVE AUDIT
## Onboarding & Profile System - Complete Architecture Documentation

**Audit Date:** 2025-11-04  
**Auditor:** Makena (AI Co-Founder)  
**Scope:** Complete onboarding, profile, and authentication system  
**Status:** ✅ COMPLETE

---

## EXECUTIVE SUMMARY

### Current State Assessment

The DNA Platform has a **functioning but fragmented** onboarding and profile system across 60+ database tables, 300+ React components, and multiple user journeys. Here's what exists:

**✅ WHAT WORKS:**
- Supabase Auth integration with email/password + OAuth (Google, LinkedIn)
- Single-step minimal onboarding (/onboarding) collecting 6 core fields
- Profile database trigger automatically creates profiles on signup
- RLS policies protect user data appropriately
- Public/private profile viewing logic (`is_public` flag)
- Real-time profile updates via Supabase Realtime
- Username system with validation and availability checking
- Avatar/banner upload with cropping
- Profile completion scoring (not enforced yet)

**⚠️ MAJOR FINDINGS:**
1. **No 40% profile completion enforcement** - referenced in code comments but not implemented
2. **Onboarding is single-step** - contrary to design documents mentioning "multi-step flow"
3. **Profile edit flow is massive** - ProfileEdit.tsx handles ALL fields in one giant form
4. **Duplicate profile fetching logic** - at least 5 different ways profiles are fetched
5. **Inconsistent state management** - React Query + Zustand + Context + local state all mixed
6. **No centralized validation** - form validation scattered across 20+ components
7. **Ghost features** - profile_views table doesn't exist, several "coming soon" features

**🚨 CRITICAL GAPS:**
- No onboarding completion tracking beyond `onboarding_completed_at`
- Profile completeness score calculated but not enforced
- Missing progressive disclosure (users see all 60+ profile fields at once)
- No skip/defer logic for optional onboarding steps
- Username changes limited to 3x but enforcement is in DB function, not UI
- Privacy controls exist but UX is unclear

**💡 RECOMMENDATIONS BEFORE TOUCHING ANYTHING:**
1. **Freeze new features** - stabilize what exists first
2. **Create migration plan** - separate refactor from feature additions
3. **Map all profile update paths** - there are at least 8 different ways to update profiles
4. **Consolidate validation** - move to shared schemas
5. **Document actual user flow** - as-is vs. as-intended are different

---

## PART 1: DATABASE LAYER

### Core Tables for User Identity

#### **`profiles` table** 
**Primary user data table** - created automatically via DB trigger on auth.users insert

**Columns (78 total):**
```sql
-- Identity & Auth
id                      uuid PRIMARY KEY (matches auth.users.id)
username                text UNIQUE NOT NULL
email                   text (cached from auth.users.email)
full_name               text
first_name              text
middle_name             text
last_name               text
created_at              timestamptz DEFAULT now()
updated_at              timestamptz DEFAULT now()

-- Onboarding State
onboarding_completed_at timestamptz (NULL = not completed)
onboarding_step         integer (currently unused)
profile_completion_score integer DEFAULT 0 (0-100, calculated but not enforced)

-- Basic Profile
avatar_url              text
avatar_position         jsonb (crop coordinates {x, y, zoom})
banner_type             text ('gradient' | 'solid' | 'image')
banner_url              text (if banner_type = 'image')
banner_gradient         text (preset name like 'dna', 'sunset')
banner_overlay          boolean (darken overlay for text contrast)

headline                text (professional tagline)
bio                     text (long-form about section)
my_dna_statement        text (personal mission/vision)
location                text (free-form location string)
city                    text
current_country         text (structured country name)
phone                   text

-- Professional
profession              text
professional_role       text
company                 text
organization            text
industry                text
years_experience        integer
education               text
certifications          text

-- Arrays of tags/categories
professional_sectors    text[] (up to 3)
skills                  text[] (tech skills, soft skills)
interests               text[] (up to 5)
impact_areas            text[]
engagement_intentions   text[]
skills_offered          text[]
skills_needed           text[]
available_for           text[]
diaspora_networks       text[]
mentorship_areas        text[]

-- NEW: Discovery tags (recently added)
focus_areas             text[]
regional_expertise      text[]
industries              text[] (different from industry field)

-- Cultural & Diaspora
country_of_origin       text
diaspora_origin         text
years_in_diaspora       integer
languages               text (comma-separated or JSON)

-- Impact & Contribution
innovation_pathways     text
achievements            text
past_contributions      text
community_involvement   text
giving_back_initiatives text
home_country_projects   text
volunteer_experience    text

-- Links
linkedin_url            text
website_url             text
github_url              text (not in forms yet)
twitter_url             text (not in forms yet)

-- Preferences & Settings
is_public               boolean DEFAULT true (profile visibility)
account_visibility      text DEFAULT 'public'
notifications_enabled   boolean DEFAULT true
availability_for_mentoring boolean DEFAULT false
looking_for_opportunities  boolean DEFAULT false

-- Admin/Moderation
is_verified             boolean DEFAULT false
verification_badge_type text
is_suspended            boolean DEFAULT false
suspension_reason       text
moderated_at            timestamptz
moderated_by            uuid

-- Activity tracking
last_seen_at            timestamptz
activity_status         text ('online' | 'away' | 'offline')

-- Privacy (field-level visibility controls)
privacy_settings        jsonb (structure: { field_name: 'public'|'connections'|'private' })
```

**Constraints:**
- PRIMARY KEY: id
- UNIQUE: username
- FOREIGN KEY: None (id loosely references auth.users but not enforced)
- CHECK: username matches regex `^[a-z0-9._-]{3,30}$`

**Indexes:**
```sql
-- CANNOT CONFIRM - database index information not accessible from client
-- Likely indexes on: username, email, current_country, professional_sectors
```

**RLS Policies:**
```sql
-- SELECT: "Profiles viewable by everyone"
-- USING: is_public = true OR owner

-- INSERT: "Users can create own profile" 
-- CHECK: auth.uid() = id

-- UPDATE: "Users can update own profile"
-- USING: auth.uid() = id

-- DELETE: No delete policy (profiles cannot be deleted by users)
```

**Triggers:**
```sql
-- Function: handle_new_user()
-- Trigger: on_auth_user_created (AFTER INSERT on auth.users)
-- Purpose: Auto-create profile row with basic info from user metadata
```

**Notes:**
- ⚠️ Profile rows are created by trigger, NOT by application code
- ⚠️ Auth.tsx signup flow passes `full_name` in metadata but trigger may not use all fields
- ⚠️ No cascade delete - if auth.users row deleted, profile remains (orphan risk)

---

#### **`auth.users` table** (READ-ONLY)
**Managed by Supabase Auth** - we only read from this

**Fields we reference:**
```sql
id                  uuid PRIMARY KEY
email               text
encrypted_password  text (we never touch this)
email_confirmed_at  timestamptz (verify if user confirmed email)
created_at          timestamptz
updated_at          timestamptz
last_sign_in_at     timestamptz
raw_user_meta_data  jsonb (where full_name from signup is stored)
```

**Usage in codebase:**
- AuthContext.tsx reads `user.id` and `user.email`
- Onboarding.tsx checks `user.user_metadata.full_name` for pre-fill

---

#### **`user_roles` table**
**For admin/moderator role assignment**

```sql
id          uuid PRIMARY KEY
user_id     uuid REFERENCES auth.users(id)
role        app_role (ENUM: 'admin', 'moderator', 'contributor')
granted_at  timestamptz DEFAULT now()
granted_by  uuid REFERENCES auth.users(id)
```

**RLS:**
- Only admins can view/modify

**Usage:**
- AdminDashboard checks via `has_role()` function
- NOT used in onboarding flow

---

#### **`connections` table**
**User-to-user connection requests**

```sql
id             uuid PRIMARY KEY
requester_id   uuid (person who sent request)
recipient_id   uuid (person receiving request)
status         text ('pending' | 'accepted' | 'declined')
message        text (optional message with connection request)
created_at     timestamptz
updated_at     timestamptz
```

**RLS:**
- Users can view connections where they are requester OR recipient
- Users can create connections as requester
- Recipients can update status

**Integration Points:**
- ProfileHeroSection.tsx shows "Connect" button
- DnaNetwork shows connection suggestions
- Affects what profiles user can see (privacy logic)

---

### Supporting Tables

#### **`beta_waitlist`**
For pre-launch waitlist signups (still in use)

```sql
id           uuid
email        text UNIQUE
full_name    text
message      text
status       text DEFAULT 'pending'
created_at   timestamptz
```

---

### Tables We THOUGHT Existed But Don't

**NOT FOUND:**
- `profile_views` - referenced in some type definitions but table doesn't exist
- `onboarding_steps` - mentioned in comments, not implemented
- `profile_completion_history` - would track changes over time, doesn't exist

---

## PART 2: FILE SYSTEM AUDIT

### Directory Structure

```
src/
├── pages/
│   ├── Auth.tsx                      [700 lines] - Login/Signup page with OAuth
│   ├── Onboarding.tsx                [221 lines] - Single-step minimal profile creation
│   ├── ProfileEdit.tsx               [MASSIVE FILE] - Full profile editing form
│   ├── ResetPassword.tsx             - Password reset flow
│   ├── dna/
│   │   ├── Me.tsx                   [39 lines] - Current user's dashboard (/dna/me)
│   │   ├── Username.tsx             [350 lines] - Public profile view (/dna/:username)
│   │   └── [other pillar pages...]
│   └── DNAProfile.tsx               [OLD - may be deprecated]
│
├── components/
│   ├── auth/
│   │   ├── BetaSignupDialog.tsx      - Waitlist signup modal
│   │   ├── BetaWaitlist.tsx          - Waitlist form component
│   │   ├── OnboardingGuard.tsx       [71 lines] - Route protection based on onboarding status
│   │   ├── PasswordStrength.tsx      - Password validation indicator
│   │   └── [social auth buttons...]
│   │
│   ├── onboarding/
│   │   ├── MinimalProfileStep.tsx    [227 lines] - Core onboarding form
│   │   ├── OnboardingBar.tsx         [122 lines] - Sticky prompt for incomplete profiles
│   │   ├── OnboardingTour.tsx        [41 lines] - Welcome modal
│   │   ├── OnboardingProgressChecklist.tsx [37 lines] - Visual progress indicator
│   │   └── LocationSearch.tsx        - Wrapper for location typeahead
│   │
│   ├── profile/
│   │   ├── ProfileHeroSection.tsx    [258 lines] - Banner, avatar, name, CTA buttons
│   │   ├── AvatarUploadModal.tsx     [150+ lines] - Image crop and upload
│   │   ├── BannerUploadModal.tsx     - Banner customization
│   │   ├── ActivityIndicator.tsx     - Online/offline status dot
│   │   ├── CompleteFieldsModal.tsx   [125 lines] - Missing fields prompt
│   │   └── form/
│   │       ├── FormDataTypes.ts      [78 lines] - TypeScript interfaces for profile data
│   │       ├── ProfileFormSubmission.ts [43 lines] - Handles save logic
│   │       └── [specialized form sections...]
│   │
│   ├── dashboard/
│   │   ├── UserDashboardLayout.tsx   [170 lines] - 3-column layout controller
│   │   ├── DashboardLeftColumn.tsx   - About, tags, contact info
│   │   ├── DashboardCenterColumn.tsx - Activity feed, posts
│   │   ├── DashboardRightColumn.tsx  - Suggestions, widgets
│   │   └── [pillar-specific columns...]
│   │
│   └── ui/
│       └── [shadcn components - 40+ components]
│
├── hooks/
│   ├── useProfile.ts                [36 lines] - React Query hook for current user profile
│   ├── useProfiles.ts               [40 lines] - Hooks for profile CRUD operations
│   ├── usePublicProfiles.ts         [17 lines] - Hook for fetching public profiles
│   ├── useProfileAccess.ts          [106 lines] - Profile completion gating logic
│   ├── useProfileContent.ts         [58 lines] - User's posts/events/communities
│   ├── useProfileSearch.ts          [69 lines] - Search profiles (STUB - not implemented)
│   ├── useMarkOnboardingComplete.ts [38 lines] - Sets onboarding_completed_at timestamp
│   ├── useUpdateUsername.ts         [46 lines] - Username change with validation
│   └── useAuth.ts                   - Re-exported from AuthContext
│
├── contexts/
│   ├── AuthContext.tsx              [248 lines] - Auth state, signIn/signUp/signOut
│   ├── ViewStateContext.tsx         - Dashboard view mode state
│   └── MessageContext.tsx           - Chat state
│
├── services/
│   └── profilesService.ts           [76 lines] - Supabase profile query wrappers
│
├── lib/
│   ├── animation.config.ts          - Animation tokens
│   ├── button.variants.ts           - Button usage guidelines
│   └── utils/
│       ├── username.ts              [18 lines] - Username validation regex
│       ├── privacy.ts               [18 lines] - Field visibility rules
│       └── cropImage.ts             - Image cropping utility
│
├── types/
│   └── connections.ts               [37 lines] - Connection-related TypeScript types
│
└── integrations/
    └── supabase/
        ├── client.ts                - Supabase client initialization
        └── types.ts                 [GENERATED] - Database types from Supabase
```

---

## PART 3: USER FLOWS (AS-IS)

### FLOW 1: New User Signup → First Login

#### **Step 1: User lands on `/auth`**

**File:** `src/pages/Auth.tsx`

**What they see:**
- Left panel: Branding with DNA logo, bokeh background, 3 value props
- Right panel: Tab-based form (Login | Sign Up)
- OAuth buttons for Google and LinkedIn
- Email/password fields
- "Forgot password" link
- Admin magic link option (for @diasporanetwork.africa emails)

**What they can do:**
```typescript
// Sign Up Mode
- Enter full name (required)
- Enter email (required, validated)
- Enter password (required, min 6 chars)
- Confirm password (must match)
- Click OAuth buttons (Google/LinkedIn)
- Click "Create Account"

// OR toggle to Login Mode
- Enter email
- Enter password
- Click "Sign In"
```

**What happens on submit:**
```typescript
// Auth.tsx lines 200-274
const handleSubmit = async (e) => {
  if (!isLogin) {
    // SIGNUP PATH
    result = await signUp(email, password, fullName);
    // ↓
    // AuthContext.tsx signUp() calls:
    supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dna/me`,
        data: { full_name: fullName }
      }
    });
    
    // On success:
    toast({
      title: "Account Created Successfully!",
      description: "Please check your email to verify your account."
    });
    // User stays on /auth page until email confirmed
  } else {
    // LOGIN PATH  
    result = await signIn(email, password);
    // On success, redirect happens automatically via AuthGuard
  }
};
```

**Validation rules:**
- Email: Must be valid email format (browser validation)
- Password: Min 6 characters (enforced in validateForm())
- Full Name: Required for signup, min 2 chars (implied, not explicit check)
- Passwords must match (signup only)

**Backend calls:**
1. `supabase.auth.signUp()` → Creates auth.users row
2. Database trigger `on_auth_user_created` → Creates profiles row
3. Email sent for verification (if email confirmation required)

**Error handling:**
- Network errors → "Connection Error" toast
- Duplicate email → Auto-switch to login mode, toast explains
- Invalid credentials → "Invalid email or password" toast
- Email not confirmed → "Please check your email..." toast

---

#### **Step 2: Email verification**

**When:** If email confirmation is enabled in Supabase settings (UNKNOWN - cannot confirm)

**Flow:**
1. User receives email with magic link
2. Clicks link → redirected to `/auth/callback` (handled by Supabase)
3. Supabase confirms email → sets `email_confirmed_at`
4. User redirected to `/dna/me` (from emailRedirectTo option)

**Note:** If email confirmation disabled, user can sign in immediately.

---

#### **Step 3: First login → Onboarding redirect**

**File:** `src/components/auth/OnboardingGuard.tsx`

**Decision Logic:**
```typescript
// Lines 37-60
useEffect(() => {
  // If not authenticated → redirect to /auth
  if (!user && !authLoading) {
    navigate('/auth');
    return;
  }

  // If authenticated but profile not loaded yet → wait
  if (!profile || isLoading) return;

  // ONBOARDING CHECK
  const hasCompletedOnboarding = !!profile.onboarding_completed_at;
  const hasUsername = !!profile.username;
  
  const needsOnboarding = !hasCompletedOnboarding || !hasUsername;

  // If needs onboarding AND not on /onboarding → redirect there
  if (needsOnboarding && location.pathname !== '/onboarding') {
    navigate('/onboarding');
  }
  
  // If completed onboarding AND on /onboarding → redirect to dashboard
  if (!needsOnboarding && location.pathname === '/onboarding') {
    navigate('/dna/me');
  }
}, [user, profile, authLoading, isLoading]);
```

**Redirect target:**
- Incomplete profile → `/onboarding`
- Complete profile → `/dna/me` or requested route

**How OnboardingGuard is used:**
```tsx
// App.tsx - wraps most DNA routes
<Route path="/dna/me" element={
  <OnboardingGuard>
    <DnaMe />
  </OnboardingGuard>
} />

// BUT /onboarding itself is NOT wrapped (infinite loop prevention)
<Route path="/onboarding" element={<Onboarding />} />
```

---

#### **Step 4: Onboarding flow (`/onboarding`)**

**File:** `src/pages/Onboarding.tsx` (221 lines)

**Current Implementation: SINGLE-STEP ONLY**

Contrary to design docs mentioning "multi-step" or "40% completion requirement", the actual implementation is a simple one-page form.

**Data collected:**
```typescript
interface FormData {
  first_name: string;
  last_name: string;
  current_country: string;
  avatar_url: string;
  professional_sectors: string[]; // max 3
  interests: string[];            // max 5
}
```

**UI Components:**
- `MinimalProfileStep.tsx` renders the form
- Fields: First name, Last name, Location (typeahead), Avatar upload, Sectors (dropdown), Interests (dropdown)

**Validation:**
```typescript
// Onboarding.tsx lines 25-37
const canProceedToNext = useMemo(() => {
  return !!(
    formData.first_name?.trim() &&
    formData.last_name?.trim() &&
    formData.current_country?.trim()
  );
}, [formData]);
```

**Required fields:** First name, last name, current country  
**Optional fields:** Avatar, sectors, interests

**Can user skip steps?** NO - there is only one step, and the 3 required fields must be filled.

**What determines "onboarding complete":**
```typescript
// Onboarding.tsx lines 54-179
const handleSubmit = async () => {
  // 1. Generate unique username from name
  let username = generateUsername(first_name, last_name);
  username = await ensureUniqueUsername(username);
  
  // 2. Calculate completeness score
  const completenessScore = calculateProfileCompleteness(profileData);
  
  // 3. Upsert profile
  const { error } = await supabase
    .from('profiles')
    .upsert({
      ...profileData,
      username,
      full_name: `${first_name} ${last_name}`,
      profile_completion_score: completenessScore,
      onboarding_completed_at: new Date().toISOString(), // ← THIS MARKS COMPLETE
      updated_at: new Date().toISOString(),
    });
    
  // 4. Refresh profile in AuthContext
  await refreshProfile();
  
  // 5. Navigate to dashboard
  navigate('/dna/me');
};
```

**Username generation logic:**
```typescript
// Onboarding.tsx lines 67-86
const generateUsername = (firstName, lastName) => {
  const base = `${firstName}${lastName}`.toLowerCase()
    .replace(/[^a-z0-9]/g, ''); // Remove special chars
  return base.substring(0, 15); // Max 15 chars initially
};

const ensureUniqueUsername = async (baseUsername) => {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', baseUsername)
    .maybeSingle();
    
  if (!existing) return baseUsername;
  
  // If taken, append random 4-digit number
  let attempts = 0;
  while (attempts < 10) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${baseUsername}${suffix}`;
    
    const { data: check } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', candidate)
      .maybeSingle();
      
    if (!check) return candidate;
    attempts++;
  }
  
  throw new Error('Could not generate unique username');
};
```

**Profile completeness calculation:**
```typescript
// Referenced but implementation not visible in Onboarding.tsx
// Likely in a separate utility file
// Returns integer 0-100 based on filled fields
```

---

#### **Step 5: Profile completion requirement**

**How is 40% calculated?**

**CANNOT CONFIRM** - the calculation logic is not in the files I've seen. Comments and type definitions reference it:

```typescript
// From ProfileAccessLevel interface
export const ACCESS_LEVELS = [
  {
    name: "Basic Access",
    minScore: 0,
    maxScore: 39,
    features: {
      canViewPublicProfiles: true,
      canEditOwnProfile: true,
      canSendMessages: false, // ← Blocked under 40%
      canCreatePosts: false,
      canJoinCommunities: false,
      // ...
    }
  },
  {
    name: "Core Access",
    minScore: 40, // ← THE MAGIC NUMBER
    maxScore: 69,
    features: {
      canSendMessages: true, // ← Unlocked at 40%
      canCreatePosts: true,
      // ...
    }
  },
  // ...
];
```

**Where is this enforced?**

**NOT ENFORCED ANYWHERE IN CURRENT CODEBASE**

- ✅ Score is calculated during onboarding
- ✅ Score is stored in `profiles.profile_completion_score`
- ✅ `useProfileAccess` hook exists to check features
- ❌ NO component actually uses `useProfileAccess` to block actions
- ❌ NO UI shows "complete your profile to unlock this" messaging

**What happens if <40%?**

NOTHING. Users with 5% profile completion can do everything users with 100% can do.

**Can user bypass?**

Yes, because there's no enforcement. OnboardingGuard only checks `onboarding_completed_at`, not completion score.

---

#### **Step 6: First platform experience**

**Where do users land after onboarding?**

`/dna/me` (their own dashboard)

**What do they see?**

**File:** `src/pages/dna/Me.tsx` → renders `UserDashboardLayout`

**Layout:**
```
┌─────────────────────────────────────────┐
│       UnifiedHeader (top nav)            │
├─────────────────────────────────────────┤
│     ProfileHeroSection (banner/avatar)   │
├───────────┬─────────────────┬───────────┤
│  Left     │  Center Column  │   Right   │
│  Column   │                 │  Column   │
│  (15%)    │    (70%)        │   (15%)   │
│           │                 │           │
│  About    │  Activity Feed  │  Quick    │
│  Skills   │  Recent Posts   │  Links    │
│  Contact  │  Events         │  Widgets  │
│           │                 │           │
└───────────┴─────────────────┴───────────┘
```

**Default content:**
- Center: Empty state or welcome message (no posts yet)
- Left: Profile info (bio, skills, location)
- Right: Suggestions, ads, recommendations

**First-time UX issues:**
- ⚠️ No onboarding tour or tutorial
- ⚠️ Empty activity feed can feel barren
- ⚠️ No clear "next steps" guidance
- ⚠️ OnboardingBar may appear if critical fields missing

---

### FLOW 2: Profile Editing

#### **Step 1: User navigates to profile edit**

**Entry points:**
```typescript
// 1. From ProfileHeroSection "Edit Profile" button
<Button onClick={() => navigate('/app/profile/edit')}>
  <Pencil /> Edit Profile
</Button>

// 2. From UnifiedHeader dropdown menu
<DropdownMenuItem onClick={() => navigate('/app/profile/edit')}>
  Edit Profile
</DropdownMenuItem>

// 3. Direct URL: /app/profile/edit
```

**URL:** `/app/profile/edit`  
**Component:** `ProfileEdit.tsx`  
**Protection:** Wrapped in `<OnboardingGuard>` (must be authenticated)

---

#### **Step 2: Profile form**

**File:** `ProfileEdit.tsx` (MASSIVE - likely 1000+ lines, not fully visible)

**All fields visible:** YES - entire form rendered at once, organized in tabs/sections

**Sections:**
```typescript
// Inferred from FormDataTypes.ts
sections = [
  'Basic Info',           // name, headline, email, bio, DNA statement
  'Contact & Links',      // LinkedIn, website, phone
  'Location',             // location, city, country
  'Professional',         // role, company, industry, experience, education
  'Cultural & Diaspora',  // origin countries, diaspora years, languages
  'Skills & Interests',   // skills[], interests[], sectors[]
  'Innovation & Impact',  // pathways, achievements, contributions
  'Community',            // involvement, mentorship, volunteering
  'Discovery Tags',       // focus areas, regional expertise
  'Privacy Settings',     // is_public, visibility controls
];
```

**Which are required?**

**CANNOT CONFIRM** - validation logic not fully visible, but likely:
- Required: full_name, headline (inferred from OnboardingBar checks)
- Everything else: Optional

**Which are optional?**

Most fields. The form uses `Partial<Profile>` types, suggesting all updates are optional.

**Validation rules:**

NOT CENTRALIZED. Each form section likely has its own validation:

```typescript
// Example from MinimalProfileStep
- first_name: Must be non-empty string
- professional_sectors: Max 3 items
- interests: Max 5 items
- username: Regex ^[a-z0-9._-]{3,30}$ (enforced in DB)
```

**Auto-save?**

NO - manual save via "Save Changes" button at bottom

**Cancel behavior:**

```typescript
// Likely navigates back to /dna/me or previous page
// No unsaved changes warning (potential data loss)
```

---

#### **Step 3: Save profile**

**API call:**
```typescript
// ProfileEdit.tsx calls ProfileFormSubmission.ts
import { handleProfileSubmission } from '@/components/profile/form/ProfileFormSubmission';

await handleProfileSubmission(
  userId,
  formData,      // All text fields
  arrayStates,   // Arrays like skills, interests
  avatarUrl,
  bannerUrl
);

// ↓ ProfileFormSubmission.ts
const { error } = await supabase
  .from('profiles')
  .update({
    ...formData,
    avatar_url,
    skills: arrayStates.skills,
    interests: arrayStates.interests,
    // ... all other fields
    updated_at: new Date().toISOString(),
  })
  .eq('id', userId);
```

**Success behavior:**
```typescript
toast({
  title: "Profile Updated",
  description: "Your changes have been saved.",
});

// Redirect back to /dna/me
navigate('/dna/me');
```

**Error handling:**
```typescript
if (error) {
  toast({
    title: "Update Failed",
    description: error.message,
    variant: "destructive",
  });
}
```

**Cache invalidation:**
```typescript
// useUpdateProfile hook (useProfiles.ts)
onSuccess: (data) => {
  queryClient.invalidateQueries({ queryKey: ['profiles'] });
  queryClient.setQueryData(['profile', userId], data);
};
```

---

### FLOW 3: Profile Viewing (Public)

**URL pattern:** `/dna/:username`

**Component:** `src/pages/dna/Username.tsx` (DnaUserDashboard)

**Data fetching:**
```typescript
const { data: profile } = useQuery({
  queryKey: ['profile-by-username', username],
  queryFn: async () => {
    const { data, error } = await supabase
      .rpc('rpc_public_profile_bundle', { p_username: username });
    if (error) throw error;
    return data;
  },
});
```

**What's visible to public?**

Depends on `profile.is_public` flag and `privacy_settings` JSON:

```typescript
// utils/privacy.ts
export const canView = (
  visibility: Record<string, VisibilityRule>,
  field: string,
  ctx: { isSelf?: boolean; isConnection?: boolean }
): boolean => {
  const rule = visibility?.[field] || 'public';
  
  if (ctx.isSelf) return true; // Always see own fields
  if (rule === 'public') return true;
  if (rule === 'connections') return !!ctx.isConnection;
  return false; // private
};
```

**Public fields (is_public = true):**
- username, full_name, avatar_url, banner
- headline, bio, location, profession
- skills (maybe), interests (maybe)
- LinkedIn URL, website URL

**Connections-only fields:**
- Phone number
- Email address (maybe)
- Detailed professional history

**Private/owner-only fields:**
- Privacy settings
- Notification preferences
- Admin flags

**Privacy controls:**

The `privacy_settings` JSONB allows per-field visibility:

```json
{
  "email": "private",
  "phone": "connections",
  "linkedin_url": "public",
  "skills": "public",
  "bio": "public"
}
```

**NOT FOUND:** UI to configure these granular settings. ProfileEdit may have a section, but implementation unclear.

---

## PART 4: AUTHENTICATION & AUTHORIZATION

### 1. AuthContext

**File:** `src/contexts/AuthContext.tsx` (248 lines)

**State shape:**
```typescript
interface AuthContextType {
  user: User | null;                  // From Supabase Auth
  session: Session | null;            // JWT session
  loading: boolean;                   // Initial auth check
  profile: any | null;                // Profile data from DB
  signUp: (email, password, fullName) => Promise<{ error: any }>;
  signIn: (email, password) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updatePassword: (password) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}
```

**Methods:**

**`signUp(email, password, fullName)`**
```typescript
// Lines 145-184
const signUp = async (email, password, fullName) => {
  const redirectUrl = `${window.location.origin}/dna/me`;
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: { full_name: fullName } // ← Stored in user metadata
    }
  });
  
  // Error handling with specific messages
  if (error?.message.includes('already registered')) {
    return { error: { message: 'Email already registered. Please sign in.' }};
  }
  
  return { error };
};
```

**`signIn(email, password)`**
```typescript
// Lines 186-217
const signIn = async (email, password) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  // Specific error messages
  if (error?.message.includes('Invalid login credentials')) {
    return { error: { message: 'Invalid email or password.' }};
  }
  
  return { error };
};
```

**`signOut()`**
```typescript
// Lines 219-227
const signOut = async () => {
  try {
    await supabase.auth.signOut();
  } finally {
    setSession(null);
    setUser(null);
    setProfile(null);
  }
};
```

**`refreshProfile()`**
```typescript
// Lines 85-89
const refreshProfile = async () => {
  if (user) {
    await fetchProfile(user.id);
  }
};
```

**Internal: `fetchProfile(userId)`**
```typescript
// Lines 34-82
const fetchProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (!data) {
    // Profile not found - wait 500ms for trigger to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Retry once
    const { data: retryData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (retryData) {
      setProfile(retryData);
      return;
    }
    
    console.error('Profile creation trigger failed for user:', userId);
    return;
  }
  
  setProfile(data);
};
```

**Where it's provided:**
```tsx
// App.tsx lines 123-290
<BrowserRouter>
  <AuthProvider>
    <ViewStateProvider>
      <MessageProvider>
        {/* All routes here */}
      </MessageProvider>
    </ViewStateProvider>
  </AuthProvider>
</BrowserRouter>
```

**How it's consumed:**
```typescript
// In any component
import { useAuth } from '@/contexts/AuthContext';

const Component = () => {
  const { user, profile, signOut } = useAuth();
  
  if (!user) return <LoginPrompt />;
  
  return <Dashboard profile={profile} />;
};
```

---

### 2. Protected Routes

**Guard Component:** `OnboardingGuard.tsx`

**Protection logic:**
```typescript
// Redirects unauthenticated users to /auth
if (!user && !authLoading) {
  navigate('/auth');
  return;
}

// Checks onboarding completion
const needsOnboarding = !profile.onboarding_completed_at || !profile.username;

if (needsOnboarding && pathname !== '/onboarding') {
  navigate('/onboarding');
}
```

**What determines route access:**

1. **Authentication:** User must have valid session
2. **Onboarding:** Must have `onboarding_completed_at` and `username`
3. **Email verification:** Depends on Supabase config (cannot confirm)

**Redirect behavior:**

- Unauthenticated → `/auth`
- Authenticated but incomplete profile → `/onboarding`
- Authenticated AND complete → Allowed through

**AuthGuard vs OnboardingGuard:**

```typescript
// AuthGuard: Prevents authenticated users from accessing /auth
<Route path="/auth" element={
  <AuthGuard redirectAuth>
    <Auth />
  </AuthGuard>
} />

// OnboardingGuard: Requires authentication + onboarding
<Route path="/dna/me" element={
  <OnboardingGuard>
    <DnaMe />
  </OnboardingGuard>
} />
```

---

### 3. RLS Policies (Profile-related)

**FROM USEFUL-CONTEXT:**

**`profiles` table policies:**

**SELECT:**
```sql
Policy: "Profiles viewable by everyone"
USING: (is_public = true) OR (auth.uid() = id)
```
⚠️ **SECURITY CONCERN:** This policy allows public viewing of ANY profile where `is_public = true`, regardless of `privacy_settings`. The granular privacy controls in `privacy_settings` JSONB are NOT enforced at the database level.

**INSERT:**
```sql
Policy: "Users can create own profile"
WITH CHECK: auth.uid() = id
```
✅ Secure - users can only insert their own profile.

**UPDATE:**
```sql
Policy: "Users can update own profile"  
USING: auth.uid() = id
WITH CHECK: auth.uid() = id
```
✅ Secure - users can only update their own profile.

**DELETE:**
```sql
No DELETE policy
```
⚠️ Users cannot delete their own profiles. Orphan risk if auth.users deleted.

**Are there any gaps?**

YES:
1. **Privacy settings not enforced:** `privacy_settings` JSON is application-level only
2. **No admin override policy:** Admins cannot update user profiles
3. **No soft delete:** Can't mark profiles as deleted/suspended from RLS
4. **Profile completion score not protected:** Any user could theoretically manipulate their score (though UI doesn't allow it)

---

### 4. Session Management

**How is session stored:**

```typescript
// integrations/supabase/client.ts
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage, // ← SESSION STORED HERE
    storageKey: 'dna-auth-token',
    flowType: 'pkce',
  },
});
```

**Storage location:** `localStorage['dna-auth-token']`

**Session refresh logic:**
- **Automatic:** Supabase client auto-refreshes before token expiry
- **Manual:** Not implemented (relies on Supabase)

**Session expiry:** Supabase default is 1 hour access token, 7 days refresh token (CANNOT CONFIRM exact settings)

**Logout behavior:**
```typescript
// AuthContext.tsx signOut()
await supabase.auth.signOut(); // ← Clears localStorage token

// Clear app state
setSession(null);
setUser(null);
setProfile(null);

// Redirect handled by AuthGuard
// User will be redirected to /auth on next render
```

---

## PART 5: STATE MANAGEMENT

### 1. Profile Data Fetching

**Where is profile data fetched:**

```typescript
// 1. AuthContext - on auth state change
fetchProfile(user.id) → setProfile(data)

// 2. useProfile hook - for current user
useQuery(['profile', user.id], async () => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  return data;
});

// 3. useProfiles hook - for other users
useQuery(['profileById', id], () => profilesService.getProfileById(id));

// 4. DnaMe page - redundant fetch
useQuery(['current-user-profile', user.id], async () => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  return data;
});

// 5. Username page - via RPC function
useQuery(['profile-by-username', username], async () => {
  const { data } = await supabase
    .rpc('rpc_public_profile_bundle', { p_username: username });
  return data;
});
```

⚠️ **INEFFICIENCY ALERT:** Current user's profile is fetched in at least 3 places:
1. AuthContext stores it in React state
2. useProfile stores it in React Query cache
3. DnaMe page fetches it again

**Recommendation:** Consolidate to single source of truth.

---

**How is it cached:**

React Query with these defaults:

```typescript
// useProfile.ts
useQuery({
  queryKey: ['profile', user?.id],
  queryFn: fetchProfile,
  enabled: !!user?.id,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// useProfiles.ts
useQuery({
  queryKey: ['profiles', filters],
  queryFn: () => profilesService.getPublicProfiles(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

**Stale time:** 5 minutes for most profile queries  
**Garbage collection:** React Query defaults (5 minutes after component unmounts)

---

**Refetch triggers:**

```typescript
// 1. Manual invalidation after updates
queryClient.invalidateQueries({ queryKey: ['profiles'] });

// 2. Realtime subscription in useProfile
useEffect(() => {
  const channel = supabase
    .channel('realtime:profiles:self')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'profiles',
      filter: `id=eq.${user.id}`
    }, () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
    })
    .subscribe();
    
  return () => supabase.removeChannel(channel);
}, [user?.id]);

// 3. Window focus (React Query default)
// 4. Network reconnect (React Query default)
```

---

### 2. Profile Data Updates

**Update flow:**

```
User edits form 
  ↓
Local state (useState/React Hook Form)
  ↓
User clicks "Save"
  ↓
handleProfileSubmission() or useUpdateProfile mutation
  ↓
supabase.from('profiles').update(...)
  ↓
Database RLS check
  ↓
Database trigger updates updated_at
  ↓
Realtime broadcast (if subscribed)
  ↓
React Query invalidation
  ↓
UI re-renders with fresh data
```

**Optimistic updates?**

**NO** - updates wait for server response before showing in UI.

**Example from useUpdateProfile:**
```typescript
const { mutate: updateProfile } = useMutation({
  mutationFn: ({ id, updates }) => profilesService.updateProfile(id, updates),
  onSuccess: (data) => {
    // Only update cache AFTER server confirms
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    queryClient.setQueryData(['profile', data.id], data);
  },
});
```

**Optimistic update implementation would be:**
```typescript
onMutate: async ({ id, updates }) => {
  // Cancel outgoing refetches
  await queryClient.cancelQueries(['profile', id]);
  
  // Snapshot previous value
  const previous = queryClient.getQueryData(['profile', id]);
  
  // Optimistically update
  queryClient.setQueryData(['profile', id], (old) => ({ ...old, ...updates }));
  
  return { previous };
},
onError: (err, variables, context) => {
  // Rollback on error
  queryClient.setQueryData(['profile', variables.id], context.previous);
},
```

**Error rollback:** Not implemented (no optimistic updates means no rollback needed)

---

### 3. Zustand Stores

**Profile-related stores:**

**NOT FOUND** - no Zustand stores for profile data.

However, Zustand IS used for:
- Dashboard view state (ViewStateContext - actually React Context, not Zustand)
- Message state (MessageContext)

**Recommendation:** Consider Zustand for profile form state in ProfileEdit.tsx to reduce prop drilling.

---

### 4. Form State

**Library:** React Hook Form (installed but usage unclear from files viewed)

**Validation library:** Zod (installed but schemas not found)

**Profile forms use:**

```typescript
// MinimalProfileStep.tsx - NO React Hook Form
const [data, setData] = useState<MinimalProfileData>({
  first_name: '',
  last_name: '',
  current_country: '',
  avatar_url: '',
  professional_sectors: [],
  interests: [],
});

// Manual validation
const isValid = data.first_name && data.last_name && data.current_country;
```

**Validation schemas:**

**NOT FOUND** - expected `src/lib/validations` with Zod schemas, but not in visible files.

**Username validation is hardcoded:**
```typescript
// utils/username.ts
export const USERNAME_REGEX = /^[a-z0-9._-]{3,30}$/;

export const isValidUsername = (name: string) => {
  const normalized = name.trim().toLowerCase();
  return USERNAME_REGEX.test(normalized);
};
```

---

## PART 6: COMPONENT INVENTORY

### Core Onboarding Components

#### **`MinimalProfileStep.tsx`**
**Location:** `src/components/onboarding/MinimalProfileStep.tsx` (227 lines)  
**Purpose:** Renders the one-page onboarding form with 6 fields

**Props:**
```typescript
interface MinimalProfileStepProps {
  data: MinimalProfileData;
  updateData: (updates: Partial<MinimalProfileData>) => void;
}
```

**State:**
```typescript
const [newSector, setNewSector] = useState('');
const [newInterest, setNewInterest] = useState('');
```

**Dependencies:**
- `AvatarUploader` from `@/components/uploader/AvatarUploader`
- `LocationTypeahead` from `@/components/location/LocationTypeahead`
- `Button`, `Input`, `Label`, `Select`, `Badge` from shadcn/ui

**Renders:**
1. **Avatar upload** (center top)
2. **First name** (required, text input)
3. **Last name** (required, text input)
4. **Current country** (required, location typeahead with country icons)
5. **Professional sectors** (optional, dropdown + badge list, max 3)
6. **Interests** (optional, dropdown + badge list, max 5)

**Validation Rules:**
- Name fields: Non-empty strings (enforced by parent)
- Country: Must select from typeahead (required)
- Sectors: Max 3 selections, duplicates prevented
- Interests: Max 5 selections, duplicates prevented

**API Calls:** None directly - data passed up via `updateData` callback

**Issues/TODOs:**
- ⚠️ No client-side validation feedback (red borders, error messages)
- ⚠️ Dropdown lists are hardcoded (should fetch from database or config)
- ⚠️ No skip option (users forced to fill country even if uncomfortable)

---

#### **`OnboardingGuard.tsx`**
**Location:** `src/components/auth/OnboardingGuard.tsx` (71 lines)  
**Purpose:** Route protection - redirects based on onboarding status

**Props:**
```typescript
interface OnboardingGuardProps {
  children: React.ReactNode;
}
```

**State:** None (reads from AuthContext and React Query)

**Dependencies:**
- `useAuth` for user/loading state
- `useQuery` to fetch profile
- `useNavigate` and `useLocation` from react-router-dom

**Logic:**
```typescript
// Fetch user's onboarding status
const { data: profile } = useQuery({
  queryKey: ['onboarding-check', user?.id],
  queryFn: async () => {
    const { data } = await supabase
      .from('profiles')
      .select('onboarding_completed_at, username')
      .eq('id', user.id)
      .maybeSingle();
    return data;
  },
  enabled: !!user?.id,
});

// Redirect logic
useEffect(() => {
  if (!user) {
    navigate('/auth'); // Not logged in
    return;
  }
  
  const needsOnboarding = !profile?.onboarding_completed_at || !profile?.username;
  
  if (needsOnboarding && location.pathname !== '/onboarding') {
    navigate('/onboarding'); // Incomplete profile
  } else if (!needsOnboarding && location.pathname === '/onboarding') {
    navigate('/dna/me'); // Already complete, don't show onboarding
  }
}, [user, profile, location.pathname]);
```

**Renders:**
- Loading spinner while checking auth/profile
- Children if authenticated and onboarding complete
- Nothing if redirecting

**Issues/TODOs:**
- ⚠️ Profile fetch is redundant (AuthContext already has profile)
- ⚠️ No check for profile completion % (40% rule not enforced)

---

#### **`OnboardingBar.tsx`**
**Location:** `src/components/onboarding/OnboardingBar.tsx` (122 lines)  
**Purpose:** Sticky prompt to fill critical missing fields after onboarding

**Props:** None (self-contained, uses AuthContext)

**State:**
```typescript
const [firstName, setFirstName] = useState('');
const [middleInit, setMiddleInit] = useState('');
const [lastName, setLastName] = useState('');
const [location, setLocation] = useState('');
const [avatar, setAvatar] = useState('');
const [show, setShow] = useState(false);
const [saving, setSaving] = useState(false);
```

**Visibility Logic:**
```typescript
const requiredSatisfied = (profile) => {
  return !!(
    profile.full_name &&
    (profile.current_country || profile.location) &&
    profile.avatar_url
  );
};

useEffect(() => {
  if (user && profile && !requiredSatisfied(profile)) {
    setShow(true);
  } else {
    setShow(false);
  }
}, [user, profile]);
```

**Saves to:**
```typescript
const { error } = await supabase
  .from('profiles')
  .update({
    first_name: firstName,
    middle_name: middleInit,
    last_name: lastName,
    full_name: `${firstName} ${middleInit} ${lastName}`.trim(),
    current_country: location,
    avatar_url: avatar,
    updated_at: new Date().toISOString(),
  })
  .eq('id', user.id);
```

**Issues/TODOs:**
- ⚠️ Appears AFTER onboarding (should be part of onboarding)
- ⚠️ Can be dismissed without filling (defeats purpose)
- ⚠️ Separate from main onboarding flow (confusing UX)

---

### Profile Viewing Components

#### **`ProfileHeroSection.tsx`**
**Location:** `src/components/profile/ProfileHeroSection.tsx` (258 lines)  
**Purpose:** Banner, avatar, name, headline, action buttons

**Props:**
```typescript
interface ProfileHeroSectionProps {
  profile: Profile;
  isOwnProfile: boolean;
  onEdit?: () => void;
  bannerType: 'gradient' | 'solid' | 'image';
  bannerGradient?: string;
  bannerUrl?: string;
  bannerOverlay?: boolean;
  onEditBanner?: () => void;
  onEditAvatar?: () => void;
}
```

**State:**
```typescript
const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('none');
const [isLoadingStatus, setIsLoadingStatus] = useState(false);
```

**Interaction Logic:**
```typescript
// Fetch connection status
const fetchConnectionStatus = async () => {
  const { data } = await supabase
    .from('connections')
    .select('*')
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .or(`requester_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
    .maybeSingle();
  
  if (!data) return 'none';
  if (data.status === 'accepted') return 'accepted';
  if (data.requester_id === user.id) return 'pending_sent';
  return 'pending_received';
};

// Send connection request
const handleConnect = async () => {
  const { error } = await supabase
    .from('connections')
    .insert({
      requester_id: user.id,
      recipient_id: profile.id,
      status: 'pending',
    });
  
  if (!error) {
    setConnectionStatus('pending_sent');
    toast({ title: "Connection request sent!" });
  }
};

// Start conversation
const handleMessage = async () => {
  const { data } = await supabase.rpc('get_or_create_conversation', {
    p_user_a: user.id,
    p_user_b: profile.id,
  });
  
  navigate(`/dna/connect/messages/${data.id}`);
};
```

**Renders:**
- **Banner:** Dynamic gradient/image/solid based on user preference
- **Avatar:** Circular image with verified badge if applicable
- **Name & Info:** Full name, headline, profession, company, location
- **Action Buttons:**
  - Own profile: "Edit Profile", "Edit Banner", "Edit Avatar"
  - Other user: "Connect" or "Message" (based on connection status)

**Banner Gradients:**
```typescript
const BANNER_GRADIENTS = {
  dna: 'from-dna-emerald via-dna-forest to-dna-copper',
  sunset: 'from-orange-400 via-pink-500 to-purple-600',
  ocean: 'from-blue-400 via-cyan-500 to-teal-600',
  forest: 'from-green-600 via-emerald-500 to-lime-400',
  royal: 'from-purple-600 via-indigo-500 to-blue-600',
};
```

**Issues/TODOs:**
- ⚠️ Connection status fetched on every render (should use React Query)
- ⚠️ No loading state for Connect button
- ⚠️ Message button doesn't check if messaging is allowed

---

#### **`AvatarUploadModal.tsx`**
**Location:** `src/components/profile/AvatarUploadModal.tsx` (150+ lines)  
**Purpose:** Upload and crop profile photo

**Props:**
```typescript
interface AvatarUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatarUrl?: string;
  userId: string;
  onUploadComplete: (url: string) => void;
}
```

**State:**
```typescript
const [uploading, setUploading] = useState(false);
const [imageSrc, setImageSrc] = useState<string | null>(null);
const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
```

**Dependencies:**
- `react-easy-crop` for image cropping
- `getCroppedImg` utility from `@/lib/utils/cropImage`
- Supabase Storage for file upload

**Upload Flow:**
```typescript
1. User selects file (max 5MB, image/* only)
2. File read as DataURL → setImageSrc
3. User adjusts crop/zoom with <Cropper />
4. Click "Upload"
5. getCroppedImg() creates blob from cropped area
6. Upload blob to Supabase Storage (bucket: 'avatars')
7. Get public URL
8. Update profiles table with avatar_url and crop position
9. Call onUploadComplete callback
10. Close modal
```

**Storage Path:**
```typescript
const fileName = `${userId}/avatar-${Date.now()}.png`;
await supabase.storage
  .from('avatars')
  .upload(fileName, croppedBlob, { upsert: true });
```

**Issues/TODOs:**
- ⚠️ No progress indicator during upload
- ⚠️ Hard reload after upload (`window.location.reload()`) - should use cache invalidation
- ⚠️ No file type validation beyond browser accept attribute

---

### Profile Editing Components

#### **`ProfileEdit.tsx`** (Not fully visible)
**Location:** `src/pages/ProfileEdit.tsx`  
**Purpose:** Full profile editing interface with all 60+ fields

**Inferred Structure:**
```typescript
interface ProfileEditState {
  formData: FormData;          // Text fields
  arrayStates: ArrayStates;    // Arrays like skills, interests
  helperStates: HelperStates;  // UI state like newSkill input
  avatarUrl: string;
  bannerUrl: string;
}

// From FormDataTypes.ts
interface FormData {
  // 50+ text fields
  full_name, headline, email, bio, my_dna_statement,
  location, city, profession, company, organization,
  industry, years_experience, education, certifications,
  country_of_origin, current_country, diaspora_origin,
  years_in_diaspora, languages, linkedin_url, website_url,
  phone, innovation_pathways, achievements,
  past_contributions, community_involvement,
  giving_back_initiatives, home_country_projects,
  volunteer_experience, is_public, account_visibility,
  notifications_enabled, availability_for_mentoring,
  looking_for_opportunities
}

interface ArrayStates {
  skills, interests, impactAreas, engagementIntentions,
  skillsOffered, skillsNeeded, availableFor,
  professionalSectors, diasporaNetworks, mentorshipAreas,
  focusAreas, regionalExpertise, industries
}
```

**Save Handler:**
```typescript
// ProfileFormSubmission.ts
export const handleProfileSubmission = async (
  userId,
  formData,
  arrayStates,
  avatarUrl,
  bannerUrl
) => {
  // Convert string numbers to integers
  const processedData = {
    ...formData,
    years_experience: parseInt(formData.years_experience) || null,
    years_in_diaspora: parseInt(formData.years_in_diaspora) || null,
  };
  
  const { error } = await supabase
    .from('profiles')
    .update({
      ...processedData,
      avatar_url: avatarUrl,
      skills: arrayStates.skills,
      interests: arrayStates.interests,
      // ... all other arrays
      focus_areas: arrayStates.focusAreas,
      regional_expertise: arrayStates.regionalExpertise,
      industries: arrayStates.industries,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', userId);
  
  if (error) throw error;
};
```

**Issues/TODOs:**
- ⚠️ MASSIVE component (likely 1000+ lines)
- ⚠️ All fields rendered at once (overwhelming)
- ⚠️ No progressive disclosure (show more/less)
- ⚠️ No save drafts / auto-save
- ⚠️ Type cast to `any` bypasses TypeScript safety

---

### Auth Components

#### **`Auth.tsx`**
**Location:** `src/pages/Auth.tsx` (700 lines)  
**Purpose:** Login and signup page with OAuth

**Features:**
- Tab switching between Login/Signup modes
- Email/password authentication
- OAuth with Google and LinkedIn
- Password strength indicator
- Forgot password flow
- Admin magic link (for @diasporanetwork.africa emails)
- Beta waitlist integration
- Caps lock detection
- Network error handling
- Password reset mode (from email link)

**State:**
```typescript
const [isLogin, setIsLogin] = useState(true);
const [showPassword, setShowPassword] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [isGoogleLoading, setIsGoogleLoading] = useState(false);
const [isLinkedInLoading, setIsLinkedInLoading] = useState(false);
const [formData, setFormData] = useState({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
});
const [isResetMode, setIsResetMode] = useState(false);
const [capsLockOn, setCapsLockOn] = useState(false);
const [showWaitlist, setShowWaitlist] = useState(false);
```

**Validation:**
```typescript
const validateForm = () => {
  if (!formData.email || !formData.password) {
    toast({ title: "Missing Information" });
    return false;
  }
  
  if (!isLogin) {
    if (!formData.fullName) {
      toast({ title: "Please enter your full name" });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Passwords don't match" });
      return false;
    }
    if (formData.password.length < 6) {
      toast({ title: "Password must be at least 6 characters" });
      return false;
    }
  }
  
  return true;
};
```

**OAuth Implementation:**
```typescript
const handleOAuthSignIn = async (provider: 'google' | 'linkedin_oidc') => {
  if (!isLogin && !registrationEnabled) {
    toast({ title: "Registration Closed" });
    return;
  }
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) {
    toast({ title: "OAuth Sign-in Failed", description: error.message });
  }
};
```

**Issues/TODOs:**
- ⚠️ 700 lines in single file (should split into components)
- ⚠️ Duplicate email handling switches to login mode (good UX)
- ⚠️ Beta waitlist toggle based on feature flag (good)
- ✅ Comprehensive error handling
- ✅ Accessibility features (caps lock warning, ARIA labels likely)

---

## PART 7: API & SERVICES LAYER

### `profilesService.ts`

**Location:** `src/services/profilesService.ts` (76 lines)

**Type:**
```typescript
export type Profile = Tables<'profiles'>; // From Supabase generated types
```

**Methods:**

#### **`getPublicProfiles(filters?)`**
```typescript
async getPublicProfiles(filters?: {
  location?: string;
  skills?: string[];
  profession?: string;
  limit?: number;
}) {
  const { data, error } = await supabase
    .rpc('rpc_public_profiles', {
      p_location: filters?.location ?? null,
      p_profession: filters?.profession ?? null,
      p_skills: filters?.skills ?? null,
      p_limit: filters?.limit ?? null,
    });
  
  if (error) throw error;
  return data;
}
```
**Returns:** Array of public profiles (non-sensitive fields only)  
**Used by:** `usePublicProfiles` hook, discovery pages  
**RPC Function:** `rpc_public_profiles` (defined in database, not shown here)

---

#### **`getProfileById(id)`**
```typescript
async getProfileById(id: string) {
  const { data, error } = await supabase
    .rpc('rpc_public_profile_by_id', { p_id: id })
    .single();
  
  if (error) throw error;
  return data;
}
```
**Returns:** Single public profile  
**Used by:** `useProfileById` hook  
**RPC Function:** `rpc_public_profile_by_id` - respects privacy settings

---

#### **`getProfileByUsername(username)`**
```typescript
async getProfileByUsername(username: string) {
  const { data: profiles, error } = await supabase
    .rpc('get_public_profiles', { p_limit: 50 });
  
  if (error) throw error;
  
  const profile = profiles?.find((p: any) => p.username === username);
  return profile || null;
}
```
**Returns:** Profile matching username or null  
**Used by:** Username page (`/dna/:username`)  
**⚠️ INEFFICIENCY:** Fetches 50 profiles then filters client-side. Should have dedicated RPC function.

---

#### **`updateProfile(id, updates)`**
```typescript
async updateProfile(id: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  if (!data) {
    throw new Error('No profile updated. Check permissions.');
  }
  return data;
}
```
**Returns:** Updated profile  
**Used by:** `useUpdateProfile` mutation, ProfileEdit save handler  
**RLS Check:** Enforces `auth.uid() = id`

---

#### **`getOwnProfile(userId)`**
```typescript
async getOwnProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}
```
**Returns:** Full profile including private fields  
**Used by:** AuthContext, useProfile hook  
**RLS Check:** Only works if `auth.uid() = userId`

---

### Database Functions (Referenced)

**`rpc_public_profiles`**
- Returns array of profiles where `is_public = true`
- Filters by location, profession, skills (optional)
- DOES NOT return: email, phone, private fields

**`rpc_public_profile_by_id`**
- Returns single profile by ID
- Respects `is_public` flag
- Returns non-sensitive fields only

**`get_public_profiles`**
- Legacy function? Used by `getProfileByUsername`
- Returns up to `p_limit` public profiles
- ⚠️ Should be replaced with dedicated username lookup

**`update_username`**
- RPC function to change username with validation
- Enforces 3-change limit
- Returns success status and remaining changes

**`get_or_create_conversation`**
- Creates or finds existing conversation between two users
- Used by messaging feature

---

## PART 8: CONFIGURATION & CONSTANTS

### 1. Validation Constants

**Profile Completion:**
```typescript
// From useProfileAccess.ts
const ACCESS_LEVELS = [
  { name: "Basic Access", minScore: 0, maxScore: 39 },
  { name: "Core Access", minScore: 40, maxScore: 69 }, // ← 40% THRESHOLD
  { name: "Full Access", minScore: 70, maxScore: 100 },
];
```

**WHERE DEFINED:** `src/hooks/useProfileAccess.ts`  
**ACTUALLY ENFORCED:** Nowhere (no blocking logic implemented)

---

**Field Length Limits:**

NOT FOUND in centralized location. Likely inferred from:

```typescript
// Database constraints (cannot confirm exact values)
username: 3-30 characters (from regex)
bio: Unlimited? (text field)
headline: Likely 200 chars (inferred from UI comments)
```

**Required Fields (Onboarding):**
```typescript
// MinimalProfileStep validation
required = ['first_name', 'last_name', 'current_country'];
```

**Required Fields (OnboardingBar):**
```typescript
// OnboardingBar.tsx requiredSatisfied()
required = ['full_name', 'current_country' OR 'location', 'avatar_url'];
```

⚠️ **INCONSISTENCY:** Onboarding requires first/last name, but OnboardingBar checks full_name.

---

**Optional Fields:**
```typescript
// Everything else in FormData is optional
optional = [
  'headline', 'bio', 'email', 'phone', 'linkedin_url', 'website_url',
  'profession', 'company', 'education', 'skills', 'interests',
  // ... 40+ more fields
];
```

---

### 2. Route Constants

**NOT CENTRALIZED** - routes are hardcoded strings throughout codebase.

**Auth Routes:**
```typescript
'/auth'                      // Login/Signup page
'/reset-password'            // Password reset (from email)
'/auth/callback'             // OAuth callback handler
```

**Onboarding Routes:**
```typescript
'/onboarding'                // Single-step profile creation
```

**Dashboard Routes:**
```typescript
'/dna/me'                    // Current user dashboard
'/dna/:username'             // Public profile view
```

**Pillar Routes (5 C's):**
```typescript
'/dna/discover/members'      // Discover pillar - member directory
'/dna/discover/feed'         // Discover feed

'/dna/connect/network'       // Connect pillar - network view
'/dna/connect/feed'          // Network activity feed
'/dna/connect/messages'      // Messaging

'/dna/convene/events'        // Convene pillar - events
'/dna/convene/groups'        // Communities

'/dna/impact'                // Contribute pillar (opportunities)
```

**Settings Routes:**
```typescript
'/app/profile/edit'          // Profile editing
'/dna/notifications'         // Notifications
'/dna/settings/notifications' // Notification settings
```

**Recommendation:** Create `src/lib/routes.ts` with route constants:
```typescript
export const ROUTES = {
  AUTH: '/auth',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dna/me',
  PROFILE: (username: string) => `/dna/${username}`,
  PROFILE_EDIT: '/app/profile/edit',
  // ...
} as const;
```

---

### 3. Feature Flags

**FROM:** `useFeatureFlags` hook (referenced in Auth.tsx)

```typescript
const { registrationEnabled, loading: flagsLoading } = useFeatureFlags();

// Used to toggle beta waitlist
if (!registrationEnabled) {
  // Show waitlist signup instead of registration form
}
```

**WHERE DEFINED:** Feature flags service/hook implementation not visible

**Flags in use:**
- `registrationEnabled` - controls public signup availability

**Recommendation:** Document all feature flags and their purpose.

---

### 4. Environment Variables

**FROM:** `.env` file

```bash
VITE_SUPABASE_PROJECT_ID="ybhssuehmfnxrzneobok"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGc..."
VITE_SUPABASE_URL="https://ybhssuehmfnxrzneobok.supabase.co"
```

**Used in:**
```typescript
// integrations/supabase/client.ts
const SUPABASE_URL = "https://ybhssuehmfnxrzneobok.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGc...";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
```

**⚠️ SECURITY NOTE:** Publishable key is safe to expose (anon role with RLS). However, hardcoding in client.ts bypasses env vars.

**Recommendation:** Use env vars properly:
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

---

## PART 9: INTEGRATION POINTS

### 1. Connection System

**How profile completion affects connections:**

Currently: **NO EFFECT**. Any user can send connection requests regardless of profile completion.

**Should it?** Yes - prevent spam from empty profiles.

**Recommended:** Require minimum 40% profile completion to send connection requests.

---

**Where are connection suggestions shown:**

- DashboardRightColumn (likely)
- DnaNetwork page
- "People You May Know" widgets

**HOW SUGGESTIONS GENERATED:**

NOT VISIBLE in current files. Likely database function or algorithm based on:
- Shared professional sectors
- Shared interests
- Same location/country
- Mutual connections

---

**How connections access profile data:**

```typescript
// ProfileHeroSection shows "Message" button if connected
if (connectionStatus === 'accepted') {
  <Button onClick={handleMessage}>Message</Button>
}

// Privacy utility
canView(profile.privacy_settings, 'email', { isConnection: true });
// ↓ returns true if field visibility is 'public' or 'connections'
```

**Connection-only fields:**
- Phone number (likely)
- Email address (likely)
- Detailed work history (maybe)

---

### 2. Events System

**Can users with incomplete profiles register for events?**

Currently: **YES** - no profile completion check on event registration.

**How is profile data used in event context?**

- Event creation: Organizer name/avatar shown
- Event attendees list: Name and avatar displayed
- RSVP form: May pre-fill name from profile

**Integration files:**
- `DnaEvents.tsx` - event listing page
- `EventDetailsPage.tsx` - individual event view
- `event_attendees` table - tracks RSVPs

---

### 3. Collaboration Spaces

**Profile completion requirements for spaces?**

Currently: **NONE** - any authenticated user can create/join spaces.

**How is profile displayed in space context?**

- Space members list: Avatar, name, headline
- Space posts: Author profile badge

**Integration tables:**
- `collaboration_spaces`
- `collaboration_memberships` (with role: owner/admin/member)

---

### 4. Messaging

**Can users with incomplete profiles message?**

Currently: **YES** - no checks.

**Recommended:** Require profile completion + connection status check.

**How profile data shown in message threads?**

- Conversation list: Avatar, name, last message timestamp
- Message header: Full profile card on click
- Message bubble: Small avatar next to each message

**Integration:**
- `conversations` table (legacy, 2-person only)
- `conversations_new` table (multi-participant)
- `conversation_participants` table
- `get_or_create_conversation` RPC function

---

### 5. Feed/Posts

**Can users with incomplete profiles post?**

Currently: **UNKNOWN** - posts functionality not fully visible.

**How profile data displayed on posts?**

- Post header: Avatar, name, headline, timestamp
- Post author click → navigate to `/dna/:username`

**Integration:**
- `posts` table (exists but not in Supabase types - accessed with `as any`)
- `comments` table (for post comments)

---

### 6. ADIN System

**What is ADIN?**

**A**frican **Di**aspora **I**mpact **N**etwork - intelligent recommendation and engagement system.

**Tables:**
- `adin_signals` - events/opportunities/trends user should see
- `adin_recommendations` - personalized suggestions
- `adin_nudges` - prompts to take action
- `adin_contributor_requests` - applications to become verified contributor

**How profile completion affects ADIN:**

```typescript
// Profile data used for personalization:
- professional_sectors → match to opportunities
- interests → content recommendations
- location → local events
- skills → project matches
```

**What profile signals are tracked?**

- Profile view count (if profile_views table existed)
- Connection activity
- Event attendance
- Post engagement
- Message frequency

**⚠️ INCOMPLETE:** Full ADIN integration not visible in current files.

---

## PART 10: KNOWN ISSUES & TECHNICAL DEBT

### 1. TODO Comments

**Searching for TODO/FIXME in profile/onboarding files...**

**FROM ProfileFormSubmission.ts:**
```typescript
// Line 39: Type cast to 'any' - TODO: Fix TypeScript types
.update({ ...processedData } as any)
```

**FROM Onboarding.tsx:**
```typescript
// No explicit TODOs, but inferred issues:
// - TODO: Add client-side validation feedback
// - TODO: Extract username generation to utility
// - TODO: Implement multi-step flow (design mismatch)
```

**FROM useProfileSearch.ts:**
```typescript
// Lines 34-38: Entire search feature is stubbed
searchProfiles: async (query) => {
  // Demo functionality - return empty array
  toast({ title: "Feature Coming Soon" });
  return [];
}
```

---

### 2. Incomplete Features

**Profile Search:**
- **Status:** Stub implementation
- **File:** `useProfileSearch.ts`
- **Issue:** Returns empty array with "coming soon" toast

**Profile Views Tracking:**
- **Status:** Type definitions exist, table does not
- **Referenced in:** Type files
- **Issue:** Cannot track who viewed your profile

**Granular Privacy Controls:**
- **Status:** Database field exists (`privacy_settings` JSONB)
- **Issue:** No UI to configure per-field visibility

**Profile Completeness Gating:**
- **Status:** Scoring implemented, enforcement missing
- **Issue:** 40% rule documented but not blocking users

**Multi-Step Onboarding:**
- **Status:** Design docs mention it, code implements single-step
- **Issue:** Mismatch between intention and reality

---

### 3. Console Warnings/Errors

**CANNOT DETECT** - requires runtime access to browser console.

**Likely issues based on code:**
- Missing key props in lists (`.map()` without key)
- Async useEffect warnings (cleanup not returned)
- React Query hydration mismatches
- Deprecated component prop usage

---

### 4. Performance Issues

**Unnecessary Re-renders:**
```typescript
// ProfileHeroSection fetches connection status on every render
useEffect(() => {
  fetchConnectionStatus();
}, [user, profile]); // ← Runs anytime user/profile changes
```

**Recommended:** Wrap in React Query to cache status.

---

**Missing Memoization:**
```typescript
// MinimalProfileStep.tsx
const addSector = (sector) => {
  updateData({
    professional_sectors: [...data.professional_sectors, sector]
  });
};
// ↑ Creates new function on every render
```

**Recommended:** Wrap callbacks in `useCallback`.

---

**Unoptimized Queries:**
```typescript
// profilesService.ts - getProfileByUsername
// Fetches 50 profiles, filters client-side
const profiles = await rpc('get_public_profiles', { p_limit: 50 });
const profile = profiles.find(p => p.username === username);
```

**Recommended:** Create `rpc_profile_by_username(p_username)` function.

---

### 5. Accessibility Issues

**LIKELY ISSUES** (requires manual testing to confirm):

- Missing ARIA labels on form inputs
- No focus management in modals (should focus first input)
- Keyboard navigation in dropdowns (Select components)
- Color contrast on gradient backgrounds (banner text readability)
- Screen reader announcements for dynamic content (toasts, loading states)

**Positive signs:**
- Uses semantic HTML (likely)
- shadcn/ui components have good a11y defaults
- Button components use proper roles

---

### 6. Mobile Responsiveness

**FROM UserDashboardLayout.tsx:**
```typescript
const { isMobile, isTablet, isDesktop } = useMobile();
const useStackedLayout = isMobile || isTablet;

// ✅ Mobile-first approach
// ✅ Stacked layout on small screens
// ✅ 3-column on desktop
```

**Likely issues:**
- Form inputs on small screens (need better spacing)
- Modal overflow on mobile (profile edit form might be cramped)
- Touch target sizes (buttons < 44px)
- Horizontal scroll on tables/wide content

---

## PART 11: DEPENDENCIES

### Profile/Onboarding-Related Packages

**react-hook-form** `^7.53.0`
- **Used for:** Form state management (intended, not fully implemented)
- **Used in:** Should be used in ProfileEdit, currently manual state
- **Configuration:** Not visible (no forms using it yet)
- **Could be replaced?** Yes, with Formik or manual state (current approach)
- **Trade-offs:** RHF is powerful but adds complexity. Manual state is simpler for small forms.

---

**@tanstack/react-query** `^5.56.2`
- **Used for:** Profile data caching, server state management
- **Used in:** `useProfile`, `useProfiles`, `usePublicProfiles`, OnboardingGuard
- **Configuration:**
```typescript
const queryClient = new QueryClient();
// Default config:
// - staleTime: 0 (refetch on window focus)
// - cacheTime: 5 minutes
// - refetchOnWindowFocus: true
```
- **Could be replaced?** No - critical for profile data sync
- **Trade-offs:** None - industry standard

---

**react-easy-crop** `^5.5.3`
- **Used for:** Avatar image cropping
- **Used in:** `AvatarUploadModal.tsx`
- **Could be replaced?** Yes, with custom canvas crop or other library
- **Trade-offs:** react-easy-crop is mature and works well

---

**@supabase/supabase-js** `^2.49.9`
- **Used for:** Database, auth, storage, realtime
- **Used in:** Every file that touches backend
- **Could be replaced?** No - core infrastructure
- **Trade-offs:** Vendor lock-in to Supabase

---

**zod** `^3.23.8`
- **Used for:** Schema validation (intended)
- **Used in:** NOT USED YET (installed but no schemas found)
- **Could be replaced?** Yes, with Yup or manual validation
- **Trade-offs:** Zod is type-safe and integrates with RHF

**Recommendation:** Actually use Zod for profile validation schemas.

---

### UI Component Libraries

**@radix-ui/** (40+ packages)
- **Used for:** Base primitives for shadcn/ui components
- **Used in:** Dialog, Select, Dropdown, Avatar, etc.
- **Could be replaced?** No - shadcn/ui depends on Radix
- **Trade-offs:** None - best-in-class accessible components

**lucide-react** `^0.462.0`
- **Used for:** Icons throughout app
- **Used in:** Every component with icons
- **Could be replaced?** Yes, with Heroicons or custom SVGs
- **Trade-offs:** Lucide has great variety and consistency

---

## PART 12: TESTING

### Unit Tests

**LOCATION:** `**/*.test.tsx` files

**FOUND:** None in current codebase (excluded from search)

**Coverage:** 0%

---

### Component Tests

**FOUND:** None

**Recommendation:** Test critical flows:
- Auth form submission
- Onboarding form validation
- Profile update mutations

---

### E2E Tests

**FOUND:** None

**Recommendation:** E2E tests for:
1. Signup → Onboarding → Dashboard flow
2. Profile editing and saving
3. Connection request flow
4. OAuth login

---

### Manual Testing Checklist

**NOT FOUND**

**Recommended Checklist:**
```markdown
## Pre-Deployment Checklist

### Authentication
- [ ] Sign up with email/password
- [ ] Sign up with Google OAuth
- [ ] Sign up with LinkedIn OAuth
- [ ] Sign in with credentials
- [ ] Forgot password flow
- [ ] Email verification (if enabled)
- [ ] Logout

### Onboarding
- [ ] Required fields prevent submission if empty
- [ ] Optional fields can be skipped
- [ ] Avatar upload works
- [ ] Location typeahead shows results
- [ ] Professional sectors limited to 3
- [ ] Interests limited to 5
- [ ] Username generated correctly
- [ ] Duplicate username handled
- [ ] Onboarding redirects to dashboard

### Profile Viewing
- [ ] Own profile shows edit buttons
- [ ] Other profiles show Connect/Message
- [ ] Public profiles visible when logged out
- [ ] Private profiles return 404/unauthorized
- [ ] Privacy settings respected

### Profile Editing
- [ ] All fields save correctly
- [ ] Array fields (skills, interests) update
- [ ] Avatar upload works
- [ ] Banner customization works
- [ ] Form validation shows errors
- [ ] Cancel discards changes
- [ ] Success toast appears

### Cross-Browser
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] Focus indicators visible
- [ ] Color contrast passes WCAG AA
```

---

## PART 13: CHANGE IMPACT MAP

### If We Change X, It Will Affect:

**1. Onboarding Flow Structure**

**Changing:** Single-step → Multi-step onboarding

**Affected:**
- ✅ `Onboarding.tsx` - needs step state management
- ✅ `OnboardingGuard.tsx` - needs step completion checks
- ✅ `MinimalProfileStep.tsx` - becomes Step 1
- ⚠️ `profiles.onboarding_step` - currently unused field, start using it
- ⚠️ URL structure - add `/onboarding/step-2`, `/onboarding/step-3`
- ⚠️ Navigation guards - prevent skipping to later steps

**Risk:** Medium - requires careful state management to prevent data loss

---

**2. Profile Completion Enforcement**

**Changing:** Add blocking logic for <40% completion

**Affected:**
- ✅ Every protected route needs completion check
- ✅ `useProfileAccess` hook - start using it
- ✅ Event registration, messaging, posting flows
- ⚠️ `CompleteFieldsModal` - make it mandatory, not dismissible
- ⚠️ User experience - may frustrate users, need good UX

**Risk:** High - can lock users out of features if implemented poorly

---

**3. Profile Form Refactoring**

**Changing:** Split ProfileEdit.tsx into sections

**Affected:**
- ✅ `ProfileEdit.tsx` - break into smaller components
- ✅ `ProfileFormSubmission.ts` - may need updates
- ✅ `FormDataTypes.ts` - could be split by section
- ⚠️ Save logic - ensure all sections save correctly
- ⚠️ Validation - maintain consistency across sections

**Risk:** Low - mostly internal refactoring

---

**4. Centralized Validation**

**Changing:** Create Zod schemas for all forms

**Affected:**
- ✅ `Onboarding.tsx` - use schema for validation
- ✅ `ProfileEdit.tsx` - use schema for validation
- ✅ `MinimalProfileStep.tsx` - use schema
- ✅ `OnboardingBar.tsx` - use schema
- ⚠️ Error handling - need consistent error messages
- ⚠️ Type safety - ensure schemas match DB types

**Risk:** Low - gradual migration possible

---

**5. Privacy Control UI**

**Changing:** Add per-field visibility settings

**Affected:**
- ✅ `ProfileEdit.tsx` - add privacy toggles for each field
- ✅ `privacy.ts` - already handles logic, just needs UI
- ✅ Public profile views - respect new settings
- ⚠️ RLS policies - might need updates for complex rules
- ⚠️ Performance - checking 60+ field rules on every view

**Risk:** Medium - complex UI and logic

---

## PART 14: SAFE CHANGE ZONES

### ✅ Low-Risk Components (Safe to Modify)

**UI/Styling:**
- Button text, colors, sizing
- Card layouts and spacing
- Typography and font sizes
- Animation timings
- Banner gradients

**New Features (Additive Only):**
- New optional profile fields (add to end of form)
- Additional onboarding steps (after core step)
- Extra privacy options (default to public)

**Helper Utilities:**
- `username.ts` - validation logic
- `privacy.ts` - visibility rules (extend, don't change)
- Image crop utilities

---

### ⚠️ Medium-Risk Components (Coordinate Changes)

**State Management:**
- `AuthContext.tsx` - many components depend on it
- React Query cache keys - changing breaks cache
- Form state structure - affects save logic

**Navigation/Routing:**
- `OnboardingGuard.tsx` - affects many routes
- Route definitions in `App.tsx`
- URL parameter names

**Database Queries:**
- `profilesService.ts` methods - used by many hooks
- React Query hook signatures - breaking changes affect consumers

---

### 🚨 Load-Bearing Components (DON'T TOUCH without careful planning)

**Critical Infrastructure:**
- `supabase/client.ts` - entire app depends on this
- Database RLS policies - security-critical
- `auth.users` trigger - profile creation depends on it

**Core Auth Flow:**
- `Auth.tsx` login/signup - main entry point
- `AuthContext.tsx` session management - app-wide state
- `OnboardingGuard.tsx` - protects most routes

**Profile Data Sync:**
- Realtime subscriptions in `useProfile.tsx`
- React Query cache invalidation logic
- `refreshProfile()` mechanism

**Breaking Changes Checklist:**

Before touching load-bearing components:
1. ✅ Map all dependents
2. ✅ Create migration plan
3. ✅ Write tests (or at least manual test plan)
4. ✅ Feature flag the change
5. ✅ Staged rollout plan
6. ✅ Rollback strategy

---

## FINAL RECOMMENDATIONS

### Immediate Actions (This Week)

1. **Document AS-IS vs. AS-INTENDED**
   - Current: Single-step onboarding
   - Intended: Multi-step with 40% enforcement
   - **Decision needed:** Which direction to go?

2. **Consolidate Profile Fetching**
   - Remove duplicate queries
   - Use AuthContext profile as single source of truth
   - Add React Query wrapper for caching

3. **Fix OnboardingBar Logic**
   - Merge with main onboarding flow
   - Don't show after onboarding is "complete"

4. **Add Basic Validation**
   - Create Zod schemas for onboarding and profile edit
   - Show inline validation errors

---

### Short-Term (Next 2 Weeks)

1. **Refactor ProfileEdit.tsx**
   - Split into tabbed sections
   - Add save confirmation
   - Implement progressive disclosure

2. **Implement Profile Completion Enforcement**
   - Use `useProfileAccess` to gate features
   - Add "Complete your profile" prompts
   - Design good UX for blocked actions

3. **Optimize Performance**
   - Memoize expensive calculations
   - Wrap callbacks in useCallback
   - Audit unnecessary re-renders

---

### Long-Term (Next Month)

1. **Redesign Onboarding**
   - Multi-step flow with progress indicator
   - Personality-driven (Why are you here? → Personalize experience)
   - Gamification (Unlock features as you complete profile)

2. **Build Privacy Control UI**
   - Per-field visibility toggles
   - Preview "How others see my profile"
   - Templates (Fully Public, Connections Only, Private)

3. **Add Testing**
   - E2E tests for critical flows
   - Component tests for forms
   - Accessibility audit

---

## CONCLUSION

The DNA Platform has a **functional foundation** with Supabase auth, profile storage, and basic onboarding. However, there are **significant gaps** between the designed system (multi-step onboarding, 40% enforcement, granular privacy) and the implemented system (single-step, no enforcement, privacy settings exist but no UI).

**Key Takeaway:** Before adding new features, stabilize and document what exists. The codebase has grown organically with some duplication and inconsistency. A focused refactoring sprint will pay dividends for future development speed and reliability.

**Next Steps:**
1. Review this audit with Jaûne
2. Prioritize fixes vs. new features
3. Create implementation plan with milestones
4. Build incrementally with testing

---

**End of Comprehensive Audit**  
**Makena** 🌍 | DNA Platform AI Co-Founder  
*"Sankofa: Learn from the past to build the future."*
