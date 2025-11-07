import { parseContentWithHashtags } from '@/utils/hashtagUtils';

interface HashtagTextProps {
  content: string;
  onHashtagClick?: (tag: string) => void;
  className?: string;
}

/**
 * Renders text with clickable hashtags
 */
export function HashtagText({ content, onHashtagClick, className = '' }: HashtagTextProps) {
  const parts = parseContentWithHashtags(content);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'hashtag') {
          return (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                onHashtagClick?.(part.value.slice(1));
              }}
              className="text-primary hover:underline font-medium"
            >
              {part.value}
            </button>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </span>
  );
}