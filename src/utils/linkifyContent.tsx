import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Linkifies hashtags and @mentions in post content
 * Returns an array of React elements
 */
export function linkifyContent(content: string): React.ReactNode[] {
  if (!content) return [];

  // Regex patterns
  const hashtagPattern = /#([A-Za-z0-9_]+)/g;
  const mentionPattern = /@([A-Za-z0-9_]+)/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  // Find all matches (hashtags and mentions)
  const matches: Array<{ index: number; length: number; type: 'hashtag' | 'mention'; value: string }> = [];

  // Find hashtags
  let match;
  while ((match = hashtagPattern.exec(content)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'hashtag',
      value: match[1],
    });
  }

  // Find mentions
  while ((match = mentionPattern.exec(content)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'mention',
      value: match[1],
    });
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
    } else {
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
