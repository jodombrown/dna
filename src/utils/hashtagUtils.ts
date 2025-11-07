/**
 * Hashtag utilities for parsing, rendering, and managing hashtags
 */

export const HASHTAG_REGEX = /#[\w\u0080-\uFFFF]+/g;

/**
 * Extract hashtags from text content
 */
export function extractHashtags(text: string): string[] {
  const matches = text.match(HASHTAG_REGEX);
  if (!matches) return [];
  
  // Remove # and deduplicate
  const tags = matches.map(tag => tag.slice(1).toLowerCase());
  return Array.from(new Set(tags));
}

/**
 * Parse content and separate text from hashtags for rendering
 */
export function parseContentWithHashtags(content: string): Array<{ type: 'text' | 'hashtag'; value: string }> {
  const parts: Array<{ type: 'text' | 'hashtag'; value: string }> = [];
  let lastIndex = 0;

  const matches = Array.from(content.matchAll(new RegExp(HASHTAG_REGEX, 'g')));

  matches.forEach(match => {
    const index = match.index!;
    
    // Add text before hashtag
    if (index > lastIndex) {
      parts.push({
        type: 'text',
        value: content.slice(lastIndex, index),
      });
    }

    // Add hashtag
    parts.push({
      type: 'hashtag',
      value: match[0],
    });

    lastIndex = index + match[0].length;
  });

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      value: content.slice(lastIndex),
    });
  }

  return parts;
}

/**
 * Validate hashtag format
 */
export function isValidHashtag(tag: string): boolean {
  return /^#[\w\u0080-\uFFFF]+$/.test(tag);
}