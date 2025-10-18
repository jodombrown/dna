# DNA Platform Architecture

## 1. Overview

The **Diaspora Network of Africa (DNA)** is a comprehensive platform designed to connect, engage, and empower the African Diaspora globally. The platform is built with modern web technologies, leveraging a robust tech stack for scalability, performance, and user experience.

---

## 2. Tech Stack

### **Frontend**
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite (for fast development and optimized production builds)
- **Routing**: React Router DOM v6.26.2
- **Styling**: 
  - Tailwind CSS with custom design tokens
  - CSS-in-JS with custom animations
  - shadcn/ui component library (Radix UI primitives)
- **State Management**:
  - React Query (TanStack Query v5.56.2) for server state
  - React Context API for global state (Auth, ViewState, Messages)
  - Zustand v5.0.6 for client state management
- **Form Handling**: React Hook Form v7.53.0 with Zod v3.23.8 validation
- **Date Handling**: date-fns v4.1.0

### **Backend**
- **BaaS**: Supabase (PostgreSQL database, Auth, Storage, Edge Functions)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with email/password and OAuth providers
- **Edge Functions**: Deno runtime for serverless functions
- **Real-time**: Supabase Realtime for live updates

### **UI Components**
- **Component Library**: Radix UI primitives via shadcn/ui
- **Icons**: Lucide React v0.462.0
- **Charts**: Recharts v2.12.7
- **Notifications**: Sonner v1.5.0 + Radix Toast
- **Theming**: next-themes v0.3.0 (dark/light mode support)
- **Carousels**: Embla Carousel React v8.3.0
- **Virtualization**: TanStack React Virtual v3.13.12

### **Developer Tools**
- **Error Handling**: React Error Boundary v6.0.0
- **Type Safety**: TypeScript with strict mode
- **Linting**: ESLint with React plugins
- **Package Manager**: npm/bun

---

## 3. Feature Modules

The DNA platform is organized around the **5 Cs** framework:

### **Connect** (`/dna/connect`, `/connect`)
- **Purpose**: Facilitate meaningful connections between diaspora members
- **Features**:
  - User discovery and search
  - Connection requests
  - Profile matching based on interests, skills, and location
  - Real-time connection status updates

### **Convene** (`/dna/convene`, `/convene`)
- **Purpose**: Enable event creation, discovery, and management
- **Features**:
  - Event browsing and filtering
  - Event registration and ticketing
  - Event analytics and check-ins
  - Calendar integration
  - QR code generation for events

### **Collaborate** (`/dna/spaces`, `/collaborate`)
- **Purpose**: Foster collaboration through shared project spaces
- **Features**:
  - Collaboration space creation and management
  - Task management and milestones
  - Team membership and roles
  - Project visibility controls (public/private)

### **Contribute** (`/dna/impact`, `/contribute`)
- **Purpose**: Showcase and apply to opportunities for impact
- **Features**:
  - Opportunity listings (jobs, grants, partnerships)
  - Application management
  - Organization profiles
  - Opportunity analytics

### **Convey** (`/dna/feed`, `/convey`)
- **Purpose**: Share stories, updates, and engage with community content
- **Features**:
  - Social feed with posts, polls, and media
  - Likes, comments, and saves
  - Content moderation and flagging
  - View tracking and analytics

---

## 4. Folder Structure

```
dna-platform/
├── docs/                          # Documentation files
│   ├── dna-knowledge-pack.json    # Platform knowledge base
│   └── features-catalog.json      # Feature inventory
├── public/                        # Static assets
│   ├── favicon.ico
│   └── placeholder.svg
├── src/
│   ├── components/                # Reusable UI components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── auth/                 # Authentication components
│   │   ├── dashboard/            # Dashboard-specific components
│   │   ├── events/               # Event-related components
│   │   ├── feed/                 # Social feed components
│   │   ├── header/               # Navigation components
│   │   ├── notifications/        # Notification system
│   │   ├── profile/              # Profile components
│   │   └── ...                   # Feature-specific components
│   ├── contexts/                  # React Context providers
│   │   ├── AuthContext.tsx       # Authentication state
│   │   ├── ViewStateContext.tsx  # UI view state
│   │   └── MessageContext.tsx    # Messaging state
│   ├── hooks/                     # Custom React hooks
│   │   ├── useMobile.tsx         # Responsive breakpoint hook
│   │   ├── useProfiles.ts        # Profile data hooks
│   │   └── ...                   # Feature-specific hooks
│   ├── integrations/
│   │   └── supabase/             # Supabase client and types
│   │       ├── client.ts         # Supabase client instance
│   │       └── types.ts          # Auto-generated DB types
│   ├── layouts/                   # Layout components
│   │   └── BaseLayout.tsx        # Main app layout wrapper
│   ├── lib/                       # Utility libraries
│   │   └── utils.ts              # Helper functions
│   ├── pages/                     # Route page components
│   │   ├── Index.tsx             # Landing page
│   │   ├── Auth.tsx              # Login/signup
│   │   ├── dna/                  # Authenticated routes
│   │   │   ├── Me.tsx            # User's own profile
│   │   │   ├── Username.tsx      # Public profile view
│   │   │   └── ...
│   │   ├── admin/                # Admin dashboard
│   │   └── ...
│   ├── services/                  # API service layers
│   ├── styles/                    # Global CSS files
│   │   └── enhanced-interactions.css
│   ├── types/                     # TypeScript type definitions
│   ├── App.tsx                    # Root application component
│   ├── index.css                  # Global styles and design tokens
│   └── main.tsx                   # Application entry point
├── supabase/
│   ├── functions/                 # Edge Functions
│   │   └── send-universal-email/
│   ├── migrations/                # Database migrations (read-only)
│   └── config.toml               # Supabase configuration
├── .env                          # Environment variables
├── package.json                  # Dependencies
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── vite.config.ts                # Vite configuration
```

---

## 5. Design System

### **Theme Architecture**

The DNA platform uses a comprehensive design token system defined in `src/index.css` and extended via `tailwind.config.ts`.

#### **Color Tokens**

**Core Brand Colors** (Primary - Green family):
```css
--dna-forest: 183 28% 28%;        /* Deep forest green - Heritage & stability */
--dna-emerald: 160 35% 45%;       /* Sage green - Growth & opportunity */
```

**Cultural Warm Tones** (African Earth & Heritage):
```css
--dna-terra: 18 60% 55%;          /* Terra cotta - Warm clay earth */
--dna-ochre: 38 70% 50%;          /* Ochre - Golden earth */
--dna-sunset: 25 85% 55%;         /* Sunset orange - Vibrant warmth */
--dna-purple: 270 60% 55%;        /* Royal purple - Heritage */
```

**Updated Legacy Colors** (WCAG AA Compliant):
```css
--dna-copper: 25 75% 46%;         /* Warm copper */
--dna-gold: 45 85% 35%;           /* Vibrant gold */
--dna-mint: 170 45% 75%;          /* Fresh mint */
--dna-crimson: 0 100% 40%;        /* Bold crimson */
```

**Extended Palette**:
```css
--dna-earth: 30 35% 45%;          /* Earthy brown */
--dna-sand: 40 25% 78%;           /* Warm sand */
--dna-ocean: 200 50% 45%;         /* Deep ocean blue */
```

**Neutral Tones**:
```css
--dna-slate: 210 15% 25%;         /* Professional slate */
--dna-pearl: 0 0% 95%;            /* Soft pearl */
--dna-charcoal: 0 0% 15%;         /* Rich charcoal */
```

**Semantic Colors**:
```css
--dna-success: 160 35% 45%;       /* Success states */
--dna-warning: 45 85% 55%;        /* Warning states */
--dna-error: 0 100% 40%;          /* Error states */
--dna-info: 200 50% 45%;          /* Informational states */
```

#### **Typography**

**Font Families**:
- **Sans-serif**: Inter (primary body text)
- **Serif**: Lora (headings and emphasis)

**Responsive Typography Utilities**:
```css
.mobile-heading         /* clamp(1.5rem, 5vw, 2.5rem) */
.mobile-subheading      /* clamp(1.125rem, 4vw, 1.875rem) */
.mobile-body            /* clamp(0.875rem, 3vw, 1.125rem) */
.mobile-small           /* clamp(0.75rem, 2.5vw, 0.875rem) */
```

#### **Spacing & Layout**

**Container Utilities**:
```css
.mobile-container       /* px-4 md:px-6 lg:px-8 */
.mobile-section         /* py-6 md:py-8 lg:py-12 */
```

**Grid Systems**:
```css
.mobile-grid           /* 1 / 2 / 3 columns */
.mobile-grid-2         /* 1 / 2 columns */
.mobile-grid-3         /* 1 / 2 / 3 columns */
.mobile-grid-4         /* 2 / 3 / 4 columns */
```

**Touch Targets** (Mobile-optimized):
```css
.touch-target          /* min-h-[48px] min-w-[48px] */
.touch-target-sm       /* min-h-[40px] min-w-[40px] */
.touch-target-lg       /* min-h-[56px] min-w-[56px] */
.touch-target-xl       /* min-h-[64px] min-w-[64px] */
```

#### **Animations**

**Custom Keyframes**:
- `fade-in`: Smooth entry animation
- `heartbeat`: Pulsing effect (used for badges)
- `breathing-pulse`: Subtle scale animation
- `float`: Floating effect for decorative elements
- `accordion-down/up`: Collapsible content

**Animation Classes**:
```css
.animate-fade-in
.animate-heartbeat
.animate-breathing-pulse
.animate-float
```

#### **Dark Mode Support**

The platform fully supports dark mode with adjusted color tokens:
```css
.dark {
  --background: 183 28% 8%;
  --foreground: 0 0% 98%;
  --primary: 160 35% 55%;        /* Enhanced sage green */
  --accent: 25 75% 66%;          /* Enhanced copper */
}
```

---

## 6. Mobile-First Approach

### **Responsive Breakpoints**
```typescript
// useMobile hook
const isMobile = useMediaQuery('(max-width: 768px)');
const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
const isDesktop = useMediaQuery('(min-width: 1025px)');
```

### **Mobile Optimizations**
- Touch-friendly target sizes (minimum 48x48px)
- Swipe gestures for navigation
- Bottom navigation bar for key actions
- Responsive typography with `clamp()`
- Optimized grid layouts for small screens
- Hidden scrollbars on mobile with maintained functionality

---

## 7. Performance Optimizations

- **Code Splitting**: React.lazy() for route-based code splitting
- **Image Optimization**: Lazy loading for images
- **Virtual Scrolling**: TanStack Virtual for long lists
- **Memoization**: React.memo, useMemo, useCallback where appropriate
- **Debouncing**: Search inputs and API calls
- **Caching**: React Query with stale-while-revalidate strategy

---

## 8. Accessibility Features

- **WCAG AA Compliant**: All color contrasts meet minimum standards
- **Keyboard Navigation**: Full keyboard support
- **Focus States**: Clear focus indicators (ring-2 ring-dna-emerald)
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Responsive Touch Targets**: Minimum 48x48px tap areas
- **Skip Links**: Quick navigation to main content

---

## 9. Security Practices

- **Row Level Security (RLS)**: All database tables protected
- **Authentication**: Supabase Auth with secure session management
- **Input Validation**: Zod schemas for form validation
- **XSS Protection**: React's built-in escaping + DOMPurify where needed
- **CORS**: Properly configured for Edge Functions
- **Environment Variables**: Sensitive data in .env (never committed)

---

## 10. Deployment Architecture

### **Current Setup**
- **Hosting**: Lovable.dev deployment
- **Database**: Supabase hosted PostgreSQL
- **Edge Functions**: Deployed automatically with Lovable
- **CDN**: Assets served via Vite build optimization

### **Environment Variables**
```
VITE_SUPABASE_PROJECT_ID="ybhssuehmfnxrzneobok"
VITE_SUPABASE_PUBLISHABLE_KEY="[key]"
VITE_SUPABASE_URL="https://ybhssuehmfnxrzneobok.supabase.co"
```

---

## 11. Developer Experience

### **Development Workflow**
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### **Code Quality Tools**
- **TypeScript**: Strict mode enabled
- **ESLint**: React and TypeScript rules
- **Prettier**: Code formatting (configured)
- **Git Hooks**: Pre-commit linting (if configured)

---

## 12. Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Progressive Enhancement**: Core functionality works without JS

---

## 13. Future Enhancements

- **PWA Support**: Service workers for offline capability
- **Internationalization**: Multi-language support
- **Advanced Analytics**: User behavior tracking
- **WebSocket Integration**: Real-time collaboration features
- **AI Integration**: Smart matching and recommendations

---

**Last Updated**: October 2024  
**Version**: Beta 1.0
