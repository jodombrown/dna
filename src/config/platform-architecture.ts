/**
 * DNA Platform Master Architecture — Configuration Index
 *
 * This file codifies the six-layer architecture and serves as the
 * central reference for how all layers connect.
 *
 * Architecture layers:
 * 1. DIA Core Engine      — The brain that powers everything
 * 2. Notification System   — How the platform communicates with users
 * 3. Messaging System      — The connective tissue between people
 * 4. Profile & Identity    — The cross-C hub for every user
 * 5. Navigation & ADA      — How users move through the platform
 * 6. Design System         — The visual foundation every component inherits
 *
 * The Complete DNA Stack:
 * ┌────────────────────────────────┐
 * │       USER INTERFACE           │  Navigation & ADA, Feed & Cards, Design System
 * ├────────────────────────────────┤
 * │       FEATURE LAYER            │  Post Composer, Messaging, Profile & Identity
 * ├────────────────────────────────┤
 * │     INTELLIGENCE LAYER         │  DIA Core Engine (The Brain)
 * ├────────────────────────────────┤
 * │     COMMUNICATION LAYER        │  Notification System
 * ├────────────────────────────────┤
 * │         DATA LAYER             │  Supabase, Real-time, Stripe, Perplexity
 * └────────────────────────────────┘
 */

import type { FiveCModule, SubscriptionTier } from '@/types/dia';

// =====================================================
// LAYER DEPENDENCY MAP
// =====================================================

/**
 * Every layer connects to every other. Critical-path dependencies:
 */
export const LAYER_DEPENDENCIES = {
  dia_core_engine: {
    depends_on: ['profile', 'feed', 'messaging'],
    feeds_into: ['composer', 'feed', 'notifications', 'messaging'],
    description: 'The brain - analyzes all data, powers all intelligence',
  },
  notification_system: {
    depends_on: ['dia', 'all_five_c_modules'],
    feeds_into: ['feed', 'messaging', 'navigation'],
    description: 'Unified communication channel across all Five C\'s',
  },
  messaging_system: {
    depends_on: ['profile', 'notifications'],
    feeds_into: ['dia', 'connect', 'collaborate'],
    description: 'The connective tissue - 1:1, group, space, event, opportunity threads',
  },
  profile_identity: {
    depends_on: ['auth'],
    feeds_into: ['dia', 'feed', 'messaging', 'navigation'],
    description: 'The cross-C hub - identity across all Five C\'s',
  },
  navigation_ada: {
    depends_on: ['profile', 'notifications'],
    feeds_into: ['all_modules', 'feed', 'composer'],
    description: 'Adaptive Dashboard Architecture - layout transforms, not pages',
  },
  design_system: {
    depends_on: [],
    feeds_into: ['every_component'],
    description: 'The visual DNA - cultural authenticity built into every component',
  },
} as const;

// =====================================================
// FIVE C's INTEGRATION MAP
// =====================================================

/**
 * How each layer serves each of the Five C's.
 * This is the core principle: everything is interconnected.
 */
export const FIVE_C_INTEGRATION = {
  dia: {
    connect: 'Network analysis, "people you should know"',
    convene: 'Attendance prediction, optimal timing',
    collaborate: 'Project health, stall detection',
    contribute: 'Opportunity matching, contribution patterns',
    convey: 'Content performance, audience insights',
  },
  notifications: {
    connect: 'Connection requests, profile views',
    convene: 'Event reminders, RSVP updates',
    collaborate: 'Task assignments, space activity',
    contribute: 'New matches, interest expressed',
    convey: 'Story engagement, follower alerts',
  },
  messaging: {
    connect: '1:1 conversations, connection chat',
    convene: 'Event organizer ↔ attendee threads',
    collaborate: 'Space group channels, task discussion',
    contribute: 'Need ↔ Offer negotiation threads',
    convey: 'Author ↔ reader dialogue',
  },
  profile: {
    connect: 'Bio, skills, connections tab',
    convene: 'Events attended/hosted tab',
    collaborate: 'Spaces & projects tab',
    contribute: 'Opportunities posted tab',
    convey: 'Stories & content tab',
  },
  navigation: {
    connect: 'Connect Hub, People discovery',
    convene: 'Convene Hub, Event calendar',
    collaborate: 'Collaborate Hub, Space boards',
    contribute: 'Contribute Hub, Marketplace',
    convey: 'Convey Hub, Story reader',
  },
  design_system: {
    connect: 'Emerald accents',
    convene: 'Amber-Gold accents',
    collaborate: 'Forest Green accents',
    contribute: 'Copper accents',
    convey: 'Deep Teal accents',
  },
} as const;

// =====================================================
// THE CIRCULATION LOOP
// =====================================================

/**
 * The complete data/intelligence/experience flow through DNA.
 * This documents the circulation loop described in the architecture.
 */
export const CIRCULATION_LOOP = [
  {
    step: 1,
    action: 'USER_OPENS_DNA',
    systems: ['navigation', 'design_system'],
    description: 'ADA renders the appropriate view using Design System components',
  },
  {
    step: 2,
    action: 'FEED_LOADS',
    systems: ['feed', 'dia', 'profile', 'notifications'],
    description: 'DIA ranks content using Profile data, Network Intelligence, and engagement signals',
  },
  {
    step: 3,
    action: 'USER_CREATES',
    systems: ['composer', 'dia', 'feed', 'notifications'],
    description: 'Composer opens → DIA provides suggestions → Content submitted → Feed + Notifications fire',
  },
  {
    step: 4,
    action: 'USER_ENGAGES',
    systems: ['feed', 'dia', 'notifications'],
    description: 'Like/comment/RSVP/join → Engagement data feeds DIA ranking models',
  },
  {
    step: 5,
    action: 'USER_MESSAGES',
    systems: ['messaging', 'dia', 'notifications'],
    description: 'Real-time messaging → DIA tracks metadata for connection strength',
  },
  {
    step: 6,
    action: 'USER_VIEWS_PROFILE',
    systems: ['profile', 'dia'],
    description: 'Five C\'s tabs show cross-module activity, DIA Impact Snapshot shows aggregate',
  },
  {
    step: 7,
    action: 'DIA_LEARNS',
    systems: ['dia'],
    description: 'Every action feeds DIA → Better suggestions → Better engagement → More data → Smarter DIA',
  },
] as const;

// =====================================================
// BUILD SEQUENCE (20-Week Roadmap)
// =====================================================

export interface BuildPhase {
  phase: number;
  name: string;
  weeks: string;
  description: string;
  layers: string[];
  depends_on: number[];
  status: 'completed' | 'in_progress' | 'planned';
}

export const BUILD_SEQUENCE: BuildPhase[] = [
  {
    phase: 0,
    name: 'Design System Foundation',
    weeks: '1-2',
    description: 'Design tokens, primitive components, ADA Grid, cultural pattern assets, Storybook',
    layers: ['design_system'],
    depends_on: [],
    status: 'completed', // Already have Tailwind config + shadcn/ui
  },
  {
    phase: 1,
    name: 'Post Composer + Feed',
    weeks: '3-10',
    description: 'Post Composer (all five modes) + Feed Architecture (all card types, ranking, DIA interleaving)',
    layers: ['composer', 'feed'],
    depends_on: [0],
    status: 'completed', // Phase 1 + Phase 2 PRDs implemented
  },
  {
    phase: 2,
    name: 'Profile & Identity',
    weeks: '11-12',
    description: 'Profile page with Five C\'s tabs, completion system, privacy controls, DIA Impact Snapshot',
    layers: ['profile_identity'],
    depends_on: [1],
    status: 'in_progress',
  },
  {
    phase: 3,
    name: 'DIA Core Engine',
    weeks: '13-15',
    description: 'Matching engine, Network Intelligence, Nudge engine, DIA Chat, Trend detection',
    layers: ['dia_core_engine'],
    depends_on: [2],
    status: 'in_progress',
  },
  {
    phase: 4,
    name: 'Notification System',
    weeks: '16-17',
    description: 'Notification center UI, push infrastructure, DIA-powered batching, email digest, preferences',
    layers: ['notification_system'],
    depends_on: [3],
    status: 'planned',
  },
  {
    phase: 5,
    name: 'Messaging System',
    weeks: '18-19',
    description: '1:1, group, space channels, event threads, opportunity threads, offline queue',
    layers: ['messaging_system'],
    depends_on: [4],
    status: 'planned',
  },
  {
    phase: 6,
    name: 'Navigation & ADA Refinement',
    weeks: '20',
    description: 'Mobile tab bar finalization, desktop ADA refinement, deep linking, DIA adaptive nav',
    layers: ['navigation_ada'],
    depends_on: [5],
    status: 'planned',
  },
];

// =====================================================
// WHAT MAKES DNA DIFFERENT
// =====================================================

export const PLATFORM_PRINCIPLES = {
  interconnection_over_isolation:
    'Attribution system, cross-C references in Feed, Profile Five C\'s tabs, DIA matching across modules',
  intelligence_over_static:
    'DIA ambient in Composer, DIA ranking in Feed, DIA nudges in Notifications, DIA metadata in Messaging',
  mobile_first_over_responsive:
    'Bottom sheets, bottom tab nav, progressive upload, offline queuing, 16px min font',
  cultural_over_generic:
    'Design System patterns, warm color palette, heritage typography, diaspora-specific empty states',
  monetization_from_day_one:
    'Tier logic in every layer, upgrade prompts at moments of intent, Pro visibility boosts',
} as const;
