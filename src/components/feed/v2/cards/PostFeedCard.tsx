/**
 * DNA | FEED v2 - Post Card
 *
 * Renders text posts with media, polls, link previews, and engagement bar.
 */

import React, { useState } from 'react';
import { FeedCardShell } from './FeedCardShell';
import { EngagementBar } from '../EngagementBar';
import type { FeedItem, PostFeedContent } from '@/types/feedTypes';
import { FEED_CARD_CONFIGS } from '@/lib/feedConfig';

interface PostFeedCardProps {
  item: FeedItem;
  onEngagementToggle: (feedItemId: string, action: string) => void;
  onNavigate?: (contentId: string) => void;
}

export const PostFeedCard: React.FC<PostFeedCardProps> = ({
  item,
  onEngagementToggle,
  onNavigate,
}) => {
  const content = item.content as PostFeedContent;
  const config = FEED_CARD_CONFIGS.post;
  const [expanded, setExpanded] = useState(false);

  const shouldTruncate = content.fullBodyLength > config.maxBodyPreviewLength;
  const displayText = expanded ? content.body : content.bodyPreview;

  return (
    <FeedCardShell
      contentType="post"
      primaryC={item.primaryC}
      author={item.createdBy}
      createdAt={item.createdAt}
    >
      {/* Body text */}
      <div className="mb-3">
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {displayText}
        </p>
        {shouldTruncate && !expanded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(true);
            }}
            className="text-sm font-medium text-dna-emerald hover:underline mt-1"
          >
            Read more
          </button>
        )}
      </div>

      {/* Media */}
      {content.media.length > 0 && (
        <div className="mb-3 -mx-4 md:mx-0">
          {content.media.length === 1 ? (
            <img
              src={content.media[0].url}
              alt={content.media[0].altText || 'Post media'}
              className="w-full max-h-[300px] md:max-h-[400px] object-cover md:rounded-lg"
              loading="lazy"
            />
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {content.media.slice(0, 4).map((media, idx) => (
                <img
                  key={media.id}
                  src={media.url}
                  alt={media.altText || `Media ${idx + 1}`}
                  className="w-full h-40 object-cover md:rounded-lg"
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Link preview */}
      {content.linkPreview && (
        <a
          href={content.linkPreview.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-3 border border-border/50 rounded-lg overflow-hidden hover:bg-accent/30 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {content.linkPreview.image && (
            <img
              src={content.linkPreview.image}
              alt=""
              className="w-full h-40 object-cover"
              loading="lazy"
            />
          )}
          <div className="p-3">
            <p className="text-xs text-muted-foreground mb-1">{content.linkPreview.domain}</p>
            <p className="text-sm font-medium line-clamp-2">{content.linkPreview.title}</p>
            {content.linkPreview.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {content.linkPreview.description}
              </p>
            )}
          </div>
        </a>
      )}

      {/* Poll */}
      {content.poll && (
        <div className="mb-3 space-y-2">
          {content.poll.options.map((option) => (
            <div key={option.id} className="relative">
              <div
                className="absolute inset-0 bg-dna-emerald/10 rounded"
                style={{ width: `${option.percentage}%` }}
              />
              <div className="relative flex items-center justify-between px-3 py-2 rounded border border-border/30">
                <span className="text-sm">{option.text}</span>
                <span className="text-xs font-medium text-muted-foreground">
                  {option.percentage}%
                </span>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            {content.poll.totalVotes} vote{content.poll.totalVotes !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Hashtags */}
      {content.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {content.hashtags.map((tag) => (
            <span key={tag} className="text-xs text-dna-emerald font-medium">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <EngagementBar
        contentType="post"
        engagement={item.engagement}
        feedItemId={item.id}
        onToggle={onEngagementToggle}
      />
    </FeedCardShell>
  );
};
