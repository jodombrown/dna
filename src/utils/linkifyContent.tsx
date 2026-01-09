import React from 'react';
import { Link } from 'react-router-dom';

// URL pattern - matches URLs with or without protocol
const URL_PATTERN = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;

/**
 * Linkifies hashtags, @mentions, and URLs in post content
 * Returns an array of React elements
 */
export function linkifyContent(content: string): React.ReactNode[] {
  if (!content) return [];

  // Regex patterns
  const hashtagPattern = /#([A-Za-z0-9_]+)/g;
  const mentionPattern = /@([A-Za-z0-9_]+)/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  // Find all matches (hashtags, mentions, and URLs)
  const matches: Array<{ index: number; length: number; type: 'hashtag' | 'mention' | 'url'; value: string; fullMatch: string }> = [];

  // Find hashtags
  let match;
  while ((match = hashtagPattern.exec(content)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'hashtag',
      value: match[1],
      fullMatch: match[0],
    });
  }

  // Find mentions
  while ((match = mentionPattern.exec(content)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'mention',
      value: match[1],
      fullMatch: match[0],
    });
  }

  // Find URLs
  while ((match = URL_PATTERN.exec(content)) !== null) {
    // Skip if this URL overlaps with a hashtag or mention
    const overlaps = matches.some(
      m => (match!.index >= m.index && match!.index < m.index + m.length) ||
           (m.index >= match!.index && m.index < match!.index + match![0].length)
    );
    if (!overlaps) {
      matches.push({
        index: match.index,
        length: match[0].length,
        type: 'url',
        value: match[0],
        fullMatch: match[0],
      });
    }
  }

  // Sort matches by index
  matches.sort((a, b) => a.index - b.index);

  // Build elements
  matches.forEach((match, i) => {
    // Add text before match
    if (match.index > lastIndex) {
      elements.push(
        <span key={`text-${i}`}>
          {content.substring(lastIndex, match.index)}
        </span>
      );
    }

    // Add linkified match
    if (match.type === 'hashtag') {
      elements.push(
        <Link
          key={`hashtag-${i}`}
          to={`/dna/hashtag/${match.value.toLowerCase()}`}
          className="text-dna-copper hover:text-dna-gold font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          #{match.value}
        </Link>
      );
    } else if (match.type === 'mention') {
      elements.push(
        <Link
          key={`mention-${i}`}
          to={`/dna/${match.value}`}
          className="text-dna-copper hover:text-dna-gold font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          @{match.value}
        </Link>
      );
    } else if (match.type === 'url') {
      // Ensure the URL has a protocol for the href
      const href = match.value.startsWith('http') ? match.value : `https://${match.value}`;
      elements.push(
        <a
          key={`url-${i}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-dna-copper hover:text-dna-gold font-medium hover:underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {match.value}
        </a>
      );
    }

    lastIndex = match.index + match.length;
  });

  // Add remaining text
  if (lastIndex < content.length) {
    elements.push(
      <span key="text-end">{content.substring(lastIndex)}</span>
    );
  }

  return elements.length > 0 ? elements : [content];
}
