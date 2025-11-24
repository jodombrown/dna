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
  eventType?: 'conference' | 'workshop' | 'meetup' | 'webinar' | 'networking' | 'social' | 'other';
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
        case 'story': {
          if (!formData.title) {
            toast({ variant: 'destructive', description: 'Story title is required' });
            return;
          }

          const story = await createStoryPost({
            authorId: user.id,
            storyTitle: formData.title,
            storyBody: formData.content,
            storySubtitle: formData.subtitle,
            imageUrl: formData.heroImage || formData.mediaUrl,
            spaceId: context.spaceId,
            eventId: context.eventId,
          });

          // Map to UniversalFeedItem so it shows up instantly
          createdPost = {
            post_id: story.post_id,
            author_id: story.author_id,
            author_username: story.author_username,
            author_display_name: story.author_full_name,
            author_avatar_url: story.author_avatar_url || null,
            content: story.content,
            media_url: story.image_url || null,
            post_type: 'story',
            privacy_level: 'public',
            linked_entity_type: null,
            linked_entity_id: null,
            space_id: context.spaceId || null,
            space_title: null,
            event_id: context.eventId || null,
            event_title: null,
            created_at: story.created_at,
            updated_at: story.created_at,
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


        case 'event':
          // Combine date and time into ISO timestamp strings
          const startTime = formData.eventDate && formData.eventTime 
            ? `${formData.eventDate}T${formData.eventTime}:00`
            : formData.eventDate 
              ? `${formData.eventDate}T12:00:00`
              : new Date().toISOString();
          
          const endTime = formData.eventEndDate && formData.eventEndTime
            ? `${formData.eventEndDate}T${formData.eventEndTime}:00`
            : formData.eventEndDate
              ? `${formData.eventEndDate}T13:00:00`
              : new Date(new Date(startTime).getTime() + 3600000).toISOString(); // +1 hour default

          const eventPayload = {
            title: formData.title || '',
            description: formData.content,
            event_type: formData.eventType || 'meetup',
            format: formData.format || 'in_person',
            start_time: startTime,
            end_time: endTime,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            location_name: formData.format === 'virtual' ? undefined : formData.location,
            meeting_url: formData.format === 'virtual' ? formData.location : undefined,
            max_attendees: formData.maxAttendees,
            is_public: true,
            requires_approval: false,
            allow_guests: true,
            cover_image_url: formData.mediaUrl,
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

      // 🔥 TRUST-FIRST: Optimistically inject into ALL relevant feed caches
      if (createdPost) {
        // 1. All Posts feed
        queryClient.setQueryData(
          ['universal-feed-infinite', { viewerId: user.id, tab: 'all', authorId: undefined, spaceId: undefined, eventId: undefined, rankingMode: 'latest' }],
          (old: any) => {
            if (!old?.pages) return old;
            return {
              ...old,
              pages: [{ items: [createdPost, ...(old.pages[0]?.items || [])], nextCursor: old.pages[0]?.nextCursor }, ...old.pages.slice(1)]
            };
          }
        );

        // 2. My Posts feed
        queryClient.setQueryData(
          ['universal-feed-infinite', { viewerId: user.id, tab: 'my_posts', authorId: user.id, spaceId: undefined, eventId: undefined, rankingMode: 'latest' }],
          (old: any) => {
            if (!old?.pages) return old;
            return {
              ...old,
              pages: [{ items: [createdPost, ...(old.pages[0]?.items || [])], nextCursor: old.pages[0]?.nextCursor }, ...old.pages.slice(1)]
            };
          }
        );

        // 3. Context-specific feeds (Space/Event/Community)
        if (context.spaceId) {
          queryClient.setQueryData(
            ['universal-feed-infinite', { viewerId: user.id, tab: 'all', authorId: undefined, spaceId: context.spaceId, eventId: undefined, rankingMode: 'latest' }],
            (old: any) => {
              if (!old?.pages) return old;
              return {
                ...old,
                pages: [{ items: [createdPost, ...(old.pages[0]?.items || [])], nextCursor: old.pages[0]?.nextCursor }, ...old.pages.slice(1)]
              };
            }
          );
        }

        if (context.eventId) {
          queryClient.setQueryData(
            ['universal-feed-infinite', { viewerId: user.id, tab: 'all', authorId: undefined, spaceId: undefined, eventId: context.eventId, rankingMode: 'latest' }],
            (old: any) => {
              if (!old?.pages) return old;
              return {
                ...old,
                pages: [{ items: [createdPost, ...(old.pages[0]?.items || [])], nextCursor: old.pages[0]?.nextCursor }, ...old.pages.slice(1)]
              };
            }
          );
        }
      }

      // Invalidate as backup so server state reconciles
      await queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      await queryClient.invalidateQueries({ queryKey: ['universal-feed-infinite'] });

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
      logHighError(error, 'composer', `Failed to create ${mode}`, { mode, context, formData });
      
      // TRUST-FIRST: Clear, mode-specific error messages
      const errorMessages: Record<ComposerMode, string> = {
        post: 'We couldn\'t publish this post. Your text is safe—please try again.',
        story: 'We couldn\'t publish this Story. Your content is safe—please try again.',
        event: 'We couldn\'t create this Event. Your details are safe—please try again.',
        need: 'We couldn\'t post this Need. Your request is safe—please try again.',
        space: 'We couldn\'t create this Space. Your information is safe—please try again.',
        community: 'We couldn\'t share to this Community. Your post is safe—please try again.',
      };

      toast({
        variant: 'destructive',
        title: 'Publishing failed',
        description: errorMessages[mode],
      });
      
      // DO NOT close composer or clear content - preserve user's work
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
