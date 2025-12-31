/**
 * Centralized Routes Configuration
 *
 * This file contains all route paths used throughout the application.
 * Import from here instead of hardcoding paths in components.
 *
 * Usage:
 *   import { ROUTES } from '@/config/routes';
 *   navigate(ROUTES.feed);
 *   navigate(ROUTES.profile.view(username));
 */

import { config, getAppUrl } from '@/lib/config';

export const ROUTES = {
  // Core routes
  home: '/dna',
  feed: '/dna/feed',
  saved: '/dna/saved',

  // Authentication
  auth: '/auth',
  onboarding: '/onboarding',
  welcome: '/dna/welcome',
  resetPassword: '/reset-password',

  // Connect (Pillar 1)
  connect: {
    base: '/dna/connect',
    discover: '/dna/connect/discover',
    network: '/dna/connect/network',
  },

  // Convene (Pillar 2)
  convene: {
    base: '/dna/convene',
    events: '/dna/convene/events',
    myEvents: '/dna/convene/my-events',
    analytics: '/dna/convene/analytics',
    groups: '/dna/convene/groups',
    createEvent: '/dna/convene/events/new',
    eventDetail: (id: string) => `/dna/convene/events/${id}`,
    eventEdit: (id: string) => `/dna/convene/events/${id}/edit`,
    eventAnalytics: (id: string) => `/dna/convene/events/${id}/analytics`,
    groupDetail: (slug: string) => `/dna/convene/groups/${slug}`,
    groupEvents: (slug: string) => `/dna/convene/groups/${slug}/events`,
    groupSettings: (slug: string) => `/dna/convene/groups/${slug}/settings`,
  },

  // Collaborate (Pillar 3)
  collaborate: {
    base: '/dna/collaborate',
    spaces: '/dna/collaborate/spaces',
    mySpaces: '/dna/collaborate/my-spaces',
    createSpace: '/dna/collaborate/spaces/new',
    spaceDetail: (slug: string) => `/dna/collaborate/spaces/${slug}`,
    spaceBoard: (slug: string) => `/dna/collaborate/spaces/${slug}/board`,
    spaceSettings: (slug: string) => `/dna/collaborate/spaces/${slug}/settings`,
  },

  // Contribute (Pillar 4)
  contribute: {
    base: '/dna/contribute',
    needs: '/dna/contribute/needs',
    my: '/dna/contribute/my',
    needDetail: (id: string) => `/dna/contribute/needs/${id}`,
  },

  // Convey (Pillar 5)
  convey: {
    base: '/dna/convey',
    create: '/dna/convey/new',
    storyDetail: (id: string) => `/dna/story/${id}`,
    legacyStoryDetail: (slug: string) => `/dna/convey/stories/${slug}`,
  },

  // Profile
  profile: {
    view: (username: string) => `/dna/${username}`,
    edit: '/dna/profile/edit',
  },

  // Messages
  messages: {
    base: '/dna/messages',
    conversation: (id: string) => `/dna/messages/${id}`,
  },

  // Notifications
  notifications: '/dna/notifications',
  nudges: '/dna/nudges',

  // Settings
  settings: {
    base: '/dna/settings',
    account: '/dna/settings/account',
    privacy: '/dna/settings/privacy',
    blocked: '/dna/settings/blocked',
    reports: '/dna/settings/reports',
    notifications: '/dna/settings/notifications',
    preferences: '/dna/settings/preferences',
    hashtags: '/dna/settings/hashtags',
  },

  // Analytics & Feedback
  analytics: '/dna/analytics',
  feedback: '/dna/feedback',

  // Releases & Features
  releases: {
    base: '/releases',
    detail: (slug: string) => `/releases/${slug}`,
    featured: '/releases?filter=featured',
    archived: '/features/archived',
    archivedDetail: (slug: string) => `/features/archived/${slug}`,
  },

  // Applications
  applications: {
    my: '/dna/applications',
    received: '/dna/applications/received',
  },

  // Hashtag feed
  hashtagFeed: (hashtag: string) => `/dna/hashtag/${hashtag}`,

  // Static pages
  about: '/about',
  contact: '/contact',
  termsOfService: '/terms-of-service',
  privacyPolicy: '/privacy-policy',
  install: '/install',

  // Admin
  admin: {
    login: '/admin-login',
    base: '/admin',
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    moderation: '/admin/moderation',
    analytics: '/admin/analytics',
  },
} as const;

/**
 * Domain Configuration
 * Uses centralized config for environment flexibility
 */
export const DOMAINS = {
  primary: config.APP_DOMAIN,
  url: config.APP_URL,
} as const;

/**
 * Helper to generate full URLs (for sharing, SEO, etc.)
 */
export const getFullUrl = (path: string): string => {
  return getAppUrl(path);
};

/**
 * Helper to generate profile share URL
 */
export const getProfileShareUrl = (username: string): string => {
  return getFullUrl(ROUTES.profile.view(username));
};

// Type exports
export type RoutePath = string;
