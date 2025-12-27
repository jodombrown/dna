# DNA Platform - Comprehensive Link & Navigation Audit

**Document Version:** 1.0  
**Date:** December 27, 2024  
**Status:** Assessment Complete

---

## Executive Summary

This document provides a comprehensive audit of all navigation links, routes, and URL patterns across the DNA Platform. It identifies broken links, incorrect routing destinations, legacy patterns that need cleanup, and provides recommendations for a cleaner, more consistent linking strategy.

---

## 1. CRITICAL ISSUES - Non-Functional Links

### 1.1 Legacy Routes Still Being Used in Components

| Location | Current Link | Issue | Fix Required |
|----------|-------------|-------|--------------|
| `src/components/convene/MyEventsWidget.tsx` | `/dna/events/manage` | Route does not exist | Change to `/dna/convene/my-events` |
| `src/components/convene/MyEventsWidget.tsx` | `/dna/events` (3 instances) | Redirects to `/dna/convene/events` | Update to canonical route |
| `src/components/network/ConnectionRequestCard.tsx` | `/dna/profile/${request.sender?.id}` | Uses user ID instead of username | Change to `/dna/${username}` pattern |
| `src/components/header/navigationConfig.ts` | `/dna/discover/members` (line 18) | Legacy route, redirects | Update to `/dna/connect/discover` |

### 1.2 Routes That Redirect (Performance Penalty)

These routes work but cause unnecessary redirects, slowing navigation:

| Legacy Route | Redirects To | Used In |
|--------------|--------------|---------|
| `/dna/me` | `/dna/feed` | App.tsx redirect |
| `/dna/discover/members` | `/dna/connect/discover` | Navigation config |
| `/dna/discover` | `/dna/connect/discover` | Multiple components |
| `/dna/network` | `/dna/connect/network` | Legacy references |
| `/dna/events` | `/dna/convene/events` | Multiple components |
| `/events` | `/dna/convene/events` | External links |
| `/dna/connect/messages` | `/dna/messages` | Legacy pattern |
| `/dna/connect/messages/:id` | `/dna/messages` | Legacy pattern |
| `/discover/members` | `/dna/connect/discover` | Unknown |
| `/discover` | `/dna/connect/discover` | Unknown |
| `/dna/space/:slug` | `/dna/collaborate/spaces/:slug` | Legacy pattern |

---

## 2. INCONSISTENCY ISSUES

### 2.1 Domain Name Inconsistency

**Critical:** The platform uses two different domain patterns:

| Domain Used | Location | Context |
|-------------|----------|---------|
| `diasporanetwork.africa` | Most notification services, Terms, Contact | Primary domain |
| `diasporanetworkafrica.com` | `EventSocialSection.tsx`, `EventPresenterSection.tsx`, `EventNavigationHeader.tsx` | Event-related components |

**Recommendation:** Standardize on `diasporanetwork.africa` everywhere.

### 2.2 Profile Route Inconsistency

| Pattern | Usage | Issue |
|---------|-------|-------|
| `/dna/${username}` | Authenticated profile view | Correct - canonical |
| `/dna/u/${username}` | Public profile view | Adds unnecessary `/u/` |
| `/u/${username}` | Some notification URLs | Even shorter variant |
| `/dna/profile/${userId}` | `ConnectionRequestCard.tsx` | Uses ID instead of username |
| `/dna/profile/edit` | Profile editing | Correct |

**Recommendation:** Consolidate to:
- `/dna/${username}` for all profile views (public & authenticated)
- `/dna/profile/edit` for editing (authenticated only)

### 2.3 Navigation Config Misalignment

**File: `src/components/header/navigationConfig.ts`**

```typescript
// Current (line 18) - WRONG
{ name: 'Discover', path: '/dna/discover/members', icon: 'Search' },

// Should be
{ name: 'Discover', path: '/dna/connect/discover', icon: 'Search' },
```

```typescript
// Current (line 22) - WRONG
{ name: 'Impact', path: '/dna/impact', icon: 'Briefcase' },

// "Impact" terminology inconsistent with "Contribute" pillar naming
```

---

## 3. ROUTE STRUCTURE ANALYSIS

### 3.1 Current Route Hierarchy

```
/                           # Landing page
├── /auth                   # Login/Signup
├── /onboarding            # User onboarding
│
├── /dna/                   # Authenticated DNA Platform
│   ├── /feed              # Activity feed (home)
│   ├── /messages          # Direct messages ✓ CANONICAL
│   ├── /messages/:id      # Conversation view
│   ├── /notifications     # Notifications
│   ├── /saved             # Saved posts
│   ├── /analytics         # User analytics
│   ├── /feedback          # Feedback hub
│   ├── /:username         # User profile view
│   ├── /profile/edit      # Edit profile
│   │
│   ├── /connect/          # CONNECT PILLAR ✓
│   │   ├── /discover      # Find people
│   │   └── /network       # My connections
│   │
│   ├── /convene/          # CONVENE PILLAR ✓
│   │   ├── /events        # Browse events
│   │   ├── /events/:id    # Event detail
│   │   ├── /events/new    # Create event
│   │   ├── /events/:id/edit
│   │   ├── /events/:id/analytics
│   │   ├── /my-events     # My events
│   │   ├── /analytics     # Organizer analytics
│   │   ├── /groups        # Event groups
│   │   └── /groups/:slug  # Group detail
│   │
│   ├── /collaborate/      # COLLABORATE PILLAR ✓
│   │   ├── /spaces        # Browse spaces
│   │   ├── /spaces/new    # Create space
│   │   ├── /spaces/:slug  # Space detail
│   │   ├── /spaces/:slug/board
│   │   ├── /spaces/:slug/settings
│   │   └── /my-spaces     # My spaces
│   │
│   ├── /contribute/       # CONTRIBUTE PILLAR ✓
│   │   ├── /needs         # Browse needs
│   │   ├── /needs/:id     # Need detail
│   │   └── /my            # My contributions
│   │
│   ├── /convey/           # CONVEY PILLAR ✓
│   │   ├── (index)        # Story feed
│   │   ├── /new           # Create story
│   │   └── /stories/:slug # Story detail
│   │
│   ├── /story/:id         # Feed story detail (alt pattern)
│   ├── /hashtag/:hashtag  # Hashtag feed
│   │
│   ├── /impact            # LEGACY - should be /contribute
│   ├── /impact/:id        # LEGACY opportunity detail
│   ├── /applications      # LEGACY
│   ├── /spaces            # LEGACY - should be /collaborate/spaces
│   ├── /spaces/:id        # LEGACY space detail
│   │
│   ├── /settings/         # Settings hub
│   │   ├── /account
│   │   ├── /privacy
│   │   ├── /blocked
│   │   ├── /reports
│   │   ├── /notifications
│   │   ├── /preferences
│   │   └── /hashtags
│   │
│   ├── /nudges            # ADIN nudges
│   └── /preferences       # ADIN preferences
│
├── /admin/                # New admin portal
│   ├── /dashboard
│   ├── /users
│   ├── /moderation
│   └── /analytics
│
├── /app/admin/            # LEGACY admin portal
│   └── (various routes)
│
├── /africa/               # Regional hubs
│   ├── /:regionSlug
│   └── /:regionSlug/:countrySlug
│
├── /partner-with-dna/     # Partnership pages
├── /phase-{1-6}/          # Development phases
├── /documentation/        # Feature docs
└── (static pages)         # About, Contact, Terms, etc.
```

---

## 4. RECOMMENDED FIXES

### Phase 1: Critical Fixes (Immediate)

#### 4.1 Fix navigationConfig.ts

```typescript
// Update line 18
{ name: 'Discover', path: '/dna/connect/discover', icon: 'Search' },

// Update line 22 - align with pillar naming
{ name: 'Contribute', path: '/dna/contribute', icon: 'Heart' },
```

#### 4.2 Fix MyEventsWidget.tsx

Replace all `/dna/events` references with `/dna/convene/events` and `/dna/convene/my-events`.

#### 4.3 Standardize Domain

Global find/replace:
- `diasporanetworkafrica.com` → `diasporanetwork.africa`

#### 4.4 Fix Profile Route Pattern

Update `ConnectionRequestCard.tsx` to use username instead of ID:
```typescript
// Before
onClick={() => navigate(`/dna/profile/${request.sender?.id}`)}

// After  
onClick={() => navigate(`/dna/${request.sender?.username}`)}
```

### Phase 2: Route Consolidation

#### 4.5 Remove Public Profile `/u/` Pattern

Merge `/dna/u/:username` into `/dna/:username` with public-friendly handling.

#### 4.6 Rename Impact → Contribute

- Route: `/dna/impact` → `/dna/contribute`
- Page: `DnaImpact` → use `ContributeHub`
- Navigation label: "Impact" → "Contribute"

#### 4.7 Remove Legacy Space Routes

- `/dna/spaces` → redirect to `/dna/collaborate/spaces`
- `/dna/spaces/:id` → redirect to `/dna/collaborate/spaces/:slug`

### Phase 3: URL Shortening Opportunities

| Current | Proposed | Benefit |
|---------|----------|---------|
| `/dna/convene/events` | `/dna/events` | Shorter, intuitive |
| `/dna/collaborate/spaces` | `/dna/spaces` | Shorter, intuitive |
| `/dna/contribute/needs` | `/dna/needs` | Shorter |
| `/dna/settings/account` | `/dna/settings` | Default to account |

**Note:** Only implement if backward compatibility redirects are added.

---

## 5. COMPONENT-SPECIFIC FIXES

### 5.1 Components Needing Updates

| File | Line(s) | Current | Should Be |
|------|---------|---------|-----------|
| `navigationConfig.ts` | 18 | `/dna/discover/members` | `/dna/connect/discover` |
| `MyEventsWidget.tsx` | 46 | `/dna/events/manage` | `/dna/convene/my-events` |
| `MyEventsWidget.tsx` | 62, 74, 108 | `/dna/events` | `/dna/convene/events` |
| `EventSocialSection.tsx` | 36 | `diasporanetworkafrica.com` | `diasporanetwork.africa` |
| `EventPresenterSection.tsx` | 14 | `diasporanetworkafrica.com` | `diasporanetwork.africa` |
| `EventNavigationHeader.tsx` | 34 | `diasporanetworkafrica.com/events` | `diasporanetwork.africa/dna/convene/events` |
| `ConnectionRequestCard.tsx` | 134 | `/dna/profile/${id}` | `/dna/${username}` |
| `DashboardModules.tsx` | various | Check for legacy routes | Update as needed |

### 5.2 Files Containing Hardcoded URLs

The following files contain hardcoded external URLs that should be reviewed:

1. `notificationService.ts` - Uses `diasporanetwork.africa` ✓
2. `connectionService.ts` - Uses `diasporanetwork.africa` ✓
3. `messageService.ts` - Uses `diasporanetwork.africa` ✓
4. `calendarExport.ts` - Uses `window.location.origin` ✓

---

## 6. NAVIGATION CONFIGURATION STANDARDIZATION

### 6.1 Recommended mainNavItems (Authenticated)

```typescript
export const mainNavItems = [
  { name: 'Feed', path: '/dna/feed', icon: 'Home' },
  { name: 'Discover', path: '/dna/connect/discover', icon: 'Search' },
  { name: 'Network', path: '/dna/connect/network', icon: 'Users2' },
  { name: 'Events', path: '/dna/convene/events', icon: 'Calendar' },
  { name: 'Messages', path: '/dna/messages', icon: 'MessageCircle' },
  { name: 'Contribute', path: '/dna/contribute', icon: 'Heart' },
];
```

### 6.2 Pillar Navigation (5 C's)

```typescript
export const pillarNavigation = {
  connect: {
    label: 'Connect',
    basePath: '/dna/connect',
    items: [
      { name: 'Discover People', path: '/dna/connect/discover' },
      { name: 'My Network', path: '/dna/connect/network' },
    ],
  },
  convene: {
    label: 'Convene',
    basePath: '/dna/convene',
    items: [
      { name: 'Events', path: '/dna/convene/events' },
      { name: 'My Events', path: '/dna/convene/my-events' },
      { name: 'Groups', path: '/dna/convene/groups' },
    ],
  },
  collaborate: {
    label: 'Collaborate',
    basePath: '/dna/collaborate',
    items: [
      { name: 'Spaces', path: '/dna/collaborate/spaces' },
      { name: 'My Spaces', path: '/dna/collaborate/my-spaces' },
    ],
  },
  contribute: {
    label: 'Contribute',
    basePath: '/dna/contribute',
    items: [
      { name: 'Needs', path: '/dna/contribute/needs' },
      { name: 'My Contributions', path: '/dna/contribute/my' },
    ],
  },
  convey: {
    label: 'Convey',
    basePath: '/dna/convey',
    items: [
      { name: 'Stories', path: '/dna/convey' },
      { name: 'Create Story', path: '/dna/convey/new' },
    ],
  },
};
```

---

## 7. IMPLEMENTATION PRIORITY

### P0 - Fix Immediately (Broken/Non-functional)
1. ~~`/dna/events/manage`~~ → `/dna/convene/my-events`
2. Domain standardization (`.com` → `.africa`)
3. `navigationConfig.ts` discover path fix

### P1 - Fix This Sprint (Incorrect but working)
1. All `/dna/events` → `/dna/convene/events`
2. Profile ID → username pattern
3. Navigation label "Impact" → "Contribute"

### P2 - Fix Next Sprint (Cleanup)
1. Remove `/dna/u/` pattern
2. Add redirects for all legacy routes
3. Clean up legacy admin routes

### P3 - Future Consideration
1. URL shortening (`/dna/convene/events` → `/dna/events`)
2. Vanity URLs for events/spaces

---

## 8. TESTING CHECKLIST

After implementing fixes, verify:

- [ ] All nav items navigate correctly without redirects
- [ ] Profile links use username, not user ID
- [ ] Event creation/management flows work
- [ ] All external URLs use `diasporanetwork.africa`
- [ ] Legacy URLs properly redirect
- [ ] Mobile navigation matches desktop
- [ ] Deep links work (shared URLs)
- [ ] Notification action URLs work

---

## 9. APPENDIX

### A. All Route Definitions (from App.tsx)

See Section 3.1 for complete route hierarchy.

### B. Files Audited

- `src/App.tsx` - Route definitions
- `src/components/header/navigationConfig.ts` - Nav config
- `src/components/` - 254 files with navigation
- `src/pages/` - All page components
- `src/services/` - Notification/connection URLs

---

**Document maintained by:** DNA Platform Team  
**Last audit:** December 27, 2024  
**Next scheduled audit:** March 2025
