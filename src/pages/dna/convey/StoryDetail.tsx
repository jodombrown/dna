import { useParams, useNavigate } from 'react-router-dom';
import { FeedLayout } from '@/components/layout/FeedLayout';
import { useConveyItemBySlug } from '@/hooks/useConveyFeed';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function StoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: item, isLoading, error } = useConveyItemBySlug(slug);

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

  return (
    <FeedLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dna/convey')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to stories
        </Button>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <p className="text-destructive">
              Failed to load story. Please try again.
            </p>
          </div>
        )}

        {/* Story Content */}
        {!isLoading && !error && item && (
          <article className="bg-card border border-border rounded-lg p-8">
            {/* Type badge */}
            <Badge variant={getTypeBadgeVariant(item.type)} className="mb-4">
              {getTypeLabel(item.type)}
            </Badge>

            {/* Title */}
            <h1 className="text-4xl font-bold text-foreground mb-3">
              {item.title}
            </h1>

            {/* Subtitle */}
            {item.subtitle && (
              <p className="text-xl text-muted-foreground mb-6">
                {item.subtitle}
              </p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 pb-6 mb-6 border-b border-border">
              {/* Author */}
              {item.author && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={item.author.avatar_url || undefined} />
                    <AvatarFallback>
                      {item.author.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{item.author.full_name}</span>
                </div>
              )}

              {/* Published date */}
              {item.published_at && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground/60">•</span>
                  <span className="text-muted-foreground">
                    {format(new Date(item.published_at), 'MMMM d, yyyy')}
                  </span>
                </div>
              )}

              {/* Region */}
              {item.region && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground/60">•</span>
                  <span className="text-muted-foreground">{item.region}</span>
                </div>
              )}
            </div>

            {/* Space */}
            {item.primary_space && (
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-1">From</p>
                <p className="font-semibold text-foreground">
                  {item.primary_space.name}
                </p>
                {item.primary_space.tagline && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.primary_space.tagline}
                  </p>
                )}
              </div>
            )}

            {/* Focus areas */}
            {item.focus_areas && item.focus_areas.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {item.focus_areas.map((focus, idx) => (
                  <Badge key={idx} variant="outline">
                    {focus}
                  </Badge>
                ))}
              </div>
            )}

            {/* Body */}
            <div className="prose prose-lg max-w-none">
              {item.body.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-foreground/90 mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        )}
      </div>
    </FeedLayout>
  );
}
