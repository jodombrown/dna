/**
 * DNA | FEED v2.0 - Story Detail (Feed Stories)
 * 
 * Full-page reading experience for stories created via Universal Composer.
 * Uses post_id from posts table, not convey_items slug.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Loader2, BookOpen, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export default function FeedStoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: story, isLoading, error } = useQuery({
    queryKey: ['feed-story', id],
    queryFn: async () => {
      if (!id) throw new Error('No story ID provided');

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          subtitle,
          content,
          image_url,
          post_type,
          created_at,
          space_id,
          event_id,
          author_id,
          profiles:author_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .eq('post_type', 'story')
        .eq('is_deleted', false)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Story not found');
      
      return data;
    },
    enabled: !!id,
  });

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: story?.title || 'DNA Story',
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({ description: 'Link copied to clipboard' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-muted/50 border border-border rounded-lg p-8 text-center space-y-4">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold mb-2">Story not available</h2>
            <p className="text-muted-foreground">
              This story may have been removed or is no longer accessible.
            </p>
          </div>
          <Button onClick={() => navigate('/dna/convey')} variant="outline">
            Back to Stories
          </Button>
        </div>
      </div>
    );
  }

  const author = story.profiles as any;

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Story Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <Badge variant="secondary" className="gap-1 mb-4">
          <BookOpen className="h-3 w-3" />
          Story
        </Badge>

        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
          {story.title}
        </h1>

        {story.subtitle && (
          <p className="text-xl text-muted-foreground italic mb-8">
            {story.subtitle}
          </p>
        )}

        <div className="flex items-center gap-3 pb-8 mb-8 border-b">
          <Avatar 
            className="h-12 w-12 cursor-pointer"
            onClick={() => navigate(`/dna/${author?.username}`)}
          >
            <AvatarImage src={author?.avatar_url || ''} />
            <AvatarFallback>{author?.full_name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p 
              className="font-semibold hover:underline cursor-pointer"
              onClick={() => navigate(`/dna/${author?.username}`)}
            >
              {author?.full_name || author?.username}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(story.created_at), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>

        {story.image_url && (
          <div className="w-full rounded-lg overflow-hidden mb-8">
            <img
              src={story.image_url}
              alt={story.title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          {story.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-foreground/90 leading-relaxed mb-6 whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      </article>

      {/* Footer CTA */}
      <div className="border-t bg-muted/30 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <p className="text-muted-foreground">
            Explore more stories from the diaspora
          </p>
          <Button onClick={() => navigate('/dna/convey')}>
            View All Stories
          </Button>
        </div>
      </div>
    </div>
  );
}