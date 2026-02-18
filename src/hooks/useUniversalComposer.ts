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

interface InfiniteFeedData {
  pages: Array<{
    items: UniversalFeedItem[];
    nextCursor?: string;
  }>;
  pageParams: unknown[];
}

interface ComposerAnalyticsMetadata {
  fromMode?: ComposerMode;
  contentLength?: number;
  hasMedia?: boolean;
  [key: string]: unknown;
}

export type ComposerMode = 'post' | 'story' | 'event' | 'need' | 'space' | 'community';

export interface ComposerContext {
  spaceId?: string;
  eventId?: string;
  communityId?: string;
}

export interface AgendaItem {
  time: string;
  title: string;
}

export interface ComposerFormData {
  content: string;
  title?: string;
  mediaUrl?: string;
  // Link/video preview
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkThumbnail?: string;
  linkProviderName?: string;
  // Event specific
  eventDate?: string;
  eventTime?: string;
  eventEndDate?: string;
  eventEndTime?: string;
  timezone?: string;
  eventType?: 'conference' | 'workshop' | 'meetup' | 'webinar' | 'networking' | 'social' | 'other';
  location?: string;
  locationCity?: string;
  locationCountry?: string;
  locationLat?: number;
  locationLng?: number;
  meetingUrl?: string;
  format?: 'in_person' | 'virtual' | 'hybrid';
  maxAttendees?: number;
  registrationRequired?: boolean;
  agenda?: AgendaItem[];
  dressCode?: string;
  tags?: string[];
  // Need specific
  needType?: 'funding' | 'expertise' | 'resources' | 'volunteers' | 'partnership';
  targetAmount?: number;
  currency?: string;
  neededBy?: string;
  // Space specific
  spaceDescription?: string;
  spaceCategory?: string;
  visibility?: 'public' | 'private';
  // Story specific (subtitle is shared with Event)
  subtitle?: string;
  heroImage?: string;
  storyType?: 'impact' | 'update' | 'spotlight' | 'photo_essay';
  galleryUrls?: string[];
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

    // Validate Story-specific requirements before starting submission
    if (mode === 'story') {
      if (!formData.title || !formData.title.trim()) {
        toast({ variant: 'destructive', description: 'Story title is required' });
        return;
      }
      if (formData.content.length < 400) {
        toast({ 
          variant: 'destructive', 
          description: 'Stories on DNA are meant to go deeper. Add a bit more detail (at least 400 characters).' 
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let createdPost: UniversalFeedItem | null = null;

      switch (mode) {
        case 'story': {
          const story = await createStoryPost({
            authorId: user.id,
            storyTitle: formData.title,
            storyBody: formData.content,
            storySubtitle: formData.subtitle,
            storyType: formData.storyType || 'update',
            imageUrl: formData.heroImage || formData.mediaUrl,
            galleryUrls: formData.galleryUrls,
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
            title: story.title || null,
            subtitle: story.subtitle || null,
            media_url: story.image_url || null,
            post_type: 'story',
            story_type: formData.storyType || 'update',
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
            reshare_count: 0,
            view_count: 0,
            bookmark_count: 0,
            has_liked: false,
            has_bookmarked: false,
            has_reshared: false,
            pinned_at: null,
            comments_disabled: false,
            link_url: null,
            link_title: null,
            link_description: null,
            link_metadata: null,
            original_post_id: null,
            original_author_id: null,
            original_author_username: null,
            original_author_full_name: null,
            original_author_avatar_url: null,
            original_author_headline: null,
            original_content: null,
            original_image_url: null,
            original_created_at: null,
            slug: story.slug || null,
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
            linkUrl: formData.linkUrl,
            linkTitle: formData.linkTitle,
            linkDescription: formData.linkDescription,
            linkThumbnail: formData.linkThumbnail,
            linkProviderName: formData.linkProviderName,
          });

          // Map to UniversalFeedItem so it shows up instantly
          createdPost = {
            post_id: post.post_id,
            author_id: post.author_id,
            author_username: post.author_username,
            author_display_name: post.author_full_name,
            author_avatar_url: post.author_avatar_url || null,
            content: post.content,
            title: null,
            subtitle: null,
            media_url: post.image_url || null,
            post_type: 'post',
            story_type: null,
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
            reshare_count: 0,
            view_count: 0,
            bookmark_count: 0,
            has_liked: false,
            has_bookmarked: false,
            has_reshared: false,
            pinned_at: null,
            comments_disabled: false,
            link_url: formData.linkUrl || null,
            link_title: formData.linkTitle || null,
            link_description: formData.linkDescription || null,
            link_metadata: formData.linkThumbnail ? {
              embed_type: 'video',
              provider_name: formData.linkProviderName,
              thumbnail_url: formData.linkThumbnail,
              is_video: true,
            } : null,
            original_post_id: null,
            original_author_id: null,
            original_author_username: null,
            original_author_full_name: null,
            original_author_avatar_url: null,
            original_author_headline: null,
            original_content: null,
            original_image_url: null,
            original_created_at: null,
            slug: post.slug || null,
          };
          break;
        }


        case 'event': {
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

          // Parse location into structured data (expects: "Venue, City, Country" format)
          const locationParts = (formData.location || '').split(',').map(p => p.trim());
          const isVirtual = formData.format === 'virtual';
          const isHybrid = formData.format === 'hybrid';
          const isInPerson = formData.format === 'in_person' || !formData.format;
          
          // For in-person/hybrid: extract city and country from location string
          let locationCity: string | undefined;
          let locationCountry: string | undefined;
          if ((isInPerson || isHybrid) && locationParts.length >= 2) {
            locationCountry = locationParts[locationParts.length - 1];
            locationCity = locationParts[locationParts.length - 2];
          } else if ((isInPerson || isHybrid) && locationParts.length === 1) {
            locationCity = locationParts[0];
            locationCountry = 'Unknown';
          }

          const eventPayload = {
            title: formData.title || '',
            description: formData.content,
            event_type: formData.eventType || 'meetup',
            format: formData.format || 'in_person',
            start_time: startTime,
            end_time: endTime,
            timezone: formData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            // Location fields for in-person/hybrid
            location_name: (isInPerson || isHybrid) ? formData.location : undefined,
            location_city: locationCity,
            location_country: locationCountry,
            // Meeting URL for virtual/hybrid
            meeting_url: (isVirtual || isHybrid) ? formData.meetingUrl : undefined,
            max_attendees: formData.maxAttendees,
            is_public: true,
            requires_approval: false,
            allow_guests: true,
            cover_image_url: formData.mediaUrl,
            // New structured fields
            subtitle: formData.subtitle || undefined,
            agenda: formData.agenda || [],
            dress_code: formData.dressCode || undefined,
            tags: formData.tags || [],
          };

          

          const { data: authData } = await supabase.auth.getSession();
          const response = await supabase.functions.invoke('create-event', {
            body: eventPayload,
            headers: {
              Authorization: `Bearer ${authData.session?.access_token}`,
            },
          });

          // Handle edge function errors - extract the actual error message from response
          if (response.error) {
            // Try to parse the error context for more details
            const errorContext = response.error.context;
            let errorMessage = 'Failed to create event';
            
            try {
              if (errorContext && typeof errorContext.json === 'function') {
                const errorBody = await errorContext.json();
                if (errorBody?.error) {
                  errorMessage = errorBody.error;
                }
              }
            } catch {
              // Use default message if parsing fails
            }
            
            throw new Error(errorMessage);
          }
          
          if (response.data && !response.data.success) {
            throw new Error(response.data.error || 'Failed to create event');
          }
          break;
        }

        case 'need': {
          // Map formData needType to database enum values
          const needTypeMap: Record<string, 'funding' | 'skills' | 'time' | 'access' | 'resources'> = {
            funding: 'funding',
            expertise: 'skills',
            resources: 'resources',
            volunteers: 'time',
            partnership: 'access',
          };
          const dbNeedType = needTypeMap[formData.needType || 'expertise'] || 'skills';

          const { data: needData, error: needError } = await supabase
            .from('contribution_needs')
            .insert([{
              title: formData.title || '',
              description: formData.content,
              type: dbNeedType,
              space_id: context.spaceId!,
              created_by: user.id,
              target_amount: formData.targetAmount ?? null,
              currency: formData.currency ?? null,
              needed_by: formData.neededBy ?? null,
            }])
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
        }

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
          (old: InfiniteFeedData | undefined) => {
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
          (old: InfiniteFeedData | undefined) => {
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
            (old: InfiniteFeedData | undefined) => {
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
            (old: InfiniteFeedData | undefined) => {
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

function trackComposerEvent(action: 'open' | 'cancel' | 'switch' | 'submit', mode: ComposerMode, metadata?: ComposerAnalyticsMetadata) {
  // Silent tracking - don't block UX
  try {
    supabase.from('analytics_events').insert({
      event_name: `composer_${action}`,
      event_metadata: { mode, ...metadata },
      route: window.location.pathname,
    }).then(() => {});
  } catch (err) {
    // Silently ignore analytics tracking errors
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
