/**
 * DNA | Rebuild Flags
 *
 * Orthogonal to alpha feature flags (src/config/featureFlags.ts).
 * Toggle these to hide UI surfaces during the COLLABORATE / CONTRIBUTE
 * teardown-and-rebuild cycle. Flip back to false in Phase 3 once the
 * rebuilt modules ship.
 */

export const REBUILD_FLAGS = {
  /**
   * Hides legacy CONNECT-side surfaces that surface space membership and
   * opportunity history while the COLLABORATE and CONTRIBUTE modules are
   * being reimagined.
   */
  collaborateContributeRebuild: true,
} as const;
