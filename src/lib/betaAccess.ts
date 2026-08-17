/**
 * The beta window, declared once.
 *
 * Signup is paused for the duration of the window. After the close date the
 * Sign up tab returns to the open account form on its own, with no code change
 * and no deploy. A `REGISTRATION_ENABLED` feature flag set to true reopens it
 * early.
 */
export const BETA_WINDOW_OPENS = new Date('2026-08-15T00:00:00Z');
export const BETA_WINDOW_CLOSES = new Date('2026-10-15T23:59:59Z');

export const BETA_WINDOW_LABEL = 'August 15 to October 15, 2026';

/**
 * True while new accounts are invitation-only.
 *
 * @param registrationEnabled the `REGISTRATION_ENABLED` feature flag. When
 * true the pause lifts regardless of the date.
 */
export const isSignupPaused = (registrationEnabled: boolean, now: Date = new Date()): boolean => {
  if (registrationEnabled) return false;
  return now.getTime() <= BETA_WINDOW_CLOSES.getTime();
};
