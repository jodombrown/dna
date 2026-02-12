/**
 * DNA | FEED v2 - Card Shell
 *
 * Shared wrapper for all v2 feed cards. Applies the C-module accent border,
 * consistent padding, and author header based on FeedCardConfig.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { FEED_CARD_CONFIGS, C_MODULE_LABELS } from '@/lib/feedConfig';
import type { FeedContentType, FeedAuthor, CModule } from '@/types/feedTypes';

interface FeedCardShellProps {
  contentType: FeedContentType;
  primaryC: CModule;
  author?: FeedAuthor;
  createdAt: Date;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const FeedCardShell: React.FC<FeedCardShellProps> = ({
  contentType,
  primaryC,
  author,
  createdAt,
  children,
  onClick,
  className,
}) => {
  const config = FEED_CARD_CONFIGS[contentType];
  const moduleLabel = C_MODULE_LABELS[primaryC] || primaryC;

  const initials = author?.displayName
    ? author.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card rounded-none md:rounded-xl',
        'border-b border-border/30 md:border md:border-border/50',
        'px-4 py-4 md:p-5',
        'transition-all duration-200',
        'hover:bg-accent/30',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        borderLeftWidth: config.leftBorderWidth > 0 ? `${config.leftBorderWidth}px` : undefined,
        borderLeftColor: config.leftBorderWidth > 0 ? config.accentColor : undefined,
        borderLeftStyle: config.leftBorderWidth > 0 ? 'solid' : undefined,
      }}
    >
      {/* Module indicator */}
      <div className="flex items-center gap-1.5 mb-2">
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{ backgroundColor: config.accentColor }}
        />
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {moduleLabel}
        </span>
      </div>

      {/* Author header */}
      {config.showAuthorHeader && author && (
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={author.avatarUrl || undefined} alt={author.displayName} />
            <AvatarFallback className="text-xs font-medium bg-muted">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold truncate">{author.displayName}</span>
              {author.isVerified && (
                <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                  Verified
                </Badge>
              )}
              {author.tier === 'pro' && (
                <Badge
                  variant="outline"
                  className="h-4 px-1 text-[9px] border-dna-gold text-dna-gold"
                >
                  PRO
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {author.headline && (
                <>
                  <span className="truncate max-w-[160px]">{author.headline}</span>
                  <span>·</span>
                </>
              )}
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};
