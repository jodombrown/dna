import { useNavigate } from 'react-router-dom';
import { useEventConveyItems } from '@/hooks/useConveyFeed';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface EventStoriesSectionProps {
  eventId: string;
}

export function EventStoriesSection({ eventId }: EventStoriesSectionProps) {
  const navigate = useNavigate();
  const { data: items, isLoading, error } = useEventConveyItems(eventId, { limit: 5 });

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'story':
        return 'default';
      case 'update':
        return 'secondary';
      case 'impact':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'story':
        return 'Story';
      case 'update':
        return 'Update';
      case 'impact':
        return 'Impact';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !items || items.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Stories & Updates
        </h3>
        <p className="text-sm text-muted-foreground">
          No stories linked to this event yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Stories from this Event
      </h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/dna/story/${item.slug}`)}
            className="border-b border-border last:border-0 pb-4 last:pb-0 cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded transition-colors"
          >
            <div className="flex items-start gap-3">
              <Badge variant={getTypeBadgeVariant(item.type)} className="mt-1">
                {getTypeLabel(item.type)}
              </Badge>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-1 hover:text-primary transition-colors">
                  {item.title}
                </h4>
                {item.subtitle && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.subtitle}
                  </p>
                )}
                {item.published_at && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.published_at), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
