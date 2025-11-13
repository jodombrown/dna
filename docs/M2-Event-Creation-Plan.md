# M2 - Event Creation, RSVP & My Events

## Objective
Let eligible users host events and manage their attendance across the platform.

---

## Features to Build

### 1. Event Creation Form (`/dna/convene/events/new`)

**Eligibility Gate:**
- Authenticated user
- `profile_completion_percentage >= 40%`
- Not banned/flagged
- User type: individual or organization

**Form Fields:**
```typescript
interface CreateEventForm {
  // Basic Info
  title: string;                    // Required, max 200 chars
  description: string;              // Required, rich text
  event_type: EventType;            // Required dropdown
  
  // Format & Location
  format: 'in_person' | 'virtual' | 'hybrid';  // Required
  
  // In-person/Hybrid fields (conditional)
  location_name?: string;           // Venue name
  location_address?: string;        // Full address
  location_city?: string;           // City
  location_country?: string;        // Country
  
  // Virtual/Hybrid fields (conditional)
  meeting_url?: string;             // Zoom/Meet link
  meeting_platform?: string;        // Platform name
  
  // Time
  start_time: string;               // Required, datetime picker
  end_time: string;                 // Required, datetime picker
  timezone: string;                 // Default from user profile
  
  // Settings
  max_attendees?: number;           // Optional capacity
  is_public: boolean;               // Default true
  requires_approval: boolean;       // Default false
  allow_guests: boolean;            // Default true
  
  // Media
  cover_image_url?: string;         // Optional upload
}
```

**Validation Rules:**
- Title: 10-200 characters
- Description: Min 50 characters
- End time must be after start time
- Start time must be in the future
- If in_person or hybrid: location fields required
- If virtual or hybrid: meeting_url required
- Max attendees must be > 0 if set

**UI Components:**
- Multi-step wizard OR single long form (recommend wizard)
- Step 1: Basic Info (title, description, type)
- Step 2: Format & Location
- Step 3: Time & Settings
- Step 4: Review & Publish

---

### 2. Create Event Edge Function

**Path:** `supabase/functions/create-event/index.ts`

**Logic:**
```typescript
1. Verify authentication
2. Fetch user profile
3. Check eligibility:
   - profile_completion_percentage >= 40%
   - Not banned (check banned_users table)
4. Validate input data
5. Insert into events table
6. Return created event with ID
7. Optional: Create initial notification for followers
```

**Response:**
```typescript
{
  success: boolean;
  event?: Event;
  error?: string;
}
```

---

### 3. My Events Page (`/dna/convene/my-events`)

**Layout:**
Tabs: `Hosting` | `Attending`

**Hosting Tab:**
- Shows events where `organizer_id = current_user.id`
- Grouped by: Upcoming | Past
- Each event card shows:
  - Title
  - Date/time
  - Format
  - Attendee count
  - Actions: View | Edit | Manage Attendees

**Attending Tab:**
- Shows events where user has RSVP'd (status = 'going' or 'maybe')
- Grouped by: Upcoming | Past
- Each event card shows:
  - Title
  - Date/time
  - Format
  - RSVP status badge
  - Actions: View | Change RSVP

**Empty States:**
- "You haven't created any events yet. Host one to bring the diaspora together!"
- "You haven't RSVP'd to any events yet. Browse upcoming events."

---

### 4. RSVP Edge Function (Optional Enhancement)

**Path:** `supabase/functions/rsvp-to-event/index.ts`

**Why Edge Function?**
- Can check capacity limits
- Can handle waitlist logic
- Can trigger notifications
- Can validate approval requirements

**Logic:**
```typescript
1. Verify authentication
2. Fetch event details
3. Check if max_attendees reached:
   - If yes and no waitlist → return error
   - If yes and waitlist → set status = 'waitlisted'
4. Check if requires_approval:
   - If yes → set status = 'pending'
5. Upsert event_attendees record
6. Create notification for organizer (if pending)
7. Return updated status
```

---

### 5. Calendar Export (.ics)

**Already Implemented in M1!** ✅

Just verify it works correctly:
- Downloads .ics file
- Contains: title, start/end time, location/URL, description
- Compatible with Google Calendar, Apple Calendar, Outlook

---

### 6. Edit Event Page (`/dna/convene/events/:id/edit`)

**Access Control:**
- Only organizer can edit
- Cannot edit past events
- Shows warning if event has attendees

**Form:**
- Pre-populate with existing event data
- Same fields as create form
- Add "Cancel Event" button (sets `is_cancelled = true`, requires reason)

**Update Edge Function:**
`supabase/functions/update-event/index.ts`

**Logic:**
```typescript
1. Verify authentication
2. Verify user is organizer
3. Validate changes
4. Update event record
5. If significant changes (time/location):
   - Create notifications for all attendees
6. Return updated event
```

---

## Database Considerations

### Tables Used:
- `events` (already exists)
- `event_attendees` (already exists)
- `profiles` (for eligibility check)
- `banned_users` (for moderation check)
- `notifications` (for attendee/organizer alerts)

### Indexes Needed:
Check if these exist, add if missing:
```sql
CREATE INDEX IF NOT EXISTS idx_events_organizer_start 
  ON events(organizer_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_event_attendees_user_status 
  ON event_attendees(user_id, status, event_id);
```

---

## Success Metrics

Track:
- Events created per week
- % of events with >0 attendees
- Average time from profile completion to first event hosted
- % of users who RSVP then check-in (future)

---

## Implementation Order

1. **Create Event Form** - Most important, user-facing
2. **Create Event Edge Function** - Backend validation
3. **My Events Page** - Let users manage their events
4. **Edit Event** - Allow organizers to update
5. **Enhanced RSVP** (optional) - Better capacity/waitlist handling

---

## Testing Checklist

- [ ] User with profile < 40% cannot create event (see error message)
- [ ] User with profile >= 40% can create event
- [ ] Virtual event requires meeting_url
- [ ] In-person event requires location fields
- [ ] End time before start time shows error
- [ ] Created event appears on /dna/convene
- [ ] Created event appears in My Events > Hosting
- [ ] Organizer can edit their event
- [ ] Non-organizer cannot edit event
- [ ] RSVP appears in My Events > Attending
- [ ] Calendar export downloads valid .ics file

---

## Open Questions

1. **Image Upload:** Should we integrate Supabase Storage for cover images?
2. **Recurring Events:** Out of scope for MVP, but plan for future?
3. **Co-hosts:** Allow multiple organizers? (Later milestone)
4. **Waitlist Auto-Promotion:** Manual or automatic when spot opens?
5. **Reminders:** Build in M2 or defer to M4?

**Recommendation:** Keep M2 focused on creation & management. Defer reminders and advanced features to M4.
