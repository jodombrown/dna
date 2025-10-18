# DNA Platform Routes & Pages

## Marketing Pages (Public)

### `/` - Landing Page
Main entry point showcasing DNA platform value proposition, features, and CTAs.

### `/about` - About Us
Platform mission, vision, and team information.

### `/contact` - Contact
Contact form for inquiries and support.

### `/terms-of-service` - Terms of Service
Legal terms and conditions.

### `/privacy-policy` - Privacy Policy
Data privacy and user rights.

## The 5 Cs (Public Example Pages)

### `/connect` - Connect Example
Demonstrates connection features and user discovery.

### `/convene` - Convene Page
Event discovery and calendar interface.

### `/collaborate` - Collaborate Example
Collaboration spaces showcase.

### `/contribute` - Contribute Example
Opportunities and impact showcase.

### `/convey` - Convey Example
Social feed and storytelling demo.

## Phase Pages (Public)

### `/phase-1/market-research` - Market Research
### `/phase-2/prototyping` - Prototyping
### `/phase-3/customer-discovery` - Customer Discovery
### `/phase-4/mvp` - MVP Build
### `/phase-5/beta-validation` - Beta Validation
### `/phase-6/go-to-market` - Go-to-Market

## Authentication

### `/auth` - Login/Signup
Unified authentication page with email/password.

### `/reset-password` - Password Reset
Password recovery flow.

### `/onboarding` - User Onboarding
Multi-step profile setup for new users.

## DNA Platform (Authenticated)

### `/dna/me` - My Profile
User's own profile dashboard with edit capabilities.

### `/dna/:username` - Public Profile
View other users' public profiles.

### `/dna/feed` - Activity Feed
Social feed with posts, updates, and engagement.

### `/dna/connect` - Connect
User discovery, connection requests, network management.

### `/dna/convene` - Events
Browse and manage events, registrations.

### `/dna/events` - Events Page
Alternative events route.

### `/dna/discover` - Discover
Search and filter users by skills, location, interests.

### `/dna/network` - Network
View and manage connections.

### `/dna/messages` - Messages
Direct messaging interface.

### `/dna/impact` - Opportunities
Browse job postings, grants, partnerships.

### `/dna/impact/:id` - Opportunity Detail
View opportunity details and apply.

### `/dna/applications` - My Applications
Track application status.

### `/dna/spaces` - Collaboration Spaces
Browse and join project spaces.

### `/dna/spaces/:id` - Space Detail
View space details, tasks, milestones, members.

### `/app/profile/edit` - Edit Profile
Comprehensive profile editing form.

## Admin (Restricted)

### `/app/admin` - Admin Dashboard
Overview, stats, moderation queue.

### `/app/admin/engagement` - Engagement Management
User engagement analytics and nudge management.

### `/app/admin/signals` - ADIN Signals
AI-driven recommendation system management.

## Special Routes

### `/invite` - Invite Signup
Invitation-based registration flow.

### `*` - 404 Not Found
Catch-all for unknown routes.
