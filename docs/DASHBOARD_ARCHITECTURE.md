# DNA Dashboard: 3-Column Architecture Assessment

## 📐 Layout Overview

The `/dna/me` dashboard uses a **LinkedIn-inspired 3-column layout** with independent scrolling regions:

```
┌─────────────────────────────────────────────────────────────────┐
│                        UNIFIED HEADER (Fixed)                    │
│  Feed | My DNA | Connect | Network | Events | Messages | Opps   │
└─────────────────────────────────────────────────────────────────┘
┌──────────────┬───────────────────────────┬──────────────────────┐
│              │                           │                      │
│  LEFT 25%    │      CENTER 50%           │     RIGHT 25%        │
│  Profile &   │   Feed & Activity         │   Growth & Widgets   │
│  Navigation  │   Main Content            │   Recommendations    │
│              │                           │                      │
│  ↕ Scroll    │    ↕ Scroll              │    ↕ Scroll          │
│              │                           │                      │
└──────────────┴───────────────────────────┴──────────────────────┘
```

**Technical Implementation:** `src/components/dashboard/UserDashboardLayout.tsx`
- Desktop: 3 independent scrollable columns (25% / 50% / 25%)
- Mobile: Single stacked column (Center → Left → Right)

---

## 🔷 LEFT COLUMN (25%) - Profile & Identity Hub

### **Purpose**
Persistent user identity, quick stats, and navigation shortcuts

### **Component:** `src/components/dashboard/DashboardLeftColumn.tsx`

### **Content Sections**

#### 1. **Profile Preview Card**
```typescript
// Always visible, sticky context
- Avatar (clickable → /dna/me)
- Full Name
- Headline/Title
- Location
- Edit Profile button (→ /dna/me/edit)
```

**Routing:**
- Avatar click → Stays on `/dna/me` (already there)
- Edit Profile → `/dna/me/edit` (with back button)

---

#### 2. **Impact Areas** (if defined)
```typescript
// Badge display of user's Africa focus areas
- Array of impact_areas from profile
- Displayed as colored badges
```

---

#### 3. **Community Stats**
```typescript
// Real-time metrics from database
┌────────────────────┐
│ 🔗 Connections: 0  │
│ 📂 Projects: 0     │
│ 👁️  Profile Views: 0│
└────────────────────┘
```

**Data Source:**
- Connections: `SELECT COUNT(*) FROM connections WHERE status='accepted'`
- Projects: `SELECT COUNT(*) FROM collaboration_memberships WHERE status='approved'`
- Views: Placeholder (future analytics)

---

#### 4. **Quick Links**
```typescript
// Navigation shortcuts
- Find Connections → /connect
- Network → /dna/network
- Explore Opportunities → /opportunities
```

**Routing Behavior:**
- All links navigate away from `/dna/me` to dedicated pages
- Should highlight active link in main nav when clicked

---

### **Scrolling Behavior**
```css
/* Desktop */
.left-column {
  overflow-y: auto;
  height: calc(100vh - 4rem); /* Minus header */
  padding: 24px;
}
```

**Scroll Triggers:**
- Profile sections exceed viewport height
- Skills/impact areas expand beyond visible area

**Current Status:** ✅ Working (independent scroll)

---

## 🔶 CENTER COLUMN (50%) - Main Content & Activity Feed

### **Purpose**
Primary engagement area - feed, opportunities, profile details

### **Component:** `src/components/dashboard/DashboardCenterColumn.tsx`

### **Content Sections (Top → Bottom)**

#### 1. **Welcome Header**
```typescript
// Personalized greeting
Welcome back, Jaûne!
Connect with African diaspora professionals worldwide

Badges:
- 🌍 Yoruba Linda, CA
- 💼 Ecosystem builder
- 📍 Yoruba Linda, CA

Profile Completion: 80% ⭕ (circular progress)
```

**Conditional:**
- `isOwnProfile=true` → "Welcome back, [name]"
- `isOwnProfile=false` → Just shows name + headline

---

#### 2. **Action Cards Grid** (2x2)
```typescript
┌──────────────────┬──────────────────┐
│ Discover         │ My Network       │
│ Professionals    │ Manage conns     │
├──────────────────┼──────────────────┤
│ Messages         │ People You       │
│ Connect privately│ May Know         │
└──────────────────┴──────────────────┘
```

**Routing:**
- Discover Professionals → `/connect`
- My Network → `/dna/network`
- Messages → `/messages`
- People You May Know → Opens inline recommendations

---

#### 3. **Your Feed Tabs**
```typescript
┌─────────────────────────────────┐
│ [Opportunities] | Following     │
├─────────────────────────────────┤
│                                 │
│  Empty state:                   │
│  💼 No opportunities yet        │
│  Check back soon for new        │
│  contribution opportunities     │
│                                 │
└─────────────────────────────────┘
```

**Tab Behavior:**
- Opportunities: Shows feed from `opportunities` table
- Following: Shows posts from connected users

**Future Data:**
- Opportunities → Filtered by user's `impact_areas` + `skills`
- Following → Posts from `connections` where `status='accepted'`

---

#### 4. **About Section**
```typescript
// Profile bio display
📖 About
[profile.bio content]

- Shows if bio exists
- Editable via Edit Profile
- Rich text formatting (future)
```

---

#### 5. **My Diaspora Journey** (if defined)
```typescript
// Personal story
🌍 My Diaspora Journey
[profile.diaspora_story]

- Optional field
- Markdown support (future)
```

---

#### 6. **Skills & Expertise**
```typescript
// Skill tags
✨ Skills & Expertise
[Capacity Building] [Venture Building] [Ecosystem Building]

- Array from profile.skills
- Clickable to filter connections (future)
```

---

#### 7. **Networking Goals** (if defined)
```typescript
// User intentions
🎯 What I'm Looking For
[profile.engagement_intentions array as bullets]
```

---

#### 8. **Network Impact** (Owner Only)
```typescript
// Analytics dashboard
📊 Your Network Impact
┌───────────┬─────────────┬──────────┐
│    0      │      0      │    0     │
│Connections│Profile Views│ Messages │
└───────────┴─────────────┴──────────┘
```

---

### **Scrolling Behavior**
```css
/* Center column - Primary scroll area */
.center-column {
  overflow-y: auto;
  height: calc(100vh - 4rem);
  padding: 24px;
  max-width: 800px; /* Constrained for readability */
  margin: 0 auto;
}
```

**Expected Scroll Depth:** ~2-3 viewport heights
- Welcome → Action Cards → Feed → About → Journey → Skills → Impact

**Current Status:** ✅ Working (independent scroll)

---

## 🔸 RIGHT COLUMN (25%) - Growth & Engagement

### **Purpose**
Profile completion, recommendations, upcoming events

### **Component:** `src/components/dashboard/DashboardRightColumn.tsx`

### **Content Sections (Top → Bottom)**

#### 1. **Profile Completion Widget** (Owner Only)
```typescript
✨ Complete Your Profile

Progress: 30% ━━━━━━░░░░░░░░░░░░

⚠️ Complete 10% more to unlock all features

Missing to reach 100%:
• Write a bio (50+ characters)
• Add Africa focus areas

[Complete Profile →] → /dna/me/edit
```

**Component:** `src/components/connect/ProfileCompletionWidget.tsx`

**Logic:**
- Calculates completion from `profile_completion_percentage` function
- Shows missing fields
- CTA button routes to edit page

**Conditional Rendering:**
- Only shows if `isOwnProfile=true`
- Hides if completion >= 100%

---

#### 2. **Recommended Connections** (Owner Only)
```typescript
🤝 Recommended Connections

No recommendations available yet.
Complete your profile to see suggestions!

[Future: Shows 3-5 suggested users]
```

**Component:** Part of `DashboardRightColumn.tsx`

**Future Data Source:**
```sql
-- Users with similar impact_areas/skills
SELECT * FROM profiles 
WHERE impact_areas && current_user.impact_areas
AND id NOT IN (SELECT b FROM connections WHERE a = current_user.id)
LIMIT 5
```

---

#### 3. **People You May Know**
```typescript
👥 People You May Know

┌──────────────────────────────┐
│ [Avatar] Mathew Jackson      │
│ Venture Builder | Ecosystem  │
│          [+ Connect]         │
└──────────────────────────────┘

[Show more →]
```

**Routing:**
- Avatar/name click → `/dna/[username]` (user profile page)
- Connect button → Opens connection request modal

**Data:** Same algorithm as Recommended Connections

---

#### 4. **Upcoming Events**
```typescript
📅 Upcoming Events

No upcoming events

[Explore Events →] → /dna/events
```

**Component:** Custom widget (needs to be created)

**Future Data:**
```sql
-- Events user is registered for + nearby events
SELECT * FROM events 
WHERE start_time > NOW()
AND (
  id IN (SELECT event_id FROM event_registrations WHERE user_id = current_user.id)
  OR location LIKE '%{user.city}%'
)
ORDER BY start_time ASC
LIMIT 3
```

---

### **Scrolling Behavior**
```css
/* Right column - Widget stack */
.right-column {
  overflow-y: auto;
  height: calc(100vh - 4rem);
  padding: 24px;
}
```

**Expected Scroll:** 1-2 viewport heights
- Widgets stack vertically
- Each widget is self-contained card

**Current Status:** ✅ Working (independent scroll)

---

## 🔄 Navigation & Routing Map

### **Internal Column Navigation** (Stays on `/dna/me`)
```typescript
Left Column:
- Edit Profile → /dna/me/edit (✅ Has back button)

Center Column:
- All action cards navigate away (see below)

Right Column:
- Complete Profile → /dna/me/edit (✅ Has back button)
```

---

### **External Navigation** (Leaves `/dna/me`)
```typescript
Quick Links (Left):
- Find Connections → /connect
- Network → /dna/network
- Explore Opportunities → /opportunities

Action Cards (Center):
- Discover Professionals → /connect
- My Network → /dna/network
- Messages → /messages

Widgets (Right):
- Show more connections → /connect
- Explore Events → /dna/events
- User profile click → /dna/[username] (✅ Has back button)
```

---

### **Routing Table**

| Element | Route | Back Button? | Context |
|---------|-------|--------------|---------|
| Edit Profile | `/dna/me/edit` | ✅ Yes → `/dna/me` | ProfileEdit.tsx |
| User Profile | `/dna/[username]` | ✅ Yes → `navigate(-1)` | Username.tsx |
| Find Connections | `/connect` | ❌ Use main nav | ConnectPage |
| Network | `/dna/network` | ❌ Use main nav | NetworkPage |
| Messages | `/messages` | ❌ Use main nav | MessagesPage |
| Events | `/dna/events` | ❌ Use main nav | EventsPage |
| Opportunities | `/opportunities` | ❌ Use main nav | OpportunitiesPage |

---

## 🎨 Visual Hierarchy & Information Architecture

### **Reading Flow (F-Pattern)**
```
1. Left: Who am I? (Identity anchor)
   ↓
2. Center: What's happening? (Activity/Feed)
   ↓
3. Right: What should I do? (Recommendations/Actions)
```

### **Attention Priority**
```
Primary (Center Column):
- Welcome message
- Action cards
- Feed content

Secondary (Left Column):
- Profile context
- Quick stats
- Navigation shortcuts

Tertiary (Right Column):
- Growth prompts
- Recommendations
- Upcoming events
```

---

## 📱 Responsive Behavior

### **Desktop (≥1024px)**
```
┌────────┬──────────┬────────┐
│ 25%    │   50%    │  25%   │
│ Left   │  Center  │ Right  │
│ Scroll │  Scroll  │ Scroll │
└────────┴──────────┴────────┘
```

### **Mobile (<1024px)**
```
┌─────────────────────┐
│  Center Content     │ ← Priority 1
├─────────────────────┤
│  Left Sidebar       │ ← Priority 2
├─────────────────────┤
│  Right Widgets      │ ← Priority 3
└─────────────────────┘
Single scroll
```

**Implementation:** `UserDashboardLayout.tsx` lines 29-35

---

## 🔧 Current Issues & Recommendations

### **✅ Working Well**
1. Independent scrolling per column
2. Clear visual separation (borders)
3. Profile completion widget functional
4. Back buttons on edit/profile pages

### **⚠️ Areas to Address**

#### **1. Duplicate Sections**
**Issue:** "People You May Know" appears in both Center and Right columns

**Fix:**
```typescript
// Keep ONLY in Right Column
// Remove from Center Column action cards
```

---

#### **2. Empty States Need Data**
**Missing Data:**
- Profile Views count
- Recommended connections algorithm
- Upcoming events widget
- Feed content (opportunities)

**Priority Fix:**
- Wire up event recommendations widget
- Implement connection suggestions query

---

#### **3. Horizontal Scrolling**
**Current:** No horizontal scroll needed ✅

**Risk Areas:**
- Long skill names in badges (use text-truncate)
- Wide tables in feed (none currently)

---

#### **4. Navigation Consistency**
**Fix Needed:**
- Ensure all external links highlight correct nav item
- Add loading states on route transitions

---

## 🚀 Next Steps for Team

### **Phase 1 (Critical - Do Now)**
1. ✅ Add "Events" to main navigation
2. ✅ Add back buttons (Edit Profile, User Profile, Discover)
3. ⚠️ Remove duplicate "People You May Know" from Center column
4. ⚠️ Create EventRecommendationsWidget for Right column

### **Phase 2 (Post-MVE)**
1. Implement connection recommendation algorithm
2. Wire up real feed data (opportunities)
3. Add profile views analytics
4. Add breadcrumb navigation
5. Mobile optimization (bottom tab bar)

---

## 📊 Technical Specs

### **Column Widths**
```css
/* UserDashboardLayout.tsx */
.left-column  { width: 25%; min-width: 280px; }
.center-column { width: 50%; max-width: 800px; }
.right-column { width: 25%; min-width: 280px; }
```

### **Scroll Containers**
```css
/* All columns */
height: calc(100vh - 4rem); /* 4rem = header height */
overflow-y: auto;
overflow-x: hidden;
```

### **Z-Index Layers**
```
1000: Unified Header (sticky)
100:  Modals/Dialogs
10:   Sidebar overlays
1:    Column content
```

---

## ✅ Column Summary Checklist

| Column | Purpose | Scrolling | Navigation | Status |
|--------|---------|-----------|------------|--------|
| **Left** | Identity & Quick Nav | ✅ Vertical | ✅ Routing | Working |
| **Center** | Main Feed & Content | ✅ Vertical | ✅ Routing | Working |
| **Right** | Growth & Recommendations | ✅ Vertical | ✅ Routing | Working |

**Overall Architecture Status:** ✅ **Solid Foundation - Ready for MVE**

---

*Last Updated: 2025 (Pre-MVE Phase 1)*
*For Questions: Reference this doc in team discussions*
