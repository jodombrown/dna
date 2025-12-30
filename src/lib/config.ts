/**
 * Centralized Configuration Service
 *
 * This file contains all environment-specific configuration values.
 * Import from here instead of hardcoding URLs in components.
 *
 * Usage:
 *   import { config, getAppUrl, getStorageUrl } from '@/lib/config';
 *   const url = config.APP_URL;
 *   const fullUrl = getAppUrl('/dna/convey/post/123');
 */

// Environment detection
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ybhssuehmfnxrzneobok.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliaHNzdWVobWZueHJ6bmVvYm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTI0NzMsImV4cCI6MjA2NDU4ODQ3M30.Uur_V4TYm4yCYtDQAa4diIpdsKoKb5Bkuo0cWNZAY-Y';

// Application URLs
const APP_URL = import.meta.env.VITE_APP_URL || 'https://diasporanetwork.africa';
const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN || 'diasporanetwork.africa';

/**
 * Centralized configuration object
 */
export const config = {
  // Environment
  isDevelopment,
  isProduction,

  // Application URLs
  APP_URL,
  APP_DOMAIN,

  // Supabase
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  STORAGE_URL: `${SUPABASE_URL}/storage/v1/object/public`,

  // Admin
  ADMIN_EMAIL_DOMAIN: '@diasporanetwork.africa',

  // Contact emails (for display purposes - not secrets)
  emails: {
    support: 'aweh@diasporanetwork.africa',
    legal: 'legal@diasporanetwork.africa',
    privacy: 'privacy@diasporanetwork.africa',
    dpo: 'dpo@diasporanetwork.africa',
    admin: 'admin@diasporanetwork.africa',
    notifications: 'notifications@diasporanetwork.africa',
    welcome: 'welcome@diasporanetwork.africa',
    noreply: 'noreply@diasporanetwork.africa',
  },
} as const;

/**
 * Generate a full application URL from a path
 * @param path - The path to append (should start with /)
 * @returns Full URL with the application domain
 */
export const getAppUrl = (path: string = ''): string => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${config.APP_URL}${normalizedPath}`;
};

/**
 * Generate a Supabase storage URL
 * @param bucket - Storage bucket name
 * @param path - File path within the bucket
 * @returns Full storage URL
 */
export const getStorageUrl = (bucket: string, path: string): string => {
  return `${config.STORAGE_URL}/${bucket}/${path}`;
};

/**
 * Generate a profile URL
 * @param usernameOrId - Username or user ID
 * @returns Full profile URL
 */
export const getProfileUrl = (usernameOrId: string): string => {
  const slug = usernameOrId.toLowerCase().replace(/\s+/g, '-');
  return getAppUrl(`/u/${slug}`);
};

/**
 * Generate an event share URL
 * @param eventSlug - Event slug
 * @param eventId - Event ID
 * @returns Full event URL
 */
export const getEventUrl = (eventSlug: string, eventId: string): string => {
  return getAppUrl(`/dna/convene/events/${eventSlug}-${eventId}`);
};

/**
 * Generate a post URL
 * @param postId - Post ID
 * @returns Full post URL
 */
export const getPostUrl = (postId: string): string => {
  return getAppUrl(`/dna/convey/post/${postId}`);
};

/**
 * Generate a conversation URL
 * @param conversationId - Conversation ID
 * @returns Full messages URL
 */
export const getConversationUrl = (conversationId: string): string => {
  return getAppUrl(`/dna/messages?conversation=${conversationId}`);
};

/**
 * Common app paths
 */
export const APP_PATHS = {
  settings: {
    notifications: '/dna/settings/notifications',
  },
  connect: {
    network: '/dna/connect/network',
  },
  auth: {
    callback: '/auth/callback',
  },
} as const;

// Export types
export type Config = typeof config;
export type AppPaths = typeof APP_PATHS;
