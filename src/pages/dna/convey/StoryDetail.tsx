import { useParams, useNavigate } from 'react-router-dom';
import DetailViewLayout from '@/layouts/DetailViewLayout';
import { useConveyItemBySlug } from '@/hooks/useConveyFeed';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Loader2, ExternalLink, Calendar, Sparkles, BookOpen, MessageCircle, Eye, Share2, UserPlus, Users } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useStoryEngagement } from '@/hooks/useStoryEngagement';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { StoryAuthorCard } from '@/components/convey/StoryAuthorCard';
import { ContentConnectionSuggestions } from '@/components/convey/ContentConnectionSuggestions';

// Hook to fetch story by ID from posts table (for post-based stories)
function useStoryById(id: string | undefined) {
  return useQuery({
    queryKey: ['story-by-id', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          story_type,
          image_url,
          author_id,
          created_at,
          space_id,
          event_id,
          profiles:author_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .eq('post_type', 'story')
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    retry: false,
  });
}

export default function StoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Try to fetch from convey_items first (legacy slug-based)
  const { data: conveyItem, isLoading: conveyLoading, error: conveyError } = useConveyItemBySlug(slug);
  
  // If not found in convey_items, try posts table (ID-based)
  const isUUID = slug && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const { data: postItem, isLoading: postLoading, error: postError } = useStoryById(isUUID ? slug : undefined);
  
  // Determine which item to use
  const item = conveyItem || postItem;
  const isLoading = conveyLoading || (isUUID && postLoading);
  const hasError = conveyError && (!isUUID || postError);
  
  // Engagement data for post-based stories
  const storyId = postItem?.id || conveyItem?.id;
  const {
    reactions,
    commentCount,
    viewCount,
    isBookmarked,
    toggleBookmark,
  } = useStoryEngagement(storyId || '', user?.id);

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'story':
      case 'impact':
        return 'default';
      case 'update':
        return 'secondary';
      case 'spotlight':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      story: 'Story',
      impact: 'Impact Story',
      update: 'Update',
      spotlight: 'Spotlight',
      photo_essay: 'Photo Essay',
    };
    return labels[type] || 'Story';
  };

  // Handle share
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/dna/convey/stories/${slug}`;
    if (navigator.share) {
      await navigator.share({
        title: item?.title || 'DNA Story',
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  // Normalize the item structure
  const normalizedItem = item ? {
    title: 'title' in item ? item.title : '',
    body: 'body' in item ? item.body : ('content' in item ? item.content : ''),
    type: 'type' in item ? item.type : ('story_type' in item ? item.story_type : 'story'),
    subtitle: 'subtitle' in item ? item.subtitle : null,
    author: 'author' in item ? item.author : ('profiles' in item ? item.profiles : null),
    published_at: 'published_at' in item ? item.published_at : ('created_at' in item ? item.created_at : null),
    region: 'region' in item ? item.region : null,
    focus_areas: 'focus_areas' in item ? item.focus_areas : null,
    primary_space: 'primary_space' in item ? item.primary_space : null,
    primary_event: 'primary_event' in item ? item.primary_event : null,
    image_url: 'image_url' in item ? item.image_url : null,
  } : null;

  return (
    <DetailViewLayout
      title={normalizedItem?.title || 'Story'}
      backPath="/dna/convey"
      backLabel="Back to Stories"
      breadcrumbs={normalizedItem ? [
        { label: 'Home', path: '/dna/feed' },
        { label: 'Convey', path: '/dna/convey' },
        { label: normalizedItem.title || 'Story' }
      ] : undefined}
    >
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Mobile-friendly back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dna/convey')}
          className="mb-4 md:mb-6 h-10 px-3 -ml-3"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-sm md:text-base">Back to stories</span>
        </Button>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {hasError && (
          <div className="bg-muted/50 border border-border rounded-xl p-6 md:p-8 text-center space-y-4">
            <BookOpen className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-2">Story not available</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                This story may have been removed or is no longer accessible.
              </p>
            </div>
            <Button onClick={() => navigate('/dna/convey')} variant="outline" className="h-10">
              Back to Stories
            </Button>
          </div>
        )}

        {!isLoading && !hasError && normalizedItem && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Main Content */}
            <article className="lg:col-span-2 bg-card border border-border rounded-xl md:rounded-2xl overflow-hidden">
              {/* Cover Image */}
              {normalizedItem.image_url && (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={normalizedItem.image_url} 
                    alt={normalizedItem.title || 'Story cover'} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-5 md:p-8">
                {/* Type Badge */}
                <Badge variant={getTypeBadgeVariant(normalizedItem.type || 'story')} className="mb-3 md:mb-4">
                  {normalizedItem.type === 'impact' ? (
                    <><Sparkles className="h-3 w-3 mr-1 inline" />{getTypeLabel(normalizedItem.type)}</>
                  ) : (
                    <><BookOpen className="h-3 w-3 mr-1 inline" />{getTypeLabel(normalizedItem.type || 'story')}</>
                  )}
                </Badge>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 md:mb-3 leading-tight">
                  {normalizedItem.title}
                </h1>

                {/* Subtitle */}
                {normalizedItem.subtitle && (
                  <p className="text-lg md:text-xl text-muted-foreground italic mb-4 md:mb-6">
                    {normalizedItem.subtitle}
                  </p>
                )}

                {/* Author & Meta Row */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4 pb-4 md:pb-6 mb-4 md:mb-6 border-b border-border">
                  {normalizedItem.author && (
                    <StoryAuthorCard
                      author={{
                        id: (normalizedItem.author as any)?.id,
                        username: (normalizedItem.author as any)?.username,
                        full_name: (normalizedItem.author as any)?.full_name || 'Unknown Author',
                        avatar_url: (normalizedItem.author as any)?.avatar_url,
                        headline: (normalizedItem.author as any)?.headline,
                      }}
                      timestamp={normalizedItem.published_at
                        ? formatDistanceToNow(new Date(normalizedItem.published_at), { addSuffix: true })
                        : undefined
                      }
                      variant="default"
                      showConnectButton={true}
                      className="flex-1"
                    />
                  )}

                  {normalizedItem.region && (
                    <Badge variant="outline" className="text-xs">
                      {normalizedItem.region}
                    </Badge>
                  )}
                </div>

                {/* Focus Areas */}
                {normalizedItem.focus_areas && normalizedItem.focus_areas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                    {normalizedItem.focus_areas.map((focus: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {focus}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Body Content */}
                <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">
                  {normalizedItem.body?.split('\n\n').map((paragraph: string, idx: number) => (
                    <p key={idx} className="text-foreground/90 leading-relaxed whitespace-pre-line text-base md:text-lg">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Engagement Bar */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="text-sm md:text-base">{commentCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="text-sm md:text-base">{viewCount}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleShare}
                      className="h-9 px-3"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="ml-2 hidden sm:inline">Share</span>
                    </Button>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="space-y-4 md:space-y-6">
              {normalizedItem.primary_space && (
                <div className="bg-card border border-border rounded-xl p-4 md:p-6">
                  <h3 className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Connected to
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-foreground mb-1 text-sm md:text-base">
                        {normalizedItem.primary_space.name}
                      </h4>
                      {normalizedItem.primary_space.tagline && (
                        <p className="text-xs md:text-sm text-muted-foreground mb-3">
                          {normalizedItem.primary_space.tagline}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => navigate(`/dna/collaborate/spaces/${normalizedItem.primary_space?.slug}`)}
                      className="w-full h-10"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View space
                    </Button>
                  </div>
                </div>
              )}

              {normalizedItem.primary_event && (
                <div className="bg-card border border-border rounded-xl p-4 md:p-6">
                  <h3 className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Related Event
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-foreground mb-1 text-sm md:text-base">
                        {normalizedItem.primary_event.title}
                      </h4>
                      {normalizedItem.primary_event.start_time && (
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(normalizedItem.primary_event.start_time), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => navigate(`/dna/convene/events/${normalizedItem.primary_event?.id}`)}
                      className="w-full h-10"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View event
                    </Button>
                  </div>
                </div>
              )}

              {!normalizedItem.primary_space && !normalizedItem.primary_event && (
                <div className="bg-card border border-border rounded-xl p-4 md:p-6">
                  <h3 className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Get Involved
                  </h3>
                  <div className="space-y-3">
                    <p className="text-xs md:text-sm text-muted-foreground mb-3">
                      Explore opportunities to connect, collaborate, and contribute.
                    </p>
                    <Button variant="outline" onClick={() => navigate('/dna/collaborate/spaces')} className="w-full h-10">
                      Browse spaces
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/dna/convene/events')} className="w-full h-10">
                      Find events
                    </Button>
                  </div>
                </div>
              )}

              {/* Content-based connection suggestions */}
              {storyId && user?.id && (
                <ContentConnectionSuggestions
                  storyId={storyId}
                  userId={user.id}
                  focusAreas={normalizedItem.focus_areas || []}
                  limit={5}
                />
              )}
            </aside>
          </div>
        )}
      </div>
    </DetailViewLayout>
  );
}
