/**
 * Collaborate re-export of the shared hub empty state (Arc 3, Frame 7).
 *
 * The primitive lives in components/hubs/shared/LensEmpty so every C's hub draws
 * the same empty state and they cannot drift. Kept here as a stable import path
 * for the Collaborate surfaces that already reference it.
 */

export { LensEmpty } from '@/components/hubs/shared/LensEmpty';
export type { LensEmptyProps } from '@/components/hubs/shared/LensEmpty';
