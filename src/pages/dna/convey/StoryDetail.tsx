import { useParams, useNavigate } from 'react-router-dom';
import DetailViewLayout from '@/layouts/DetailViewLayout';
import { useConveyItemBySlug } from '@/hooks/useConveyFeed';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Loader2, ExternalLink, Calendar, Sparkles, BookOpen } from 'lucide-react';
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
    <DetailViewLayout
      title={item?.title || 'Story'}
      backPath="/dna/convey"
      backLabel="Back to Stories"
      breadcrumbs={item ? [
        { label: 'Home', path: '/dna/feed' },
        { label: 'Convey', path: '/dna/convey' },
        { label: item.title }
      ] : undefined}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dna/convey')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to stories
        </Button>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="bg-muted/50 border border-border rounded-lg p-8 text-center space-y-4">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Story not available</h2>
              <p className="text-muted-foreground">This story may have been removed or is no longer accessible.</p>
            </div>
            <Button onClick={() => navigate('/dna/feed')} variant="outline">
              Back to Feed
            </Button>
          </div>
        )}

        {!isLoading && !error && item && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <article className="lg:col-span-2 bg-card border border-border rounded-lg p-8">
              <Badge variant={getTypeBadgeVariant(item.type)} className="mb-4">
                {item.type === 'story' ? (
                  <><BookOpen className="h-3 w-3 mr-1 inline" />Story</>
                ) : item.type === 'impact' ? (
                  <><Sparkles className="h-3 w-3 mr-1 inline" />{getTypeLabel(item.type)}</>
                ) : (
                  getTypeLabel(item.type)
                )}
              </Badge>

              <h1 className="text-4xl font-bold text-foreground mb-3">{item.title}</h1>

              {item.subtitle && (
                <p className="text-xl text-muted-foreground italic mb-6">{item.subtitle}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 pb-6 mb-6 border-b border-border">
                {item.author && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.author.avatar_url || undefined} />
                      <AvatarFallback>{item.author.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{item.author.full_name}</span>
                  </div>
                )}

                {item.published_at && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground/60">•</span>
                    <span className="text-muted-foreground">
                      {format(new Date(item.published_at), 'MMMM d, yyyy')}
                    </span>
                  </div>
                )}

                {item.region && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground/60">•</span>
                    <span className="text-muted-foreground">{item.region}</span>
                  </div>
                )}
              </div>

              {item.focus_areas && item.focus_areas.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {item.focus_areas.map((focus, idx) => (
                    <Badge key={idx} variant="outline">{focus}</Badge>
                  ))}
                </div>
              )}

              <div className="prose prose-lg max-w-none">
                {item.body.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-foreground/90 mb-4 leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </article>

            <aside className="space-y-6">
              {item.primary_space && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Connected to
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{item.primary_space.name}</h4>
                      {item.primary_space.tagline && (
                        <p className="text-sm text-muted-foreground mb-3">{item.primary_space.tagline}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => navigate(`/dna/collaborate/spaces/${item.primary_space?.slug}`)}
                      className="w-full"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View space
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/dna/contribute/needs?space_id=${item.primary_space?.id}`)}
                      className="w-full"
                    >
                      See ways to support
                    </Button>
                  </div>
                </div>
              )}

              {item.primary_event && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Related Event
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{item.primary_event.title}</h4>
                      {item.primary_event.start_time && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(item.primary_event.start_time), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => navigate(`/dna/convene/events/${item.primary_event?.id}`)}
                      className="w-full"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View event
                    </Button>
                  </div>
                </div>
              )}

              {!item.primary_space && !item.primary_event && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Get Involved
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground mb-3">
                      Explore opportunities to connect, collaborate, and contribute across the DNA community.
                    </p>
                    <Button variant="outline" onClick={() => navigate('/dna/collaborate/spaces')} className="w-full">
                      Browse spaces
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/dna/convene/events')} className="w-full">
                      Find events
                    </Button>
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </DetailViewLayout>
  );
}
