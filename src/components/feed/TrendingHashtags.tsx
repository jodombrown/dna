import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Hash } from 'lucide-react';
import { useTrendingHashtags } from '@/hooks/useTrendingHashtags';
import { Skeleton } from '@/components/ui/skeleton';

interface TrendingHashtagsProps {
  onHashtagClick?: (tag: string) => void;
}

export function TrendingHashtags({ onHashtagClick }: TrendingHashtagsProps) {
  const { data: trending, isLoading } = useTrendingHashtags(10);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!trending || trending.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trending Topics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {trending.map((item, index) => (
          <button
            key={item.tag}
            onClick={() => onHashtagClick?.(item.tag)}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors text-left group"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-muted-foreground text-sm font-medium">
                {index + 1}
              </span>
              <Hash className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-medium truncate group-hover:text-primary transition-colors">
                {item.tag}
              </span>
            </div>
            <Badge variant="secondary" className="ml-2">
              {item.recent_usage_count}
            </Badge>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}