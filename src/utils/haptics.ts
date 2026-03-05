/**
 * Haptic feedback utility for native-like mobile interactions.
 * Uses the Vibration API where available; no-ops silently otherwise.
 */
export function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  if (!('vibrate' in navigator)) return;
  const patterns: Record<typeof style, number[]> = {
    light: [10],
    medium: [20],
    heavy: [40],
  };
  navigator.vibrate(patterns[style]);
}
