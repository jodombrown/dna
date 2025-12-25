# DNA Platform - Sprint PRD: Complete 7 Features to 100%

**Date**: December 25, 2024
**Status**: ✅ **ALL 7 FEATURES COMPLETE**
**Completed**: December 25, 2024

---

## Sprint Summary

| # | Feature | Before | After | Status |
|---|---------|--------|-------|--------|
| 1 | Messaging | 85% | ✅ 100% | Soft delete implemented |
| 2 | Opportunities | 70% | ✅ 100% | Application review workflow added |
| 3 | ADIN Recommendations | 60% | ✅ 100% | Complete (Phase 2) |
| 4 | Contribution Cards | 60% | ✅ 100% | Already complete |
| 5 | Regional Hubs | 40% | ✅ 100% | Complete (Phase 2) |
| 6 | Admin Dashboard | 70% | ✅ 100% | Already complete |
| 7 | Content Moderation | 50% | ✅ 100% | Already complete |

---

## Overview

This document provides exact specifications to complete 7 features from ~60% to 100%. Each feature includes current state, gaps, implementation steps, and acceptance criteria.

---

## Technology Context

```
Frontend: React 18 + TypeScript + Vite
Backend: Supabase (PostgreSQL)
Styling: Tailwind CSS with semantic tokens
State: React Query + Zustand
UI: shadcn/ui components
```

**Key Files:**
- Supabase client: `src/integrations/supabase/client.ts`
- Types: `src/integrations/supabase/types.ts` (read-only, auto-generated)
- Services: `src/services/`
- Hooks: `src/hooks/`

---

## Feature 1: Messaging (85% → 100%)

### Current State
- ✅ 1-on-1 conversations work
- ✅ Send/receive messages
- ✅ Conversation list
- ✅ Real-time subscription exists

### Gaps
- ❌ Delete message functionality
- ❌ "Message deleted" placeholder
- ❌ Conversation last_message update after delete

### Implementation

#### 1.1 Database Migration
```sql
-- Add deleted_at column to messages table if not exists
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create soft delete function
CREATE OR REPLACE FUNCTION soft_delete_message(p_message_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE messages 
  SET deleted_at = now()
  WHERE id = p_message_id 
  AND sender_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 1.2 Service Update
File: `src/services/messageService.ts`

Add function:
```typescript
async deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase.rpc('soft_delete_message', {
    p_message_id: messageId
  });
  if (error) throw error;
}
```

#### 1.3 UI Component
File: `src/components/messaging/MessageBubble.tsx`

Add:
- Delete button (trash icon) on hover for own messages
- Confirmation dialog before delete
- Render "Message deleted" if `deleted_at` is set

```tsx
// In message render logic:
if (message.deleted_at) {
  return (
    <div className="text-muted-foreground italic text-sm">
      Message deleted
    </div>
  );
}
```

### Acceptance Criteria
- [ ] User can delete their own messages only
- [ ] Deleted messages show "Message deleted" placeholder
- [ ] Confirmation dialog appears before deletion
- [ ] Other users see "Message deleted" in real-time

---

## Feature 2: Opportunities (70% → 100%)

### Current State
- ✅ Opportunity listings display
- ✅ Application submission works
- ✅ Basic opportunity detail page

### Gaps
- ❌ Application review workflow for org owners
- ❌ Application status updates
- ❌ Applicant notification on status change

### Implementation

#### 2.1 Application Review Page
File: `src/pages/dna/opportunities/ApplicationsReceived.tsx`

Create page showing:
- List of applications for user's opportunities
- Filter by opportunity, status
- Actions: Accept, Reject, Request Info

#### 2.2 Service Functions
File: `src/services/opportunityService.ts`

```typescript
async updateApplicationStatus(
  applicationId: string, 
  status: 'reviewing' | 'accepted' | 'rejected',
  feedback?: string
): Promise<void> {
  const { error } = await supabase
    .from('applications')
    .update({ 
      status, 
      feedback,
      reviewed_at: new Date().toISOString() 
    })
    .eq('id', applicationId);
  
  if (error) throw error;
  
  // Trigger notification to applicant
  // ... notification logic
}

async getReceivedApplications(opportunityId?: string) {
  let query = supabase
    .from('applications')
    .select(`
      *,
      opportunity:opportunities(*),
      applicant:profiles!applications_user_id_fkey(*)
    `)
    .eq('opportunities.created_by', (await supabase.auth.getUser()).data.user?.id);
  
  if (opportunityId) {
    query = query.eq('opportunity_id', opportunityId);
  }
  
  return query.order('applied_at', { ascending: false });
}
```

#### 2.3 Database Migration
```sql
-- Add review fields to applications if not exist
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS feedback TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id);
```

#### 2.4 Route
Add to `src/App.tsx`:
```tsx
<Route path="/dna/opportunities/applications" element={
  <OnboardingGuard><ApplicationsReceived /></OnboardingGuard>
} />
```

### Acceptance Criteria
- [ ] Opportunity creators can view applications
- [ ] Can accept/reject applications with feedback
- [ ] Applicants receive notification on status change
- [ ] Application status visible to applicant

---

## Feature 3: ADIN Recommendations (60% → 100%)

### Current State
- ✅ `rpc_adin_recommend_people` function exists
- ✅ `ConnectionRecommendationsWidget` component exists
- ✅ Basic profile fetching

### Gaps
- ❌ Weighted scoring not refined
- ❌ "Why recommended" tooltip missing
- ❌ Dismiss recommendation option

### Implementation

#### 3.1 Enhanced RPC Function
```sql
CREATE OR REPLACE FUNCTION get_smart_recommendations(
  p_user_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  match_score NUMERIC,
  shared_skills TEXT[],
  shared_interests TEXT[],
  mutual_count INT,
  same_heritage BOOLEAN,
  match_reasons TEXT[]
) AS $$
DECLARE
  v_user_skills TEXT[];
  v_user_interests TEXT[];
  v_user_heritage TEXT[];
BEGIN
  -- Get current user's profile data
  SELECT skills, interests, heritage_countries 
  INTO v_user_skills, v_user_interests, v_user_heritage
  FROM profiles WHERE id = p_user_id;

  RETURN QUERY
  SELECT 
    p.id as user_id,
    (
      -- Skills overlap (25%)
      COALESCE(array_length(ARRAY(SELECT unnest(p.skills) INTERSECT SELECT unnest(v_user_skills)), 1), 0) * 0.25 +
      -- Interests overlap (25%)
      COALESCE(array_length(ARRAY(SELECT unnest(p.interests) INTERSECT SELECT unnest(v_user_interests)), 1), 0) * 0.25 +
      -- Heritage match (20%)
      CASE WHEN p.heritage_countries && v_user_heritage THEN 2.0 ELSE 0 END * 0.20 +
      -- Mutual connections (20%)
      COALESCE((
        SELECT COUNT(*) FROM connections c1
        JOIN connections c2 ON c1.recipient_id = c2.requester_id OR c1.recipient_id = c2.recipient_id
        WHERE c1.requester_id = p_user_id AND c1.status = 'accepted'
        AND (c2.requester_id = p.id OR c2.recipient_id = p.id) AND c2.status = 'accepted'
      ), 0) * 0.20 +
      -- Same location (10%)
      CASE WHEN p.location = (SELECT location FROM profiles WHERE id = p_user_id) THEN 1.0 ELSE 0 END * 0.10
    )::NUMERIC as match_score,
    ARRAY(SELECT unnest(p.skills) INTERSECT SELECT unnest(v_user_skills)) as shared_skills,
    ARRAY(SELECT unnest(p.interests) INTERSECT SELECT unnest(v_user_interests)) as shared_interests,
    COALESCE((
      SELECT COUNT(*)::INT FROM connections 
      WHERE status = 'accepted' 
      AND ((requester_id = p_user_id AND recipient_id IN (
        SELECT CASE WHEN requester_id = p.id THEN recipient_id ELSE requester_id END 
        FROM connections WHERE (requester_id = p.id OR recipient_id = p.id) AND status = 'accepted'
      )) OR (recipient_id = p_user_id AND requester_id IN (
        SELECT CASE WHEN requester_id = p.id THEN recipient_id ELSE requester_id END 
        FROM connections WHERE (requester_id = p.id OR recipient_id = p.id) AND status = 'accepted'
      )))
    ), 0) as mutual_count,
    (p.heritage_countries && v_user_heritage) as same_heritage,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN array_length(ARRAY(SELECT unnest(p.skills) INTERSECT SELECT unnest(v_user_skills)), 1) > 0 
           THEN 'Shared skills' END,
      CASE WHEN array_length(ARRAY(SELECT unnest(p.interests) INTERSECT SELECT unnest(v_user_interests)), 1) > 0 
           THEN 'Common interests' END,
      CASE WHEN p.heritage_countries && v_user_heritage THEN 'Same heritage' END
    ], NULL) as match_reasons
  FROM profiles p
  WHERE p.id != p_user_id
    AND p.is_public = true
    AND NOT EXISTS (
      SELECT 1 FROM connections 
      WHERE (requester_id = p_user_id AND recipient_id = p.id)
         OR (requester_id = p.id AND recipient_id = p_user_id)
    )
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users 
      WHERE (blocker_id = p_user_id AND blocked_id = p.id)
         OR (blocker_id = p.id AND blocked_id = p_user_id)
    )
  ORDER BY match_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 3.2 WhyRecommended Component
File: `src/components/connect/WhyRecommended.tsx`

```tsx
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface WhyRecommendedProps {
  reasons: string[];
  sharedSkills?: string[];
  sharedInterests?: string[];
  mutualCount?: number;
}

export function WhyRecommended({ reasons, sharedSkills, sharedInterests, mutualCount }: WhyRecommendedProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground">
          <Info className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-medium mb-1">Why recommended:</p>
        <ul className="text-sm space-y-1">
          {reasons.map((reason, i) => (
            <li key={i}>• {reason}</li>
          ))}
          {mutualCount > 0 && <li>• {mutualCount} mutual connections</li>}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
```

#### 3.3 Dismiss Recommendation
Add to database:
```sql
CREATE TABLE IF NOT EXISTS dismissed_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  dismissed_user_id UUID REFERENCES profiles(id) NOT NULL,
  dismissed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, dismissed_user_id)
);

ALTER TABLE dismissed_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own dismissals" ON dismissed_recommendations
  FOR ALL USING (auth.uid() = user_id);
```

### Acceptance Criteria
- [ ] Recommendations show match score
- [ ] "Why recommended" tooltip shows reasons
- [ ] Can dismiss recommendations
- [ ] Dismissed users don't reappear

---

## Feature 4: Contribution Cards (60% → 100%)

### Current State
- ✅ Contribution cards display
- ✅ Create contribution card form
- ✅ contribution_needs, contribution_offers tables exist

### Gaps
- ❌ Submit offer flow
- ❌ Owner can accept/reject offers
- ❌ Progress tracking

### Implementation

#### 4.1 Submit Offer Dialog
File: `src/components/contribute/SubmitOfferDialog.tsx`

```tsx
interface SubmitOfferDialogProps {
  needId: string;
  spaceId: string;
  needType: 'funding' | 'skills' | 'time' | 'resources';
  onSuccess?: () => void;
}

// Form fields:
// - message (required, textarea)
// - offered_amount (if funding type)
// - availability (if time type)
```

#### 4.2 Service Functions
File: `src/services/contributionService.ts`

```typescript
export const contributionService = {
  async submitOffer(data: {
    needId: string;
    spaceId: string;
    message: string;
    offeredAmount?: number;
    offeredCurrency?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    return supabase.from('contribution_offers').insert({
      need_id: data.needId,
      space_id: data.spaceId,
      created_by: user.id,
      message: data.message,
      offered_amount: data.offeredAmount,
      offered_currency: data.offeredCurrency || 'USD',
      status: 'pending'
    }).select().single();
  },

  async updateOfferStatus(offerId: string, status: 'accepted' | 'rejected' | 'withdrawn') {
    return supabase.from('contribution_offers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', offerId)
      .select()
      .single();
  },

  async getOffersForNeed(needId: string) {
    return supabase.from('contribution_offers')
      .select(`*, contributor:profiles!contribution_offers_created_by_fkey(*)`)
      .eq('need_id', needId)
      .order('created_at', { ascending: false });
  },

  async getMyOffers() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: null };

    return supabase.from('contribution_offers')
      .select(`*, need:contribution_needs(*), space:spaces(*)`)
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });
  }
};
```

#### 4.3 My Offers Page
File: `src/pages/dna/contribute/MyOffers.tsx`

Display user's submitted offers with status badges.

### Acceptance Criteria
- [ ] Users can submit offers to contribution needs
- [ ] Space owners can accept/reject offers
- [ ] Contributors see their offer status
- [ ] Notifications sent on status change

---

## Feature 5: Regional Hubs (40% → 100%)

### Current State
- ✅ Country pages exist
- ✅ regions, countries tables populated
- ✅ Basic region display

### Gaps
- ❌ Live metrics (member count, events, projects)
- ❌ Regional activity feed
- ❌ Heritage-based filtering

### Implementation

#### 5.1 Regional Metrics Function
```sql
CREATE OR REPLACE FUNCTION get_region_metrics(p_region_id UUID)
RETURNS JSON AS $$
SELECT json_build_object(
  'member_count', (
    SELECT COUNT(DISTINCT p.id) FROM profiles p
    JOIN countries c ON c.name = ANY(p.heritage_countries)
    WHERE c.region_id = p_region_id AND p.is_public = true
  ),
  'event_count', (
    SELECT COUNT(*) FROM events e
    WHERE e.status = 'published' 
    AND e.start_date > now()
    -- Add region filtering based on location
  ),
  'project_count', (
    SELECT COUNT(*) FROM collaboration_spaces cs
    WHERE cs.visibility = 'public' AND cs.status = 'active'
    -- Add region filtering
  ),
  'opportunity_count', (
    SELECT COUNT(*) FROM opportunities o
    WHERE o.status = 'open'
    -- Add region filtering
  )
);
$$ LANGUAGE sql SECURITY DEFINER;
```

#### 5.2 Regional Metrics Component
File: `src/components/regions/RegionalMetrics.tsx`

```tsx
interface RegionalMetricsProps {
  regionId: string;
}

export function RegionalMetrics({ regionId }: RegionalMetricsProps) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['region-metrics', regionId],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_region_metrics', { p_region_id: regionId });
      return data;
    },
    staleTime: 5 * 60 * 1000 // Cache 5 min
  });

  // Render metric cards
}
```

#### 5.3 Regional Hub Page Enhancement
File: `src/pages/regions/RegionalHub.tsx`

Add:
- Metrics widget at top
- "People from this region" section
- "Opportunities in this region" section
- "Events in this region" section

### Acceptance Criteria
- [ ] Each region shows live member/event/project counts
- [ ] Users can discover people by heritage region
- [ ] Opportunities filtered by region
- [ ] Metrics refresh on demand

---

## Feature 6: Admin Dashboard (70% → 100%)

### Current State
- ✅ Basic admin layout
- ✅ User management
- ✅ Some analytics

### Gaps
- ❌ Content moderation queue
- ❌ Bulk actions
- ❌ Detailed analytics

### Implementation

#### 6.1 Moderation Queue Page
File: `src/pages/admin/ModerationQueue.tsx`

```tsx
export default function ModerationQueue() {
  const { data: flags } = useQuery({
    queryKey: ['moderation-queue'],
    queryFn: async () => {
      const { data } = await supabase
        .from('content_flags')
        .select(`
          *,
          reporter:profiles!content_flags_flagged_by_fkey(full_name, avatar_url)
        `)
        .is('resolved_at', null)
        .order('created_at', { ascending: false });
      return data;
    }
  });

  // Render queue with actions
}
```

#### 6.2 Moderation Actions
File: `src/services/moderationService.ts`

```typescript
export const moderationService = {
  async resolveFlag(flagId: string, action: 'approve' | 'remove' | 'warn', notes?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    return supabase.from('content_flags').update({
      resolved_at: new Date().toISOString(),
      resolved_by: user?.id,
      moderator_notes: notes,
      action_taken: action
    }).eq('id', flagId);
  },

  async bulkResolve(flagIds: string[], action: 'approve' | 'remove') {
    return supabase.from('content_flags').update({
      resolved_at: new Date().toISOString(),
      action_taken: action
    }).in('id', flagIds);
  }
};
```

#### 6.3 Database Update
```sql
ALTER TABLE content_flags 
ADD COLUMN IF NOT EXISTS action_taken TEXT;
```

### Acceptance Criteria
- [ ] Admin can view all pending reports
- [ ] Can take actions: approve, remove content, warn user
- [ ] Bulk actions supported
- [ ] Resolution logged with moderator notes

---

## Feature 7: Content Moderation (50% → 100%)

### Current State
- ✅ Report submission works
- ✅ content_flags table exists
- ✅ MyReportsSettings page shows user's reports

### Gaps
- ❌ Admin review queue (covered in Feature 6)
- ❌ User notification on resolution
- ❌ Content removal/hiding

### Implementation

#### 7.1 Content Visibility Update
When admin removes content, update visibility:

```typescript
async removeContent(contentType: string, contentId: string) {
  const table = contentType === 'post' ? 'posts' : 
                contentType === 'comment' ? 'comments' : 
                contentType === 'event' ? 'events' : null;
  
  if (!table) throw new Error('Invalid content type');
  
  // Soft delete or hide
  await supabase.from(table).update({
    visibility: 'removed',
    removed_at: new Date().toISOString()
  }).eq('id', contentId);
}
```

#### 7.2 Notify Reporter on Resolution
```typescript
async notifyReporter(flagId: string, resolution: string) {
  const { data: flag } = await supabase
    .from('content_flags')
    .select('flagged_by')
    .eq('id', flagId)
    .single();
  
  if (flag?.flagged_by) {
    await supabase.from('notifications').insert({
      user_id: flag.flagged_by,
      type: 'report_resolved',
      title: 'Report Reviewed',
      message: `Your report has been reviewed. Action: ${resolution}`,
      data: { flag_id: flagId }
    });
  }
}
```

### Acceptance Criteria
- [ ] Removed content hidden from public view
- [ ] Reporter notified when report is resolved
- [ ] Content author notified if content removed
- [ ] Moderation log maintained

---

## Execution Order

**Priority order for maximum impact:**

1. **Messaging** (15 min) - Simple delete functionality
2. **Content Moderation + Admin Queue** (30 min) - Completes safety features
3. **ADIN Recommendations** (45 min) - Core differentiator
4. **Contribution Cards** (30 min) - Enables contribute flow
5. **Regional Hubs** (30 min) - Geographic intelligence
6. **Opportunities** (30 min) - Complete application flow

---

## Testing Checklist

After each feature:
- [ ] Happy path works
- [ ] Error states handled
- [ ] Loading states shown
- [ ] Mobile responsive
- [ ] No console errors
- [ ] RLS policies work correctly

---

## File Quick Reference

| Feature | Key Files |
|---------|-----------|
| Messaging | `src/services/messageService.ts`, `src/components/messaging/` |
| Opportunities | `src/services/opportunityService.ts`, `src/pages/dna/opportunities/` |
| ADIN | `src/services/connectionService.ts`, `src/components/connect/` |
| Contributions | `src/services/contributionService.ts`, `src/components/contribute/` |
| Regional | `src/pages/regions/`, `src/components/regions/` |
| Admin | `src/pages/admin/`, `src/components/admin/` |
| Moderation | `src/services/moderationService.ts` |

---

*This sprint PRD is ready for Claude Code execution. Each feature is self-contained with exact specifications.*
