/**
 * Alpha Testing Feature Flags
 *
 * Controls alpha-specific features throughout the platform.
 * Toggle these flags to enable/disable alpha testing infrastructure.
 */

interface FeatureFlags {
  /** Shows alpha banner, test guide */
  isAlphaTest: boolean;
  /** Subtle "ALPHA" watermark in bottom-right corner */
  showAlphaWatermark: boolean;
  /** In-app test guide accessible from banner and navigation */
  enableTestGuide: boolean;
  /** Show DIA card reasoning metadata (for debugging only) */
  showDIADebugInfo: boolean;
}

export const FEATURE_FLAGS: FeatureFlags = {
  isAlphaTest: false,
  showAlphaWatermark: false,
  enableTestGuide: true,
  showDIADebugInfo: false,
};

/**
 * In-app DM / group messaging (BD063 founder call: OUT at v0.0).
 *
 * Hide-and-freeze: the messaging surface (nav entries, "Message" entry
 * buttons, and the /dna/messages routes) is hidden while messageService /
 * groupMessageService and all thread components stay frozen in the tree.
 * Set to `true` to unfreeze the entire surface in one place.
 *
 * NOTE: this gates DM/group messaging ONLY. Convene event threads
 * (EventThreadCTA) and Connect introductions are Charter-live and are NOT
 * gated by this flag.
 */
export const MESSAGING_ENABLED = false;

/**
 * Waitlist mode. When true the /auth signup tab redirects to /waitlist.
 *
 * Currently false: signup is open and public CTAs read "Sign up".
 *
 * To re-close signup:
 *   1. Set WAITLIST_MODE = true below
 *   2. Run: git grep -l "Sign up" src | xargs sed -i '' 's/>Sign up</>Join the Waitlist</g'
 *      (review each hit, the /auth page copy should stay "Sign up")
 */
export const WAITLIST_MODE = false;

/**
 * Public signup gate. Signups are paused until this instant, then open by
 * themselves on the next page load. No deploy needed on the day.
 *
 * Stored as an ISO instant in UTC: August 15, 2026 at 12:00 noon UTC.
 */
export const SIGNUPS_OPEN_AT = new Date('2026-08-15T12:00:00Z');

/** Human copy for the announcement. Kept beside the instant so they cannot drift. */
export const SIGNUPS_OPEN_LABEL = 'August 15, 2026 at 12pm noon UTC';

export const areSignupsOpen = (now: Date = new Date()): boolean =>
  now.getTime() >= SIGNUPS_OPEN_AT.getTime();

/**
 * Founder bypass for creating test accounts before the gate lifts:
 * /auth?mode=signup&key=<SIGNUP_BYPASS_KEY>
 *
 * This is obscurity, not security. The value ships in the client bundle and
 * anyone reading it can use it. It holds back a launch date, it is not an
 * access control. Real gating would need a server-checked invite row.
 */
export const SIGNUP_BYPASS_KEY = 'dna-early-1815';

const BYPASS_STORAGE_KEY = 'dna_signup_bypass';

/** Reads the key from the URL, remembers it for this browser, and reports it. */
export const resolveSignupBypass = (search: string): boolean => {
  try {
    const fromUrl = new URLSearchParams(search).get('key');
    if (fromUrl === SIGNUP_BYPASS_KEY) {
      window.localStorage.setItem(BYPASS_STORAGE_KEY, '1');
      return true;
    }
    return window.localStorage.getItem(BYPASS_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};
