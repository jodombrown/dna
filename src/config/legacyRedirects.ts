/**
 * Legacy Redirects Configuration
 *
 * This file centralizes all legacy URL redirects for better maintainability.
 * Organized by category for easy management.
 */

/**
 * Static redirects - simple path to path mappings
 * These can be rendered as: <Route path={from} element={<Navigate to={to} replace />} />
 */
export const staticRedirects = [
  // Settings Hub redirects
  { from: '/dna/settings/dashboard', to: '/dna/settings/preferences', description: 'Legacy dashboard settings' },
  { from: '/dna/settings/profile', to: '/dna/profile/edit', description: 'Legacy profile settings' },

  // Legacy /dna/me redirect
  { from: '/dna/me', to: '/dna/feed', description: 'Old profile shortcut' },

  // Connect & Discover redirects
  { from: '/dna/discover/members', to: '/dna/connect/discover', description: 'Legacy member discovery' },
  { from: '/dna/discover', to: '/dna/connect/discover', description: 'Legacy discover page' },
  { from: '/dna/discover/feed', to: '/dna/feed', description: 'Legacy discover feed' },
  { from: '/dna/network', to: '/dna/connect/network', description: 'Legacy network page' },
  { from: '/dna/network/feed', to: '/dna/feed', description: 'Legacy network feed' },
  { from: '/dna/connect/feed', to: '/dna/feed', description: 'Legacy connect feed' },
  { from: '/discover/members', to: '/dna/connect/discover', description: 'Root discover members' },
  { from: '/discover', to: '/dna/connect/discover', description: 'Root discover' },

  // Messages redirects
  { from: '/dna/connect/messages', to: '/dna/messages', description: 'Legacy connect messages' },

  // Convene/Events redirects
  { from: '/dna/events', to: '/dna/convene/events', description: 'Legacy events shortcut' },
  { from: '/events', to: '/dna/convene/events', description: 'Root events' },
  { from: '/dna/convene-example', to: '/dna/convene', description: 'Legacy convene example' },

  // Contribute/Impact redirects
  { from: '/dna/impact', to: '/dna/contribute', description: 'Legacy impact page' },
] as const;

/**
 * Dynamic redirects - require parameter extraction
 * These need custom redirect components that use useParams()
 *
 * Format: { pattern, targetPattern, handler }
 * - pattern: The legacy URL pattern with params (e.g., /dna/u/:username)
 * - targetPattern: The new URL pattern (e.g., /dna/:username)
 * - handler: Name of the redirect component to use
 */
export const dynamicRedirects = [
  {
    pattern: '/dna/u/:username',
    targetPattern: '/dna/:username',
    handler: 'LegacyUsernameRedirect',
    description: 'Legacy public profile URL'
  },
  {
    pattern: '/dna/impact/:id',
    targetPattern: '/dna/contribute/:id',
    handler: 'LegacyImpactRedirect',
    description: 'Legacy impact detail page'
  },
  {
    pattern: '/dna/space/:slug',
    targetPattern: '/dna/collaborate/spaces/:slug',
    handler: 'LegacySpaceRedirect',
    description: 'Legacy space detail page'
  },
  {
    pattern: '/dna/connect/messages/:conversationId',
    targetPattern: '/dna/messages',
    handler: 'LegacyConnectMessagesRedirect',
    description: 'Legacy connect messages with conversation ID (drops param)'
  },
  {
    pattern: '/dna/profile/:id',
    targetPattern: '/dna/:username',
    handler: 'LegacyProfileRedirect',
    description: 'Legacy profile by ID - requires username lookup'
  },
] as const;

/**
 * Index redirects - default routes within nested route groups
 * These are typically used with <Route index element={<Navigate to={to} />} />
 */
export const indexRedirects = [
  { parent: '/dna/connect', to: '/dna/connect/discover', description: 'Connect hub default' },
  { parent: '/dna/settings', to: '/dna/settings/account', description: 'Settings hub default' },
] as const;

// Type exports for consumers
export type StaticRedirect = typeof staticRedirects[number];
export type DynamicRedirect = typeof dynamicRedirects[number];
export type IndexRedirect = typeof indexRedirects[number];
