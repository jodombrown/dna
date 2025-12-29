import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Heart, Clock, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export interface DiaStoryCardProps {
  id: string;
  title: string;
  excerpt?: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  published_at: string;
  view_count?: number;
  like_count?: number;
  hashtags?: string[];
  cover_image?: string;
  compact?: boolean;
  onHashtagClick?: (hashtag: string) => void;
}

export function DiaStoryCard({
  id,
  title,
  excerpt,
  author,
  published_at,
  view_count = 0,
  like_count = 0,
  hashtags = [],
  cover_image,
  compact = false,
  onHashtagClick
}: DiaStoryCardProps) {
  const navigate = useNavigate();

  const handleViewStory = () => {
    navigate(`/story/${id}`);
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${author.id}`);
  };

  const handleHashtagClick = (e: React.MouseEvent, hashtag: string) => {
    e.stopPropagation();
    onHashtagClick?.(hashtag);
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

  const timeAgo = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(published_at), { addSuffix: true });
    } catch {
      return published_at;
    }
  }, [published_at]);

  if (compact) {
    return (
      <button
        onClick={handleViewStory}
        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer text-left group w-full"
      >
        {cover_image && (
          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
            <img
              src={cover_image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {title}
            <ArrowUpRight className="h-3 w-3 inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className="truncate">{author.name}</span>
            <span>·</span>
            <span className="shrink-0">{timeAgo}</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Cover Image */}
      {cover_image && (
        <div
          className="h-32 sm:h-40 overflow-hidden cursor-pointer"
          onClick={handleViewStory}
        >
          <img
            src={cover_image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <CardContent className={cn("p-4", !cover_image && "pt-4")}>
        <div className="flex flex-col gap-3">
          {/* Title and excerpt */}
          <div className="cursor-pointer" onClick={handleViewStory}>
            <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-emerald-600 transition-colors">
              {title}
            </h4>
            {excerpt && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                "{excerpt}"
              </p>
            )}
          </div>

          {/* Author info */}
          <button
            onClick={handleAuthorClick}
            className="flex items-center gap-2 hover:bg-muted/50 rounded-lg p-1 -ml-1 transition-colors"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={author.avatar_url} alt={author.name} />
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                {author.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {author.name}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
          </button>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatCount(view_count)} views
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {formatCount(like_count)} likes
            </span>
          </div>

          {/* Hashtags */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hashtags.slice(0, 4).map((hashtag, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs font-normal cursor-pointer hover:bg-emerald-600 hover:text-white transition-colors"
                  onClick={(e) => handleHashtagClick(e, hashtag)}
                >
                  #{hashtag}
                </Badge>
              ))}
              {hashtags.length > 4 && (
                <Badge variant="secondary" className="text-xs font-normal text-muted-foreground">
                  +{hashtags.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Read button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewStory}
            className="w-full h-8 text-xs mt-1"
          >
            Read Story
            <ArrowUpRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default DiaStoryCard;
