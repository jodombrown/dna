# DNA Platform — Complete UI/UX Extraction for Rebuild

> **Purpose:** Pixel-perfect specification of every authenticated page layout, navigation pattern, and component behavior across mobile and desktop. Use this document as a prompt to recreate the DNA platform UI in a new Lovable project.

---

## 1. GLOBAL SHELL ARCHITECTURE

### 1.1 BaseLayout (src/layouts/BaseLayout.tsx)

The root layout wrapper for ALL authenticated routes. Every page renders inside this.

```
┌──────────────────────────────────────────┐
│  UnifiedHeader (fixed, z-50, h-16)       │
├──────────────────────────────────────────┤
│  PulseBar (fixed, z-40, desktop only)    │
├──────────────────────────────────────────┤
│                                          │
│        Page Content (children)           │
│                                          │
├──────────────────────────────────────────┤
│  PulseDock / MobileBottomNav (mobile)    │
└──────────────────────────────────────────┘
```

**Top padding logic:**
- Authenticated desktop: `pt-14 sm:pt-16 lg:pt-[7.5rem]` (header 64px + PulseBar ~60px)
- Authenticated mobile: `pt-14 sm:pt-16` (header only, PulseBar hidden)
- Unauthenticated: `pt-14 sm:pt-16`
- Bottom: `pb-20 lg:pb-0` (mobile bottom nav space)

**Route-based background gradients (authenticated only):**
```tsx
// Each Five C route gets a unique warm gradient
Feed:        "bg-gradient-to-br from-dna-mint/20 via-background to-dna-mint/10"
Connect:     "bg-gradient-to-br from-dna-terra/15 via-background to-dna-ochre/10"
Convene:     "bg-gradient-to-br from-dna-sunset/15 via-background to-dna-purple/10"
Collaborate: "bg-gradient-to-br from-dna-terra/15 via-background to-dna-mint/10"
Contribute:  "bg-gradient-to-br from-dna-copper/15 via-background to-dna-ochre/10"
Convey:      "bg-gradient-to-br from-dna-purple/15 via-background to-dna-sunset/10"
Default:     "bg-gradient-to-br from-dna-mint/20 via-background to-dna-copper/10"
```

### 1.2 UnifiedHeader (src/components/UnifiedHeader.tsx)

Fixed top bar, `z-50`, `h-16`, `bg-background border-b border-border shadow-sm`.

**Desktop authenticated layout:**
```
┌─────────────────────────────────────────────────────┐
│ [DNA Logo h-[60px]/h-[80px]]    [Feed] [Messages🔴] │
│                                 [🔔] [+ Create ▾]   │
│                                 [Admin🛡️] [Avatar]  │
└─────────────────────────────────────────────────────┘
```

- **Logo:** `src/assets/dna-logo.png`, `h-[60px] md:h-[80px] w-auto`
- **Utility nav (desktop):** Feed icon + Messages icon (with unread badge)
- **Notification bell:** `<UnifiedNotificationBell />` component
- **Create button:** `+ Create` dropdown → opens UniversalComposer in `post`, `event`, or `story` mode
- **Admin shield:** Conditionally shown via `supabase.rpc('has_role', { _user_id, _role: 'admin' })`
- **Avatar:** Opens `<AccountDrawer />` (profile, settings, sign out)

**Mobile authenticated:** Header is HIDDEN on `/dna/connect` routes (Connect has its own header) and when `isHeaderHidden` is true (e.g., during chat). Uses `useHeaderVisibility` zustand store.

**Mobile unauthenticated:** Hamburger menu (`Sheet` side="left") with marketing nav items.

### 1.3 PulseBar (src/components/pulse/PulseBar.tsx) — Desktop Only

Fixed bar below header at `top-14 sm:top-16`, `z-40`. Shows real-time Five C's status.

```
┌──────────────────────────────────────────────────────┐
│ [Connect ●3] [Convene ●2] [Collaborate] [Contribute] [Convey] │
└──────────────────────────────────────────────────────┘
```

- `backdrop-blur-md`, gradient background `from-background/90 via-background/95 to-background/90`
- Each item is a `<PulseItem>` with: status indicator (emerald/copper/gray dot), icon, label, count badge
- Staggered entrance animation via framer-motion (0.06s delay per item)
- Hidden on mobile (`if (isMobile || !user) return null`)
- Skeleton state while loading

### 1.4 Mobile Bottom Navigation

**MobileBottomNav (src/components/mobile/MobileBottomNav.tsx):**
```
┌─────────────────────────────────────────┐
│ Connect | Convene | Feed | Collaborate | More │
└─────────────────────────────────────────┘
```

- Fixed bottom, `z-50`, `bg-background/95 backdrop-blur-md border-t border-border`
- `h-16` with `pb-safe` (safe area insets)
- `shadow-[0_-4px_20px_rgba(0,0,0,0.1)]`
- Active state: `text-primary` + top indicator bar (`w-12 h-1 bg-foreground/80 rounded-b-full`)
- Haptic feedback on tap via `haptic('light')`
- "More" opens a `Sheet` (side="bottom", `h-[80vh] rounded-t-2xl`) with:
  - Profile section (avatar + name + "View Profile" button)
  - Menu items: DIA (highlighted green), Messages, Contribute, Convey, Notifications (with badge), Admin, Settings
  - Sign Out button (destructive variant)

**Alternative: PulseDock (src/components/pulse/PulseDock.tsx):**
- Same position but with status-aware items
- Center "Feed" button is elevated: `w-12 h-12 -mt-4 rounded-full bg-dna-emerald text-white shadow-lg`
- Status dots from Pulse system (emerald=active, copper=attention, gray=dormant)
- "More" opens `PulseDockTray` (slide-up tray with grid of 4 pulse items + 4 utility items)

### 1.5 MobileHeader (src/components/mobile/MobileHeader.tsx)

Context-aware mobile header, `h-14`, `sticky top-0 z-40`.

**Default variant:**
```
┌──────────────────────────────────┐
│ [← Back / Logo]  Title  [🔍] [actions] │
└──────────────────────────────────┘
```

**Feed variant (variant="feed"):**
```
┌────────────────────────────────────────┐
│ [DNA Logo] [What's on your mind?] [🔔] [👤] │
└────────────────────────────────────────┘
```
- Composer bubble: `bg-muted rounded-full px-4 py-2 text-sm text-muted-foreground`
- Avatar opens AccountDrawer

---

## 2. LAYOUT SYSTEM

### 2.1 LayoutController (src/components/LayoutController.tsx)

Intelligent layout selector based on ViewState context. Maps routes to layout types:

| View State | Layout | Column Widths |
|---|---|---|
| DASHBOARD_HOME | ThreeColumnLayout | 15% - 70% - 15% |
| CONNECT_MODE | ThreeColumnLayout | 15% - 70% - 15% |
| CONVENE_MODE | TwoColumnLayout | 60% - 40% |
| MESSAGES_MODE | TwoColumnLayout | 35% - 65% |
| COLLABORATE_MODE | FullCanvasLayout | 20% sidebar - 80% content |
| CONTRIBUTE_MODE | TwoColumnLayout | 55% - 45% |
| CONVEY_MODE | ThreeColumnLayout | 15% - 70% - 15% |
| FOCUS_DETAIL_MODE | DetailViewLayout | Full width |

### 2.2 ThreeColumnLayout (src/layouts/ThreeColumnLayout.tsx)

**Desktop:**
- `height: calc(100dvh - 7.5rem)`, `overflow: hidden`
- Each column: independent `overflow-y-auto scrollbar-thin`
- `gap-4 px-4`, `paddingTop: 1.5rem`
- Column widths enforced via inline `style={{ width, maxWidth, minWidth }}`

**Mobile/Tablet:** Vertical stack with `gap-3 px-4 pt-2 pb-4`

### 2.3 TwoColumnLayout (src/layouts/TwoColumnLayout.tsx)

**Desktop:**
- `height: calc(100dvh - 64px)`, `gap-4 p-4`
- Each column: `overflow-hidden h-full`
- Widths via inline style

**Mobile/Tablet:** Vertical stack with `gap-4 p-4`

### 2.4 FullCanvasLayout (src/layouts/FullCanvasLayout.tsx)

**Desktop:** Side-by-side with collapsible sidebar (ChevronLeft/Right toggle)
**Mobile:** Sidebar becomes overlay drawer with backdrop blur

---

## 3. PAGE-BY-PAGE UI SPECIFICATION

### 3.1 Feed Page (/dna/feed) — The Living Room

**DESKTOP LAYOUT — Independent 3-column scroll:**
```
┌──────────┬─────────────────────────┬──────────┐
│ Left     │ Center Feed             │ Right    │
│ 260px    │ flex-1                  │ ~260px   │
│          │                         │          │
│ FeedLeft │ FeedHeroGreeting        │ Community│
│ Panel    │ Composer Bar (sticky)   │ Pulse    │
│          │ Ranking Toggle          │          │
│          │ Filter Tabs (auto-hide) │          │
│          │ Feed Cards              │          │
└──────────┴─────────────────────────┴──────────┘
```

- Container: `max-w-7xl mx-auto flex gap-5 px-4`
- Height: `calc(100dvh - 7.5rem)`, `overflow: hidden`
- Left sidebar: `width: 260px`, `overflow-y-auto scrollbar-thin`

**Left Panel (FeedLeftPanel):**
- Compact profile strip: avatar (h-11 w-11) with emerald ring, name, username, location
- Five C's stats grid: 4 items (Connections/Events/Spaces/Posts) with module-colored icons
- Saved Items link
- Collapsible sections: Upcoming Events, Active Spaces
- Sponsor card at bottom

**Center Column:**
1. **Hero Greeting:** Heritage pattern (kente, 4% opacity), Lora font greeting, platform pulse stats, quick-action chips
2. **Sticky Composer Bar:** `rounded-full px-3 py-2 shadow-dna-1 border border-border/40` with avatar, placeholder text, Camera/Calendar/BookOpen icons
3. **Ranking Toggle:** Top/Latest tabs in `rounded-full` pills
4. **Filter Tabs:** 5-tab grid (All/For You/Network/Mine/Saved) — auto-hides on scroll, reappears after 3s
5. **Feed Cards:** `<UniversalFeedInfinite>` or `<PersonalizedFeed>`

**Right Panel (FeedCommunityPulse):** Live activity ticker, spotlight card

**MOBILE LAYOUT:**
```
┌──────────────────────────────────┐
│ [Logo] [What's on your mind?] [🔔][👤] │  ← MobileHeader variant="feed"
│ [Profile Completion Banner]      │
│ [All|For You|Network|Mine|Saved] │  ← MobileFeedTabs (scrollable)
├──────────────────────────────────┤
│                                  │
│     Feed Cards (space-y-1)       │
│                                  │
├──────────────────────────────────┤
│ [Connect|Convene|Feed|Collab|More] │  ← MobileBottomNav
└──────────────────────────────────┘
```

- **Critical:** Mobile feed HIDES BaseLayout's UnifiedHeader via CSS injection:
```css
body:has([data-mobile-feed="true"]) header[data-unified-header] { display: none !important; }
body:has([data-mobile-feed="true"]) > div > div { padding-top: 0 !important; }
```
- Fixed header zone: MobileHeader + ProfileCompletionBanner + MobileFeedTabs, all in `fixed top-0 left-0 right-0 z-40`
- Content padding: `pt-[7.5rem] px-3 space-y-1 pb-bottom-nav`

### 3.2 Connect Hub (/dna/connect)

**DESKTOP — Three-column with dynamic widths:**
```
┌──────────┬─────────────────┬──────────┐
│ Network  │ Discovery Feed  │ Messages │
│ 25%      │ 50% (→35%)      │ 25%(→40%)│
│          │                 │          │
│ Filters  │ Member Cards    │ Threads  │
│ Stats    │ DIA Cards       │ Chat     │
└──────────┴─────────────────┴──────────┘
```

- `ConnectHubLayout` with framer-motion animated column widths
- Each column: `height: calc(100dvh - 7.5rem)`, independent scroll
- Chat expand: center shrinks from 50%→35%, right expands 25%→40%
- Column borders: `border-r/border-l border-border/40`
- Left/right backgrounds: `bg-background/50 backdrop-blur-sm`

**MOBILE:** Single column view with bottom tab switcher (Network/Discover/Messages)

**Tablet:** Two columns (30%/70%) with messages as slide-over panel (framer-motion spring animation)

**Previous ConnectLayout (src/components/connect/ConnectLayout.tsx):**
- Alternative layout with Tabs (Discover/Network/Messages) at top
- `container max-w-7xl mx-auto px-4 py-6 pt-20`
- ProfileStrengthCard in header (desktop only, `hidden md:block`)

### 3.3 Convene Hub (/dna/convene)

**Luma-inspired discovery page (ConveneDiscovery.tsx):**
- Location selector with city detection
- Full-screen search overlay (300ms debounce)
- Category chips (horizontally scrollable)
- Featured events carousel (embla-carousel with autoplay + wheel gestures)
- Happening Now section (live events with emerald pulse)
- Upcoming events section
- City cards (deterministic gradients)
- Map view toggle (lazy-loaded Leaflet)
- DIA discovery card
- `MobileBottomNav` at bottom

### 3.4 Collaborate Hub (/dna/collaborate)

**Uses LayoutController → ThreeColumnLayout (via CONNECT_MODE or similar):**
```tsx
<LayoutController
  leftColumn={<LeftNav />}
  centerColumn={<SpaceDirectory />}
  rightColumn={<RightWidgets />}
/>
```

- LeftNav: Card with nav buttons (Connect/Convene/Collaborate/Contribute/Convey/Messages)
- Active state: `variant="secondary"`, inactive: `variant="ghost"`
- `sticky top-4`

### 3.5 Contribute Hub (/dna/contribute)

**Hub pattern with shared components:**
- `HubHero` — branded hero section
- `HubStatsBar` — 4 stat cards (Open Needs, Active Offers, My Requests, Matches)
- `HubQuickActions` — action buttons
- `HubSubNav` — tab navigation
- `HubDIAPanel` — DIA recommendations
- `HubActivityFeed` — recent activity
- `OpportunityRecommendations` — AI-matched opportunities
- `MobileBottomNav` at bottom

### 3.6 Convey Hub (/dna/convey)

**Three-mode hub (aspiration → hybrid → discovery):**
- Mode determined by `useHubMode('convey')` based on content count
- Discovery mode: Same hub pattern as Contribute (HubHero, HubStatsBar, etc.)
- Aspiration mode: Inspirational CTA to start publishing
- Hybrid mode: Mix of early content preview + aspiration
- Story feed via `ConveyFeedCard` components

### 3.7 Messages (/dna/messages)

**DESKTOP — TwoColumnLayout (35%/65%):**
```
┌──────────────┬──────────────────────┐
│ Conversations│ Chat Thread          │
│ List (35%)   │ or Empty State (65%) │
│              │                      │
│ Search       │ Messages             │
│ Threads      │ Input bar            │
└──────────────┴──────────────────────┘
```
- `min-h-screen bg-background pt-20`
- Uses `<TwoColumnLayout leftWidth="35%" rightWidth="65%">`

**MOBILE — Full screen takeover:**
- Conversation list: `min-h-screen bg-background pt-14`, `container mx-auto px-3 py-2`
- Active chat: `fixed inset-0 flex flex-col bg-background pb-bottom-nav` (WhatsApp-style full screen)
- Header is HIDDEN during active chat via `useHeaderVisibility` store

### 3.8 My Profile Hub (/dna/me)

**Single page with grid layout:**
```
┌──────────────────────────────────────┐
│ "My DNA Hub" heading                 │
│ ConnectNudges (DIA)                  │
├────────────┬─────────────────────────┤
│ Profile    │ Quick Actions (2x2)     │
│ Preview    │                         │
│ View/Edit  │ Recent Activity         │
│ Completion │                         │
└────────────┴─────────────────────────┘
```
- `container max-w-7xl mx-auto px-4 py-8 pt-20`
- Left column: `MyProfilePreview`, View/Edit buttons, `ProfileCompletionNudge`
- Right column (`lg:col-span-2`): Quick action cards (h-auto py-4 flex-col), RecentActivity

### 3.9 Public Profile (/dna/:username)

**Full-width profile page:**
```
┌──────────────────────────────────────┐
│ Banner (h-64, gradient or image)     │
├──────────────────────────────────────┤
│ ┌────────────────────────────────┐   │
│ │ Avatar (w-32 h-32, -mt-24)    │   │
│ │ Name, Role, Location, Origin  │   │
│ │ [Connect] [Message] [⋮]       │   │
│ │                                │   │
│ │ Diaspora Story                 │   │
│ │ About                          │   │
│ │ Skills / Focus / Industries    │   │
│ │ Open To badges                 │   │
│ │ Mutual Connections             │   │
│ │ Five C's Activity Sections     │   │
│ └────────────────────────────────┘   │
└──────────────────────────────────────┘
```
- `container max-w-4xl mx-auto px-4 pb-16`
- Banner: supports gradient presets (`BANNER_GRADIENTS`) or custom image with optional dark overlay
- Header card: `-mt-24 relative` (overlaps banner)
- Avatar: `w-32 h-32 border-4 border-background`
- Connect button: `bg-dna-copper hover:bg-dna-gold`
- Badges: Skills (`variant="secondary"`), Focus Areas (`variant="outline" border-dna-copper`), Industries, Regional Expertise
- Cross-5C sections: Spaces, Events, Contributions, Stories
- Safety: Block/Report via DropdownMenu
- States: Loading spinner, Not Found, Private, Blocked

### 3.10 Notifications (/dna/notifications)

**Single column, centered:**
- `container mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 max-w-3xl`
- Header: Bell icon + "Notifications" + Mark all read + Settings
- Filter tabs: All | Unread (with counts)
- List: `bg-card rounded-lg border` with `divide-y`
- Empty state: Large Bell icon, contextual message
- `pb-bottom-nav md:pb-0`

### 3.11 Auth Page (/auth)

**Split-screen design:**
```
┌─────────────────┬──────────────────┐
│ Dark branded    │ Auth Card        │
│ panel           │                  │
│ (animated       │ Sign In / Sign Up│
│  bokeh,         │ toggle tabs      │
│  heritage       │                  │
│  patterns)      │ Email/Password   │
│                 │ form             │
│ DNA Logo h-36   │                  │
│ Feature pills   │ Submit button    │
│ (Globe, Users,  │                  │
│  Rocket)        │ Back button      │
└─────────────────┴──────────────────┘
```
- Sign In/Sign Up toggle: active state = DNA Emerald green bg + white text
- Feature pills use Lucide icons (no emojis)
- Password visibility toggle (Eye/EyeOff)
- Beta waitlist mode when registration disabled

---

## 4. SHARED COMPONENT PATTERNS

### 4.1 Universal Composer

- Desktop: `Sheet` (slide-in panel from right, `sm:max-w-[480px]`)
- Mobile: `vaul` Drawer (bottom sheet)
- Modes: `post`, `event`, `story`
- Triggered from: Header Create button, Feed composer bar, FAB, empty states

### 4.2 Card Patterns

- Standard: `rounded-xl shadow-dna-1 border border-border/40`
- Feed cards: Left bevel bar (2px colored border) indicating content type
- Profile cards: Avatar + name + role + action buttons
- Hover: `hover:shadow-dna-2 transition-all duration-200`

### 4.3 Loading States

- Page: Centered spinner (`animate-spin rounded-full h-8 w-8 border-b-2 border-primary`)
- Layout transition: `<LayoutTransitionLoader message="Loading..." />`
- Skeleton: Sand-colored shimmer animation (1.5s infinite)

### 4.4 Empty States

- Large icon (h-16 w-16 text-muted-foreground)
- Title (text-lg font-semibold)
- Description (text-muted-foreground max-w-sm)
- Optional CTA button

### 4.5 Search

- `SearchDialog`: Full overlay search with 300ms debounce
- Feed search: Trigger via Search icon button
- Convene search: Full-screen overlay

---

## 5. RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Navigation | Layout |
|---|---|---|---|
| Mobile | <768px | Bottom nav (h-16) + pb-safe | Single column, px-3 |
| Tablet | 768-1024px | Bottom nav | Stacked or 2-column |
| Desktop | >1024px | Top header + PulseBar | Multi-column with independent scroll |

**Key CSS utilities:**
```css
.pb-bottom-nav { padding-bottom: var(--bottom-nav-height, 4rem); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
```

**Viewport units:** Always use `dvh` (dynamic viewport height) for full-height containers.

---

## 6. INTERACTION PATTERNS

### 6.1 Scroll Behavior
- Feed: Scroll position preserved via sessionStorage
- Desktop columns: Independent scrolling (`overflow-y-auto scrollbar-thin`)
- Feed tabs: Auto-hide on scroll, reappear after 3s pause

### 6.2 Navigation
- Tab switches: `haptic('light')` (10ms vibration)
- Composer open: `haptic('medium')` (20ms vibration)
- Bottom nav active: `active:scale-[0.82] active:opacity-60` (75-100ms)
- Tray close: 150ms delay before navigation for smooth dismiss

### 6.3 Animations
- Page entries: `0.2s ease-out fade-in`
- PulseBar items: Staggered `0.06s` delay
- Column resize (Connect hub): framer-motion spring `stiffness: 300, damping: 30`
- Pattern drift: `30s linear infinite` background-position shift
- Heritage shimmer: `1.5s` sand-colored gradient sweep

---

## 7. HUB PATTERN (Shared Across Five C's)

Each Five C hub follows this consistent structure when in "discovery" mode:

```
┌──────────────────────────────────────┐
│ HubHero (branded gradient + pattern) │
├──────────────────────────────────────┤
│ HubStatsBar (4 stat cards)           │
├──────────────────────────────────────┤
│ HubQuickActions (action buttons)     │
├──────────────────────────────────────┤
│ HubSubNav (tab navigation)           │
├──────────────────────────────────────┤
│ DIAHubSection (AI recommendations)   │
├──────────────────────────────────────┤
│ Main Content (cards, lists, grids)   │
├──────────────────────────────────────┤
│ HubActivityFeed (recent activity)    │
└──────────────────────────────────────┘
```

Shared components from `src/components/hubs/shared/`:
- `HubHero`, `HubStatsBar`, `HubQuickActions`, `HubDIAPanel`, `HubActivityFeed`, `HubSubNav`

Hub modes (via `useHubMode`):
- **aspiration:** No content yet → inspirational CTA
- **hybrid:** Some content → mix of preview + CTA
- **discovery:** Enough content → full hub experience

---

## 8. KEY IMPLEMENTATION NOTES

### 8.1 State Management
- Auth: `useAuth()` context (user, profile, signIn, signOut)
- Profile: `useProfile()` React Query hook
- View state: `useViewState()` context → determines layout type
- Mobile detection: `useMobile()` hook (isMobile, isTablet)
- Header visibility: `useHeaderVisibility()` zustand store
- Composer: `useUniversalComposer()` hook (open, close, mode, submit)

### 8.2 Data Fetching
- All queries via `@tanstack/react-query`
- Supabase client for all backend calls
- Real-time subscriptions for feed and messages
- Stale times: 5min for stats, 10min for pulse data

### 8.3 Mobile-First Density
- Feed cards: `space-y-1` (tight vertical spacing)
- Touch targets: minimum 44px
- Content padding: `px-3` on mobile, `px-4` on desktop
- Reduced top padding on mobile hubs: `pt-[6.5rem]`

### 8.4 Typography Usage
- `font-heritage` (Lora): Hero greetings, H1/H2, stat numbers, profile names
- `font-ui` (Inter): Everything else — buttons, nav, body text, labels
- Feed Hero: `font-heritage text-2xl font-semibold tracking-tight`

### 8.5 Design Token Usage
- Never use raw colors in components
- Always use semantic tokens: `text-foreground`, `bg-background`, `text-muted-foreground`, `bg-card`, `border-border`
- Brand colors via tokens: `text-dna-emerald`, `bg-dna-copper`, `text-dna-gold`, `text-dna-forest`, `text-dna-convey`
- Shadows: `shadow-dna-1` (subtle), `shadow-dna-2` (hover), `shadow-dna-3`, `shadow-dna-4`
- Border radius: `rounded-dna-xl` (16px)

---

## 9. ROUTE → COMPONENT MAPPING

| Route | Page Component | Layout | Mobile Nav |
|---|---|---|---|
| `/dna/feed` | Feed.tsx | Custom 3-col | MobileBottomNav |
| `/dna/connect` | ConnectHubLayout | Custom 3-col | Own bottom tabs |
| `/dna/connect/discover` | ConnectLayout > Outlet | Tabs | MobileBottomNav |
| `/dna/connect/network` | ConnectLayout > Outlet | Tabs | MobileBottomNav |
| `/dna/connect/messages` | ConnectLayout > Outlet | Tabs | MobileBottomNav |
| `/dna/convene` | ConveneHub → ConveneDiscovery | Single column | MobileBottomNav |
| `/dna/collaborate` | SpacesIndex | LayoutController 3-col | MobileBottomNav |
| `/dna/contribute` | ContributeHub → ContributeDiscovery | Single column | MobileBottomNav |
| `/dna/convey` | ConveyHub → ConveyDiscovery | Single column | MobileBottomNav |
| `/dna/messages` | Messages.tsx | TwoColumnLayout | MobileBottomNav |
| `/dna/me` | Me.tsx | Single column | (via BaseLayout) |
| `/dna/:username` | PublicProfile.tsx | Single column | (via BaseLayout) |
| `/dna/notifications` | Notifications.tsx | Single column | MobileBottomNav |
| `/dna/dia` | DiaPage.tsx | (varies) | MobileBottomNav |
| `/dna/settings/*` | SettingsLayout | Sidebar + content | MobileBottomNav |
| `/auth` | Auth.tsx | Split-screen | None |

---

## 10. COPY-PASTE IMPLEMENTATION PROMPT

Use this as a prompt in your new Lovable project:

```
Build the DNA platform authenticated UI shell with these exact specifications:

1. BaseLayout wrapper with:
   - Fixed UnifiedHeader (h-16, z-50) with DNA logo, Feed/Messages nav icons, notification bell, Create dropdown, admin shield (role-gated), and avatar
   - Fixed PulseBar (desktop only, z-40, below header) showing 5 Five C's status items with framer-motion staggered entry
   - PulseDock/MobileBottomNav (mobile only, z-50, fixed bottom) with 5 items: Connect, Convene, Feed (center-elevated emerald circle), Collaborate, More
   - Route-based background gradients (warm tints per Five C module)
   - Top padding: pt-14 sm:pt-16 lg:pt-[7.5rem] for authenticated users
   - Bottom padding: pb-20 lg:pb-0 for mobile bottom nav

2. Layout system:
   - ThreeColumnLayout: 3 independently-scrolling columns, height calc(100dvh - 7.5rem)
   - TwoColumnLayout: 2 columns, height calc(100dvh - 64px)
   - FullCanvasLayout: Collapsible sidebar + main content
   - LayoutController that maps ViewState to layout type
   - Mobile: Always single column stack

3. Feed page (/dna/feed):
   - Desktop: 3-column (260px left panel, flexible center, ~260px right)
   - Left: Compact profile strip, Five C's stats, collapsible widgets
   - Center: Heritage greeting banner (Kente pattern 4% opacity, Lora typography), chat-style composer bar (rounded-full), ranking toggle (Top/Latest), auto-hiding filter tabs (All/For You/Network/Mine/Saved), infinite scroll feed
   - Right: Community pulse, activity ticker
   - Mobile: Custom fixed header (variant="feed" with logo + composer bubble + bell + avatar), profile completion banner, scrollable tabs, feed cards with space-y-1

4. Design tokens: warm cream background, DNA Emerald primary, Copper CTAs, Forest secondary, Gold accents. Never cold white or purple. Lora for heritage headings, Inter for UI. Shadow system: shadow-dna-1 through shadow-dna-4.
```
