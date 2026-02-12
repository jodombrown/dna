/**
 * DNA | Notification System — Component Exports
 *
 * Re-exports all notification system components for clean imports.
 *
 * Legacy components (V1):
 * - NotificationCenter, NotificationBell, NotificationItem, NotificationList,
 *   NotificationsDropdown, BadgeToastListener
 *
 * New Notification System (V2):
 * - NotificationSystemBell — Nav bar bell with Five C's badge counts
 * - NotificationSystemCenter — Main notification panel (dropdown + fullscreen)
 * - NotificationSystemCard — Individual notification card with C-module accents
 * - NotificationFilterBar — Five C's filter chips
 * - NotificationPreferencesPanel — Settings for notification preferences
 */

// New Notification System components
export { NotificationSystemBell } from './NotificationSystemBell';
export { NotificationSystemCenter } from './NotificationSystemCenter';
export { NotificationSystemCard } from './NotificationSystemCard';
export { NotificationFilterBar } from './NotificationFilterBar';
export { NotificationPreferencesPanel } from './NotificationPreferencesPanel';

// Legacy components (kept for backward compatibility)
export { NotificationCenter } from './NotificationCenter';
export { NotificationBell } from './NotificationBell';
export { NotificationItem } from './NotificationItem';
export { NotificationList } from './NotificationList';
export { NotificationsDropdown } from './NotificationsDropdown';
export { default as BadgeToastListener } from './BadgeToastListener';
