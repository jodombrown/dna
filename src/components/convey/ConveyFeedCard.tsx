import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ConveyItemWithDetails } from '@/types/conveyTypes';

interface ConveyFeedCardProps {
  item: ConveyItemWithDetails;
}

export function ConveyFeedCard({ item }: ConveyFeedCardProps) {
  const navigate = useNavigate();

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

  const getBodySnippet = (body: string, maxLength: number = 200) => {
    // Strip markdown and get plain text
    const plainText = body.replace(/[#*_\[\]()]/g, '').trim();
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
  };

  return (
    <div
      onClick={() => navigate(`/dna/story/${item.slug}`)}
      className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <Badge variant={getTypeBadgeVariant(item.type)}>
          {getTypeLabel(item.type)}
        </Badge>
        {item.published_at && (
          <span className="text-sm text-muted-foreground">
            {format(new Date(item.published_at), 'MMM d, yyyy')}
          </span>
        )}
      </div>

      {/* Title & Subtitle */}
      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {item.title}
      </h3>
      {item.subtitle && (
        <p className="text-sm text-muted-foreground mb-3">{item.subtitle}</p>
      )}

      {/* Body snippet */}
      <p className="text-sm text-foreground/80 mb-4 line-clamp-3">
        {getBodySnippet(item.body)}
      </p>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {/* Author */}
        {item.author && (
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={item.author.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {item.author.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span>{item.author.full_name}</span>
          </div>
        )}

        {/* Space */}
        {item.primary_space && (
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground/60">•</span>
            <span>From: {item.primary_space.name}</span>
          </div>
        )}

        {/* Region */}
        {item.region && (
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground/60">•</span>
            <span>{item.region}</span>
          </div>
        )}
      </div>

      {/* Focus areas */}
      {item.focus_areas && item.focus_areas.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {item.focus_areas.slice(0, 2).map((focus, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {focus}
            </Badge>
          ))}
          {item.focus_areas.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{item.focus_areas.length - 2} more
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
