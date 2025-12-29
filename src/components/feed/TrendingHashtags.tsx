import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Hash, ChevronRight } from 'lucide-react';
import { useTrendingHashtags } from '@/hooks/useTrendingHashtags';
import { Skeleton } from '@/components/ui/skeleton';

interface TrendingHashtagsProps {
  onHashtagClick?: (tag: string) => void;
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export function TrendingHashtags({
  onHashtagClick,
  limit = 5,
  showHeader = true,
  className
}: TrendingHashtagsProps) {
  const navigate = useNavigate();
  const { data: trending, isLoading } = useTrendingHashtags(limit);

  const handleClick = (tag: string) => {
    if (onHashtagClick) {
      onHashtagClick(tag);
    } else {
      navigate(`/dna/hashtag/${tag}`);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-dna-copper" />
              Trending Now
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!trending || trending.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-dna-copper" />
            Trending Now
            <Badge className="bg-dna-copper text-white text-[10px] px-1.5 py-0 h-4 font-semibold">
              New
            </Badge>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-1">
        {trending.map((item, index) => {
          const tagName = (item as any).tag || (item as any).name || '';
          const recentCount = (item as any).recent_usage_count || (item as any).recent_uses || 0;
          const followerCount = (item as any).follower_count || 0;

          return (
            <Link
              key={tagName}
              to={`/dna/hashtag/${tagName}`}
              onClick={(e) => {
                if (onHashtagClick) {
                  e.preventDefault();
                  onHashtagClick(tagName);
                }
              }}
              className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-dna-copper/10 text-dna-copper font-semibold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium truncate">{tagName}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {recentCount} posts today{followerCount > 0 ? ` · ${followerCount} followers` : ''}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
