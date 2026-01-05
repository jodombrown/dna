/**
 * Generate a URL-friendly slug from text
 * @param title - The text to slugify
 * @param year - Optional year to append
 * @returns URL-friendly slug
 */
export function slugify(title: string, year?: number): string {
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Spaces to hyphens
    .replace(/-+/g, '-')       // Multiple hyphens to single
    .substring(0, 100);        // Max length

  if (year) {
    slug += `-${year}`;
  }

  return slug;
}

/**
 * Check if a string is a valid UUID
 * @param str - The string to check
 * @returns true if valid UUID
 */
export function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
