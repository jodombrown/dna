import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  createStandardPost, 
  createEventPost, 
  createSpacePost, 
  createNeedPost, 
  createStoryPost,
  createCommunityFeedPost 
} from '@/lib/feedWriter';
import { logHighError } from '@/lib/errorLogger';
import type { UniversalFeedItem } from '@/types/feed';

export type ComposerMode = 'post' | 'story' | 'event' | 'need' | 'space' | 'community';

export interface ComposerContext {
  spaceId?: string;
  eventId?: string;
  communityId?: string;
}

export interface ComposerFormData {
  content: string;
  title?: string;
  mediaUrl?: string;
  // Event specific
  eventDate?: string;
  eventTime?: string;
  eventEndDate?: string;
  eventEndTime?: string;
  location?: string;
  format?: 'in_person' | 'virtual' | 'hybrid';
  maxAttendees?: number;
  registrationRequired?: boolean;
  // Need specific
  needType?: 'funding' | 'expertise' | 'resources' | 'volunteers' | 'partnership';
  targetAmount?: number;
  currency?: string;
  neededBy?: string;
  // Space specific
  spaceDescription?: string;
  spaceCategory?: string;
  visibility?: 'public' | 'private';
  // Story specific
  subtitle?: string;
  heroImage?: string;
}

export const useUniversalComposer = (initialContext?: ComposerContext) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ComposerMode>('post');
  const [context, setContext] = useState<ComposerContext>(initialContext || {});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const open = useCallback((selectedMode?: ComposerMode, ctx?: ComposerContext) => {
    if (selectedMode) setMode(selectedMode);
    if (ctx) setContext({ ...context, ...ctx });
    setIsOpen(true);
    
    // Track composer open
    trackComposerEvent('open', selectedMode || mode);
  }, [mode, context]);

  const close = useCallback(() => {
    setIsOpen(false);
    trackComposerEvent('cancel', mode);
  }, [mode]);

  const switchMode = useCallback((newMode: ComposerMode) => {
    trackComposerEvent('switch', newMode, { fromMode: mode });
    setMode(newMode);
  }, [mode]);

  const submit = useCallback(async (formData: ComposerFormData) => {
    if (!user) {
      toast({ variant: 'destructive', description: 'You must be logged in' });
      return;
    }

    if (!formData.content || !formData.content.trim()) {
      toast({ variant: 'destructive', description: 'Please write something before posting.' });
      return;
    }

    setIsSubmitting(true);

    try {
      let createdPost: UniversalFeedItem | null = null;

      switch (mode) {
        case 'post': {
          const post = await createStandardPost({
            authorId: user.id,
            content: formData.content,
            mediaUrl: formData.mediaUrl,
            spaceId: context.spaceId,
            eventId: context.eventId,
          });

          // Map to UniversalFeedItem so it shows up instantly
          createdPost = {
            post_id: post.post_id,
            author_id: post.author_id,
            author_username: post.author_username,
            author_display_name: post.author_full_name,
            author_avatar_url: post.author_avatar_url || null,
            content: post.content,
            media_url: post.image_url || null,
            post_type: 'post',
            privacy_level: 'public',
            linked_entity_type: null,
            linked_entity_id: null,
            space_id: context.spaceId || null,
            space_title: null,
            event_id: context.eventId || null,
            event_title: null,
            created_at: post.created_at,
            updated_at: post.created_at,
            like_count: 0,
            comment_count: 0,
            share_count: 0,
            view_count: 0,
            bookmark_count: 0,
            has_liked: false,
            has_bookmarked: false,
          };
          break;
        }

        case 'story':
          // Use Supabase client with type casting for new table
          const { data: storyData, error: storyError } = await (supabase as any)
            .from('convey_items')
            .insert({
              title: formData.title || 'Untitled Story',
              subtitle: formData.subtitle,
              content: formData.content,
              author_id: user.id,
              item_type: 'story',
              status: 'published',
              hero_image: formData.heroImage || formData.mediaUrl,
            })
            .select()
            .single();

          if (storyError) throw storyError;

          await createStoryPost({
            storyId: storyData.id,
            storyTitle: formData.title || 'Untitled Story',
            storySubtitle: formData.subtitle,
            authorId: user.id,
            spaceId: context.spaceId,
            eventId: context.eventId,
            imageUrl: formData.heroImage || formData.mediaUrl,
          });
          break;

        case 'event':
          const eventPayload = {
            title: formData.title || '',
            description: formData.content,
            event_date: formData.eventDate,
            event_time: formData.eventTime,
            end_date: formData.eventEndDate,
            end_time: formData.eventEndTime,
            location: formData.location,
            format: formData.format || 'in_person',
            max_attendees: formData.maxAttendees,
            registration_required: formData.registrationRequired || false,
            cover_image_url: formData.mediaUrl,
            space_id: context.spaceId,
          };

          const { data: authData } = await supabase.auth.getSession();
          const response = await supabase.functions.invoke('create-event', {
            body: eventPayload,
            headers: {
              Authorization: `Bearer ${authData.session?.access_token}`,
            },
          });

          if (response.error) throw response.error;
          break;

        case 'need':
          // Use Supabase client with type casting for contribution_needs
          const { data: needData, error: needError } = await (supabase as any)
            .from('contribution_needs')
            .insert({
              title: formData.title || '',
              description: formData.content,
              type: formData.needType || 'expertise',
              space_id: context.spaceId!,
              created_by: user.id,
              target_amount: formData.targetAmount,
              currency: formData.currency,
              needed_by: formData.neededBy,
            })
            .select()
            .single();

          if (needError) throw needError;

          await createNeedPost({
            needId: needData.id,
            needTitle: formData.title || '',
            needDescription: formData.content,
            needType: formData.needType || 'expertise',
            authorId: user.id,
            spaceId: context.spaceId!,
          });
          break;

        case 'space':
          const { data: spaceData, error: spaceError } = await supabase
            .from('collaboration_spaces')
            .insert({
              title: formData.title || '',
              description: formData.content,
              created_by: user.id,
              visibility: formData.visibility || 'public',
              image_url: formData.mediaUrl,
            })
            .select()
            .single();

          if (spaceError) throw spaceError;

          await createSpacePost({
            spaceId: spaceData.id,
            spaceTitle: formData.title || '',
            spaceDescription: formData.content,
            authorId: user.id,
            imageUrl: formData.mediaUrl,
          });
          break;

        case 'community':
          if (!context.communityId) {
            throw new Error('Community ID required for community posts');
          }

          const { data: communityPostData, error: communityError } = await supabase
            .from('community_posts')
            .insert({
              title: formData.title,
              content: formData.content,
              author_id: user.id,
              community_id: context.communityId,
              media_url: formData.mediaUrl,
            })
            .select()
            .single();

          if (communityError) throw communityError;

          await createCommunityFeedPost({
            communityPostId: communityPostData.id,
            content: formData.content,
            authorId: user.id,
            communityId: context.communityId,
            mediaUrl: formData.mediaUrl,
          });
          break;
      }

      // 🔥 Optimistically inject into home feed cache
      if (createdPost) {
        queryClient.setQueryData(
          ['universal-feed', { viewerId: user.id, tab: 'all', authorId: undefined, spaceId: undefined, eventId: undefined, rankingMode: 'latest' }],
          (old: UniversalFeedItem[] | undefined) => {
            const existing = old || [];
            return [createdPost!, ...existing];
          }
        );

        // Also inject into "My Posts" feed cache
        queryClient.setQueryData(
          ['universal-feed', { viewerId: user.id, tab: 'my_posts', authorId: user.id, spaceId: undefined, eventId: undefined, rankingMode: 'latest' }],
          (old: UniversalFeedItem[] | undefined) => {
            const existing = old || [];
            return [createdPost!, ...existing];
          }
        );
      }

      // Invalidate feed queries as backup so server state catches up
      await queryClient.invalidateQueries({ queryKey: ['universal-feed'] });

      // Track submission
      trackComposerEvent('submit', mode, {
        contentLength: formData.content.length,
        hasMedia: !!formData.mediaUrl,
      });

      toast({
        description: getSuccessMessage(mode),
      });

      setIsOpen(false);
    } catch (error) {
      logHighError(error, 'composer', `Failed to create ${mode}`, { mode, context });
      toast({
        variant: 'destructive',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [user, mode, context, queryClient]);

  return {
    isOpen,
    mode,
    context,
    isSubmitting,
    open,
    close,
    switchMode,
    submit,
  };
};

function trackComposerEvent(action: 'open' | 'cancel' | 'switch' | 'submit', mode: ComposerMode, metadata?: any) {
  // Silent tracking - don't block UX
  try {
    supabase.from('analytics_events').insert({
      event_name: `composer_${action}`,
      event_metadata: { mode, ...metadata },
      route: window.location.pathname,
    }).then(() => {});
  } catch (err) {
    console.warn('Failed to track composer event:', err);
  }
}

function getSuccessMessage(mode: ComposerMode): string {
  switch (mode) {
    case 'post': return 'Post shared!';
    case 'story': return 'Story published!';
    case 'event': return 'Event created!';
    case 'need': return 'Need posted!';
    case 'space': return 'Space created!';
    case 'community': return 'Shared to community!';
    default: return 'Published!';
  }
}
