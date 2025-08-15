/**
 * Utility functions for generating profile links
 */

/**
 * Gets the profile URL for a user
 * @param profile - Profile object with username or id
 * @returns Profile URL string
 */
export const getProfileUrl = (profile: { username?: string; id?: string }) => {
  if (profile.username) {
    return `/dna/${profile.username}`;
  }
  // Fallback to ID-based URL if username not available
  return `/profile/${profile.id}`;
};

/**
 * Gets user initials for avatar fallback
 * @param name - Full name or username
 * @returns Two-character initials
 */
export const getUserInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};