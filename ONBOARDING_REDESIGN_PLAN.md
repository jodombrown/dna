# DNA Platform: Onboarding Redesign & 40% Completion Enforcement

## Executive Summary

**Goal:** Transform single-step onboarding into a strategic multi-step flow with enforced 40% profile completion before platform access.

**Current State (Broken):**
- ✅ Single-step onboarding collects minimal data (name, country, avatar, sectors, interests)
- ❌ Sets `onboarding_completed_at` immediately - NO 40% enforcement
- ❌ OnboardingBar appears AFTER onboarding is "complete" (shows for incomplete profiles)
- ❌ Users can access full platform with <40% completion
- ❌ No multi-step UX for thoughtful profile building
- ❌ Profile completion calculated by DB function but never enforced

**Target State (Fixed):**
- ✅ Multi-step onboarding flow (3-4 steps)
- ✅ 40% profile completion REQUIRED before `onboarding_completed_at` is set
- ✅ OnboardingGuard blocks access to `/dna/*` until 40% reached
- ✅ Clean UX with progress indicator
- ✅ Optional "Complete Later" for 40-100% fields
- ✅ OnboardingBar removed (redundant with new flow)

---

## Current System Analysis

### Files & Components Inventory

#### Core Onboarding Files
- `src/pages/Onboarding.tsx` - Single-step onboarding page (WILL BE REFACTORED)
- `src/components/onboarding/MinimalProfileStep.tsx` - Current minimal step
- `src/components/onboarding/OnboardingBar.tsx` - Post-onboarding completion prompt (WILL BE REMOVED)
- `src/components/auth/OnboardingGuard.tsx` - Route guard (WILL BE ENHANCED)

#### Validation & Form Logic
- `src/components/onboarding/validation/OnboardingValidation.ts` - Multi-step validation (EXISTS but unused)
- `src/components/profile/form/` - Profile form components (for reference)

#### Database Layer
- `profiles` table has:
  - `onboarding_completed_at` - Currently set too early
  - `profile_completion_percentage` - Calculated by DB function
  - 60+ fields for comprehensive profile
- DB Functions:
  - `calculate_profile_completion_percentage()` - Returns 0-100
  - `calculate_profile_completion_score()` - Detailed scoring

#### Auth Flow
- `src/pages/Auth.tsx` - Redirects to `/dna/me` after auth
- `src/contexts/AuthContext.tsx` - Session management
- OnboardingGuard checks `onboarding_completed_at` and redirects to `/onboarding` if null

---

## The Problem: Current Flow is Broken

### Current User Journey
```
1. User signs up → Auth.tsx
2. Redirects to /onboarding (OnboardingGuard sees no onboarding_completed_at)
3. MinimalProfileStep collects:
   - first_name, last_name
   - current_country
   - avatar_url
   - professional_sectors (array)
   - interests (array)
4. On submit:
   ❌ Sets onboarding_completed_at = NOW  <-- THIS IS THE BUG
   ❌ No check for 40% completion
5. Redirects to /dna/me
6. OnboardingBar appears AGAIN asking for same fields (because profile incomplete)
7. User can access full platform with <10% profile completion
```

### Why This is Broken
1. **No 40% enforcement** - Users can access platform with minimal data
2. **Poor UX** - OnboardingBar re-asks for data already collected
3. **Wasted opportunity** - Single step doesn't build engagement
4. **Inconsistent** - DB calculates completion but it's never used
5. **Discovery broken** - ConnectionRecommendations filters for `>=40%` but most users won't qualify

---

## Solution: Multi-Step Onboarding with Enforcement

### New User Journey

```
1. Sign up → Auth
2. Redirect to /onboarding
3. Multi-step flow:
   
   STEP 1: Identity & Presence (Required - 15%)
   - first_name, last_name
   - avatar_url (upload)
   - current_country
   - headline (professional tagline)
   
   STEP 2: Professional Foundation (Required - 15%)
   - profession or professional_role
   - professional_sectors (select 2+)
   - years_experience (range slider)
   - skills (select 3+)
   
   STEP 3: Diaspora & Impact (Required - 15%)
   - country_of_origin
   - diaspora_origin (if different)
   - interests (select 2+)
   - my_dna_statement (why you're here - 50 chars min)
   
   [CHECKPOINT: Should be at ~45% completion]
   
   STEP 4: Discovery & Matching (Optional - brings to 60-70%)
   - focus_areas (2+)
   - regional_expertise (1+)
   - industries (1+)
   - engagement_intentions (what you want to do)
   
   Button: "Save & Start Exploring" or "Complete Later"

4. On final submit:
   ✅ Calculate profile_completion_percentage
   ✅ IF >= 40%: Set onboarding_completed_at
   ✅ ELSE: Show error "Please complete required fields"
   
5. Redirect to /dna/me with >=40% completion
6. No OnboardingBar (it's gone!)
7. Optional ProfileCompletionWidget suggests 40-100% improvements
```

---

## Technical Implementation Plan

### Phase 1: Create New Onboarding Components

**New Files to Create:**
```
src/components/onboarding/steps/
  ├── IdentityStep.tsx          (Step 1: Name, avatar, country, headline)
  ├── ProfessionalStep.tsx      (Step 2: Profession, sectors, experience, skills)
  ├── DiasporaImpactStep.tsx    (Step 3: Origin, interests, DNA statement)
  └── DiscoveryStep.tsx         (Step 4: Focus areas, regional, industries)

src/components/onboarding/
  ├── OnboardingProgressBar.tsx (Visual progress: Step 1/4, 45% complete)
  ├── OnboardingLayout.tsx      (Shared layout with navigation)
  └── useOnboardingForm.ts      (Shared form state hook)
```

**Reuse Existing:**
- `FormDataTypes.ts` - Already has all field types
- `OnboardingValidation.ts` - Already has step validation
- Profile form components (AvatarUploader, TagMultiSelect, etc.)

### Phase 2: Refactor Onboarding.tsx

**New Structure:**
```typescript
// src/pages/Onboarding.tsx
const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>({...});
  
  const steps = [
    { id: 1, component: IdentityStep, title: "Welcome to DNA" },
    { id: 2, component: ProfessionalStep, title: "Your Professional Identity" },
    { id: 3, component: DiasporaImpactStep, title: "Your Diaspora Story" },
    { id: 4, component: DiscoveryStep, title: "Connect & Discover" }
  ];
  
  const handleNext = async () => {
    // Validate current step
    const errors = await validateStep(currentStep, formData);
    if (errors.length > 0) {
      // Show errors
      return;
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };
  
  const handleSubmit = async () => {
    // 1. Upsert profile with all collected data
    await supabase.from('profiles').upsert({...formData, updated_at: now()});
    
    // 2. Call DB function to calculate completion
    const { data: completion } = await supabase.rpc(
      'calculate_profile_completion_percentage', 
      { profile_id: user.id }
    );
    
    // 3. Enforce 40% rule
    if (completion < 40) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete all required fields to continue.",
        variant: "destructive"
      });
      return;
    }
    
    // 4. Mark onboarding complete
    await supabase.from('profiles').update({
      onboarding_completed_at: new Date().toISOString()
    }).eq('id', user.id);
    
    // 5. Redirect
    navigate('/dna/me');
  };
};
```

### Phase 3: Enhance OnboardingGuard

**Update Logic:**
```typescript
// src/components/auth/OnboardingGuard.tsx

// Add completion check
const { data: profile } = await supabase
  .from('profiles')
  .select('onboarding_completed_at, profile_completion_percentage')
  .eq('id', user.id)
  .single();

// If onboarding marked complete BUT <40%, reset it
if (profile.onboarding_completed_at && profile.profile_completion_percentage < 40) {
  await supabase.from('profiles').update({
    onboarding_completed_at: null
  }).eq('id', user.id);
  
  navigate('/onboarding');
  return;
}

// Normal onboarding check
if (!profile.onboarding_completed_at) {
  navigate('/onboarding');
}
```

### Phase 4: Remove OnboardingBar

**Changes:**
1. Delete `src/components/onboarding/OnboardingBar.tsx`
2. Remove OnboardingBar imports from dashboard files:
   - `src/components/dashboard/DNADashboard.tsx`
   - `src/components/dashboard/DashboardCenterColumn.tsx`
3. Keep ProfileCompletionWidget for 40-100% improvements

### Phase 5: Testing & Migration

**Test Cases:**
1. New user signup → completes all 4 steps → reaches 45% → allowed in
2. User tries to skip required fields → validation blocks
3. User completes steps → reaches only 35% → blocked with error
4. Existing user with <40% → onboarding_completed_at reset → redirected to /onboarding
5. Existing user with >=40% → not affected

---

## Field Mapping: What Contributes to 40%?

### Database Completion Calculation
The DB function `calculate_profile_completion_percentage` uses these weighted fields:

**High Value (5 points each):**
- full_name
- avatar_url
- headline
- bio
- my_dna_statement
- profession or professional_role
- current_country
- country_of_origin

**Medium Value (3 points each):**
- professional_sectors (array, need 2+)
- skills (array, need 3+)
- interests (array, need 2+)
- years_experience
- diaspora_origin

**Lower Value (1-2 points each):**
- focus_areas, regional_expertise, industries
- linkedin_url, website_url
- education, certifications

### To Reach 40%, User Must Provide:
**Step 1 (15%):** name, avatar, country, headline  
**Step 2 (15%):** profession, sectors (2), skills (3), experience  
**Step 3 (15%):** origin country, interests (2), DNA statement  
**Step 4 (optional):** Brings to 50-70% but not required

---

## UI/UX Design

### Progress Indicator
```
┌─────────────────────────────────────────────────────────┐
│  Welcome to DNA                          Step 2 of 4    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░  45% Complete│
└─────────────────────────────────────────────────────────┘
```

### Step Navigation
- **Back button** - Available on steps 2-4
- **Next button** - Validates current step, advances
- **Skip for now** - Only on step 4 (optional discovery fields)
- **Save & Explore** - Final button (only enabled if >=40%)

### Validation Display
- Inline errors on blur
- Summary errors at top of step
- Cannot advance until step valid
- Clear required field indicators

---

## Migration Strategy

### For Existing Users

**Option A: Grandfather Clause (Recommended)**
```sql
-- Leave existing users alone if they have ANY data
-- Only enforce 40% on new signups after deployment
```

**Option B: Soft Migration**
```sql
-- Reset onboarding_completed_at for users <40%
UPDATE profiles 
SET onboarding_completed_at = NULL 
WHERE profile_completion_percentage < 40 
AND onboarding_completed_at IS NOT NULL;
```

**Option C: Grace Period**
```typescript
// In OnboardingGuard:
const ENFORCEMENT_START_DATE = '2025-11-10';
const accountCreated = new Date(user.created_at);
const enforcementDate = new Date(ENFORCEMENT_START_DATE);

if (accountCreated > enforcementDate) {
  // New users: strict 40% enforcement
} else {
  // Existing users: soft nudge via ProfileCompletionWidget
}
```

**Recommended:** Option A (grandfather) for MVP, Option B for growth phase

---

## Success Metrics

### Pre-Launch
- [ ] Multi-step onboarding flow built
- [ ] 40% completion enforced
- [ ] OnboardingBar removed
- [ ] Existing users tested
- [ ] New signup flow tested

### Post-Launch (Week 1)
- Avg new user completion: Target >45%
- Onboarding abandonment rate: Target <30%
- Time to complete: Target 5-8 minutes
- % users reaching discovery step: Target >60%

### Post-Launch (Month 1)
- % active users with >=40%: Target >85%
- Connection recommendations quality (more candidates available)
- User feedback on onboarding UX

---

## Rollout Plan

### Sprint 1: Build Core Flow (Week 1)
- Day 1-2: Create step components (Identity, Professional, Diaspora)
- Day 3-4: Refactor Onboarding.tsx with multi-step logic
- Day 5: Add completion calculation & enforcement

### Sprint 2: Polish & Test (Week 2)
- Day 1: Create Discovery step (optional)
- Day 2: Build progress indicator & navigation
- Day 3: Remove OnboardingBar, update dashboards
- Day 4-5: Test existing users, new signups, edge cases

### Sprint 3: Deploy & Monitor (Week 3)
- Day 1: Deploy to staging
- Day 2-3: User testing with real accounts
- Day 4: Deploy to production
- Day 5: Monitor metrics, fix bugs

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Existing users forced to re-onboard | High | Use grandfather clause or grace period |
| Onboarding too long, users abandon | Medium | Make step 4 optional, clear progress |
| 40% calculation changes, breaks flow | Medium | Version DB function, add fallback logic |
| Users stuck at 39% can't figure out why | Medium | Show missing fields clearly in error message |
| Performance: DB function call on every submit | Low | Cache result, only recalc on profile update |

---

## Open Questions

1. **Should we reset existing users <40%?** → Decision needed
2. **Can users save progress mid-flow?** → Recommend yes (draft profile)
3. **What if DB function fails?** → Fallback to client-side calculation?
4. **Show completion % during onboarding?** → Yes, in progress bar
5. **Allow skip on any step?** → Only step 4 (Discovery)

---

## Next Steps

**Awaiting your approval to:**
1. Create the 4 step components
2. Refactor Onboarding.tsx with multi-step logic
3. Add 40% completion enforcement
4. Remove OnboardingBar
5. Update OnboardingGuard with completion check

**Or, we can:**
- Adjust the steps (different grouping?)
- Change which fields are required
- Modify the 40% threshold
- Start with just 2-3 steps instead of 4

**What would you like to change or approve to proceed?**
