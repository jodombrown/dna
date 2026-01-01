/**
 * DNA | FEED v2.0 - Story Detail (Feed Stories)
 * 
 * Full-page reading experience for stories created via Universal Composer.
 * Uses post_id from posts table, not convey_items slug.
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Loader2, BookOpen, Share2, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

export default function FeedStoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Check if param is a UUID (for backward compatibility)
  const isUUID = slug && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  const { data: story, isLoading, error } = useQuery({
    queryKey: ['feed-story', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No story identifier provided');

      // Build query - search by slug or id (for backward compatibility)
      let query = supabase
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
          slug,
          profiles:author_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('is_deleted', false);

      // If it's a UUID, search by id; otherwise search by slug
      if (isUUID) {
        query = query.eq('id', slug);
      } else {
        query = query.eq('slug', slug);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Content not found');
      
      return data;
    },
    enabled: !!slug,
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

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dna/convey');
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center pb-16 md:pb-0">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <MobileBottomNav />
      </>
    );
  }

  if (error || !story) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 pb-20 md:pb-6">
          <div className="max-w-md w-full bg-muted/50 border border-border rounded-lg p-6 sm:p-8 text-center space-y-4">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Content not available</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                This content may have been removed or is no longer accessible.
              </p>
            </div>
            <Button onClick={() => navigate('/dna/feed')} variant="outline" size="sm">
              Back to Feed
            </Button>
          </div>
        </div>
        <MobileBottomNav />
      </>
    );
  }

  const isStory = story.post_type === 'story';

  const author = story.profiles as any;

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Header Navigation */}
      <div className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="h-8 w-8"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Story Content */}
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {isStory && (
          <Badge variant="secondary" className="gap-1 mb-4 text-xs uppercase tracking-wide">
            <BookOpen className="h-3 w-3" />
            Story
          </Badge>
        )}

        <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2 leading-tight">
          {story.title}
        </h1>

        {story.subtitle && (
          <p className="text-base md:text-lg text-muted-foreground mb-4 leading-relaxed">
            {story.subtitle}
          </p>
        )}

        <div className="flex items-center gap-2 pb-4 mb-6 border-b">
          <Avatar 
            className="h-10 w-10 cursor-pointer"
            onClick={() => navigate(`/dna/${author?.username}`)}
          >
            <AvatarImage src={author?.avatar_url || ''} />
            <AvatarFallback>{author?.full_name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p 
              className="font-medium text-sm hover:underline cursor-pointer"
              onClick={() => navigate(`/dna/${author?.username}`)}
            >
              {author?.full_name || author?.username}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(story.created_at), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>

        {story.image_url && (
          <div
            className="w-full rounded-xl overflow-hidden mb-6 cursor-pointer group bg-muted/30"
            onClick={() => setShowImagePreview(true)}
          >
            <img
              src={story.image_url}
              alt={story.title}
              className="w-full h-auto max-h-[320px] sm:max-h-[480px] object-contain mx-auto group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
        )}

        <div className="space-y-4">
          {story.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-base md:text-lg text-foreground/90 leading-relaxed whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      </article>

      {/* Footer CTA */}
      <div className="border-t bg-muted/30 py-6 md:py-8 mt-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <p className="text-sm md:text-base text-muted-foreground">
            Explore more stories from the diaspora
          </p>
          <Button onClick={() => navigate('/dna/convey')} size="sm">
            View All Stories
          </Button>
        </div>
      </div>

      {/* Image Preview Dialog */}
      {showImagePreview && story.image_url && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowImagePreview(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setShowImagePreview(false)}
            aria-label="Close preview"
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={story.image_url}
            alt={story.title}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <MobileBottomNav />
    </div>
  );
}
