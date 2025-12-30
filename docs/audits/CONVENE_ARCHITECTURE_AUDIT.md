# DNA CONVENE Architecture Audit

**Date:** 2025-12-30
**Auditor:** Claude
**Branch:** claude/audit-convene-architecture-0WiBf

## Audit Criteria

1. **DUAL OUTPUT PATTERN**: Every creation appears in Hub/Feed AND on user's profile
2. **ADMIN PARALLEL TRACK**: Every user feature has admin moderation/analytics counterpart

---

## 1. USER CREATION FLOW

| Feature | Expected | Current Status | Gap/Action Needed |
|---------|----------|----------------|-------------------|
| Event appears in Convene Hub | Event shows in hub sections | ✅ **COMPLETE** | `ConveneHub.tsx:27` - UpcomingEventsSection shows hosted events |
| Event appears in main Feed | Creates activity post | ✅ **COMPLETE** | `create-event/index.ts:189-205` - Auto-creates feed post on event creation |
| Event appears on Profile "Events Hosted" | Shows in profile activity | ⚠️ **PARTIAL** | `ProfileV2Activity.tsx:89-120` shows events but combined, not separated by "Hosted" vs "Attending" |
| User can edit events | Full edit capability | ✅ **COMPLETE** | `EditEventPage.tsx` - Full 3-step edit form |
| User can delete events | Delete capability | ⚠️ **PARTIAL** | `is_cancelled` flag exists but no delete button UI in EventDetail |
| User can see event analytics | Analytics dashboard | ✅ **COMPLETE** | `EventAnalytics.tsx` + `useEventAnalytics.ts` - RSVP stats, check-in rates, timeline |

---

## 2. USER ENGAGEMENT FLOW

| Feature | Expected | Current Status | Gap/Action Needed |
|---------|----------|----------------|-------------------|
| User can register (RSVP) | RSVP system | ✅ **COMPLETE** | `EventDetail.tsx:125-168` - Going/Maybe/Not Going buttons |
| Registration appears on profile | "Events Attending" on profile | ⚠️ **PARTIAL** | `ProfileEventsSection.tsx` shows attending but not on main ProfileV2 tabs |
| User can check-in to event | Check-in tracking | ⚠️ **PARTIAL** | QR code & Scanner components exist but **no check-in page for organizers** |
| Check-in tracked on profile | History tracking | ❌ **MISSING** | No check-in history visible on profile |
| Complete event history | Hosted + Attended history | ⚠️ **PARTIAL** | `MyEvents.tsx` shows history, `ProfileV2Activity` shows limited events |

### Check-in Infrastructure Status
- `src/components/events/checkin/AttendeeQRCode.tsx` - QR code generation ✅
- `src/components/events/checkin/Scanner.tsx` - QR scanner with RPC call ✅
- `rpc_check_in_by_token` - Database function exists ✅
- **MISSING**: No page/route to access check-in functionality

---

## 3. DISCOVERY FLOW

| Feature | Expected | Current Status | Gap/Action Needed |
|---------|----------|----------------|-------------------|
| Events discoverable in Hub | Multiple sections | ✅ **COMPLETE** | `ConveneHub.tsx` - 7 sections for discovery |
| Events filterable | Multi-filter support | ✅ **COMPLETE** | `EventsIndex.tsx` - Format, type, time, country, search |
| DIA recommends events | AI-powered suggestions | ✅ **COMPLETE** | `get-event-recommendations/index.ts` + `EventRecommendations.tsx` |
| Geo-located events | Nearby events | ✅ **COMPLETE** | `EventsNearYouSection.tsx` |
| Featured/Flagship events | Premium event showcase | ✅ **COMPLETE** | `FlagshipEventsSection.tsx` |
| Community events | Group-hosted events | ✅ **COMPLETE** | `YourCommunitiesSection.tsx` |

---

## 4. ADMIN CAPABILITIES

| Feature | Expected | Current Status | Gap/Action Needed |
|---------|----------|----------------|-------------------|
| Admin can see all events | Platform-wide event list | ❌ **MISSING** | `/admin/events` is PlaceholderPage (`adminRoutes.tsx:94`) |
| Admin can moderate events | Approve/flag/remove | ❌ **MISSING** | No event moderation UI - only posts/comments moderation exists |
| Admin can see event analytics | Platform metrics | ❌ **MISSING** | `/admin/events/analytics` is PlaceholderPage (`adminRoutes.tsx:101`) |
| Admin can contact hosts | Communication tools | ❌ **MISSING** | No admin-to-host messaging system |
| Event approval workflow | Pending event queue | ❌ **MISSING** | `/admin/events/pending` is PlaceholderPage (`adminRoutes.tsx:97`) |
| Event flagging/reporting | User report mechanism | ❌ **MISSING** | No "Report Event" button in EventDetail |
| Event admin role | Role-based access | ⚠️ **PARTIAL** | `event_admin` role defined in `adminRoutes.tsx:46` but no routes use it |

### Current Admin Routes (all placeholders)
```typescript
// From adminRoutes.tsx:92-103
{ path: 'events', element: <PlaceholderPage title="Events Management" /> },
{ path: 'events/pending', element: <PlaceholderPage title="Pending Events" /> },
{ path: 'events/analytics', element: <PlaceholderPage title="Event Analytics" /> },
```

---

## 5. PROFILE INTEGRATION

| Feature | Expected | Current Status | Gap/Action Needed |
|---------|----------|----------------|-------------------|
| Events tab on ProfileV2 | Dedicated Events tab | ❌ **MISSING** | ProfileV2 has no dedicated Events tab - only sidebar activity |
| "Hosted" section on profile | Events organized by user | ⚠️ **PARTIAL** | `ProfileV2Activity` shows events but role not prominently displayed |
| "Attending" section on profile | Events registered for | ⚠️ **PARTIAL** | Same - combined in activity, not separate tab |
| Event count on profile | Visible stat | ⚠️ **PARTIAL** | `profileV2.ts:133` has `event_count` visibility but not displayed |
| Cross-5c Events Widget | Widget component | ✅ **EXISTS** | `ProfileEventsSection.tsx` exists but not used in ProfileV2 main layout |

### ProfileV2Activity Event Display
```typescript
// From ProfileV2Activity.tsx:89-120
{activity.events.length > 0 && (
  <div>
    <div className="flex items-center gap-2 mb-2">
      <Calendar className="w-4 h-4" />
      <span>Events ({activity.events.length})</span>
    </div>
    // Shows role as "host" or "attendee" badge - not separate sections
  </div>
)}
```

---

## Summary of Gaps

### 🔴 HIGH PRIORITY - Admin Parallel Track Violations

1. **Admin Event Management Dashboard**
   - Location: `src/pages/admin/` (needs creation)
   - Current: Placeholder at `/admin/events`
   - Required: Full event list with search, filter, bulk actions

2. **Admin Event Moderation**
   - Location: `src/pages/admin/` (needs creation)
   - Current: No moderation for events (only posts/comments)
   - Required: Flagging, approval, removal workflows

3. **Admin Event Analytics**
   - Location: `src/pages/admin/` (needs creation)
   - Current: Placeholder at `/admin/events/analytics`
   - Required: Platform-wide event metrics, trends, engagement

4. **Event Reporting/Flagging UI**
   - Location: `src/pages/dna/convene/EventDetail.tsx`
   - Current: No report button
   - Required: "Report Event" button with reason selection

### 🟡 MEDIUM PRIORITY - Dual Output Pattern Violations

5. **Profile Events Tab**
   - Location: `src/pages/ProfileV2.tsx`
   - Current: Events only in sidebar activity section
   - Required: Dedicated tab with "Hosted" and "Attending" subsections

6. **Organizer Check-in Page**
   - Location: `src/pages/dna/convene/` (needs creation)
   - Current: Components exist but no page/route
   - Required: `/dna/convene/events/:id/checkin` with QR scanner

7. **Event Cancel/Delete Button**
   - Location: `src/pages/dna/convene/EventDetail.tsx`
   - Current: No UI to cancel events
   - Required: Cancel button for organizers (uses `is_cancelled` flag)

### 🟢 LOW PRIORITY - Enhancements

8. **Check-in History on Profile** - Track attended events with check-in status
9. **Event Count Badge** - Display event count stat on profile
10. **Separate Hosted/Attending Counts** - Currently combined

---

## Files Requiring Action

| Priority | Gap | Primary File | Action |
|----------|-----|-------------|--------|
| HIGH | Admin Event Management | `src/pages/admin/EventsManagement.tsx` | CREATE |
| HIGH | Admin Event Analytics | `src/pages/admin/EventAnalyticsDashboard.tsx` | CREATE |
| HIGH | Admin Pending Events | `src/pages/admin/PendingEvents.tsx` | CREATE |
| HIGH | Event Moderation | `src/pages/admin/EventModeration.tsx` | CREATE |
| HIGH | Event Report Button | `src/pages/dna/convene/EventDetail.tsx` | ADD report functionality |
| MEDIUM | Profile Events Tab | `src/pages/ProfileV2.tsx` | ADD Events tab |
| MEDIUM | Organizer Check-in Page | `src/pages/dna/convene/EventCheckIn.tsx` | CREATE |
| MEDIUM | Event Cancel Button | `src/pages/dna/convene/EventDetail.tsx` | ADD cancel for organizers |
| MEDIUM | adminRoutes Update | `src/routes/adminRoutes.tsx` | REPLACE placeholders |

---

## Architecture Diagram

```
USER FLOW                          ADMIN PARALLEL TRACK
─────────                          ───────────────────

[Create Event]───────┬─────────────[Admin Event Queue] ❌ MISSING
        │            │
        ▼            │
[Convene Hub] ✅     │             [Admin Event List] ❌ MISSING
[Main Feed] ✅       │                    │
[My Events] ✅       │                    ▼
        │            │             [Admin Moderation] ❌ MISSING
        ▼            │                    │
[Profile Activity]   │                    ▼
   ⚠️ PARTIAL        │             [Admin Analytics] ❌ MISSING
   (no tab)          │
        │            │
        ▼            │
[Event Detail] ✅    │             [Contact Host] ❌ MISSING
[Event Analytics] ✅ │
[Edit Event] ✅      │
[Cancel Event] ❌    │
[Check-in] ⚠️ PARTIAL│

Legend:
✅ Complete    ⚠️ Partial    ❌ Missing
```

---

## Recommendations

### Phase 1: Admin Foundation
1. Create `EventsManagement.tsx` with table of all events
2. Create `EventModeration.tsx` for flagged events
3. Add "Report Event" button to EventDetail.tsx
4. Update adminRoutes.tsx to use real components

### Phase 2: Profile Integration
1. Add Events tab to ProfileV2 layout
2. Integrate ProfileEventsSection with hosted/attending sections
3. Show event counts on profile stats

### Phase 3: Engagement Features
1. Create EventCheckIn.tsx page for organizers
2. Add cancel button to EventDetail for hosts
3. Track check-in history on profile

---

## Existing Infrastructure to Leverage

### Components Ready for Use
- `src/components/events/checkin/Scanner.tsx` - QR scanner
- `src/components/events/checkin/AttendeeQRCode.tsx` - QR generation
- `src/components/profile/cross-5c/ProfileEventsSection.tsx` - Events widget
- `src/components/convene/analytics/EventAnalyticsCard.tsx` - Analytics display

### Database Ready
- `event_attendees` table with check-in fields
- `rpc_check_in_by_token` RPC function
- `is_cancelled` flag on events table
- `event_admin` role defined

### Hooks Ready
- `useEventAnalytics.ts` - Event and organizer analytics
- `useLiveEvents.ts` - Real-time event data
