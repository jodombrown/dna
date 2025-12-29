import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Flame, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DiaHashtagChipProps {
  name: string;
  post_count?: number;
  trending?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (hashtag: string) => void;
}

export function DiaHashtagChip({
  name,
  post_count,
  trending = false,
  size = 'md',
  onClick
}: DiaHashtagChipProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(name);
    } else {
      navigate(`/explore?hashtag=${encodeURIComponent(name)}`);
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex flex-col items-start gap-0.5 rounded-xl border transition-all duration-200",
        "bg-background hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-950/30 dark:hover:border-emerald-800",
        "cursor-pointer group min-w-[80px]",
        sizeClasses[size],
        trending && "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20"
      )}
    >
      <div className="flex items-center gap-1">
        <span className={cn(
          "font-medium group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors",
          trending && "text-orange-700 dark:text-orange-400"
        )}>
          #{name}
        </span>
        {trending && (
          <Flame className={cn(iconSizes[size], "text-orange-500 animate-pulse")} />
        )}
      </div>
      {post_count !== undefined && (
        <span className="text-xs text-muted-foreground">
          {formatCount(post_count)} posts
        </span>
      )}
    </button>
  );
}

// Simple inline variant for use in text
export function DiaHashtagInline({
  name,
  onClick
}: {
  name: string;
  onClick?: (hashtag: string) => void;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(name);
    } else {
      navigate(`/explore?hashtag=${encodeURIComponent(name)}`);
    }
  };

  return (
    <Badge
      variant="secondary"
      className="cursor-pointer hover:bg-emerald-600 hover:text-white transition-colors"
      onClick={handleClick}
    >
      #{name}
    </Badge>
  );
}

export default DiaHashtagChip;
