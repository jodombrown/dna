/**
 * DNA | FEED - Feed Writer Utilities
 * 
 * Central helpers for creating feed-compatible posts from all 5C actions.
 * Every surface-worthy action (event, space, need, story, community post) 
 * creates a corresponding post that appears in the universal feed.
 */

import { supabase } from '@/integrations/supabase/client';
import type { FeedItemType, LinkedEntityType } from '@/types/feed';

interface CreateFeedPostOptions {
  authorId: string;
  postType: FeedItemType;
  content: string;
  linkedEntityType?: LinkedEntityType;
  linkedEntityId?: string;
  spaceId?: string;
  eventId?: string;
  mediaUrl?: string;
  privacyLevel?: 'public' | 'connections';
}

/**
 * Base function to create any feed post
 */
export async function createFeedPost(options: CreateFeedPostOptions) {
  const { error } = await supabase.from('posts').insert({
    author_id: options.authorId,
    post_type: options.postType,
    content: options.content,
    linked_entity_type: options.linkedEntityType || null,
    linked_entity_id: options.linkedEntityId || null,
    space_id: options.spaceId || null,
    event_id: options.eventId || null,
    image_url: options.mediaUrl || null,
    privacy_level: options.privacyLevel || 'public',
  });

  if (error) {
    console.error('Error creating feed post:', error);
    throw error;
  }
}

/**
 * Create feed post for a new event
 */
export async function createEventPost(params: {
  eventId: string;
  eventTitle: string;
  eventDescription?: string;
  authorId: string;
  spaceId?: string;
  imageUrl?: string;
}) {
  const content = `Created an event: ${params.eventTitle}`;
  
  await createFeedPost({
    authorId: params.authorId,
    postType: 'event',
    content,
    linkedEntityType: 'event',
    linkedEntityId: params.eventId,
    eventId: params.eventId,
    spaceId: params.spaceId,
    mediaUrl: params.imageUrl,
  });
}

/**
 * Create feed post for a new space/project
 */
export async function createSpacePost(params: {
  spaceId: string;
  spaceTitle: string;
  spaceDescription?: string;
  authorId: string;
  imageUrl?: string;
}) {
  const content = `Created a new space: ${params.spaceTitle}`;
  
  await createFeedPost({
    authorId: params.authorId,
    postType: 'space',
    content,
    linkedEntityType: 'space',
    linkedEntityId: params.spaceId,
    spaceId: params.spaceId,
    mediaUrl: params.imageUrl,
  });
}

/**
 * Create feed post for a contribution need or offer
 */
export async function createNeedPost(params: {
  needId: string;
  needTitle: string;
  needDescription?: string;
  needType: 'funding' | 'expertise' | 'resources' | 'volunteers' | 'partnership';
  authorId: string;
  spaceId: string;
}) {
  const typeLabel = params.needType === 'funding' ? 'funding' : 
                    params.needType === 'expertise' ? 'expertise' :
                    params.needType === 'volunteers' ? 'volunteers' :
                    params.needType === 'partnership' ? 'partnership' :
                    'resources';
  
  const content = `Looking for ${typeLabel}: ${params.needTitle}`;
  
  await createFeedPost({
    authorId: params.authorId,
    postType: 'need',
    content,
    linkedEntityType: 'need',
    linkedEntityId: params.needId,
    spaceId: params.spaceId,
  });
}

/**
 * Create feed post for a published story/article
 */
export async function createStoryPost(params: {
  storyId: string;
  storyTitle: string;
  storySubtitle?: string;
  authorId: string;
  spaceId?: string;
  eventId?: string;
  imageUrl?: string;
}) {
  const content = params.storySubtitle 
    ? `${params.storyTitle}\n${params.storySubtitle}`
    : params.storyTitle;
  
  await createFeedPost({
    authorId: params.authorId,
    postType: 'story',
    content,
    linkedEntityType: 'story',
    linkedEntityId: params.storyId,
    spaceId: params.spaceId,
    eventId: params.eventId,
    mediaUrl: params.imageUrl,
  });
}

/**
 * Create feed post for a community post
 * (Bridges community_posts into the universal feed)
 */
export async function createCommunityFeedPost(params: {
  communityPostId: string;
  content: string;
  authorId: string;
  communityId: string;
  mediaUrl?: string;
}) {
  await createFeedPost({
    authorId: params.authorId,
    postType: 'community_post',
    content: params.content,
    linkedEntityType: 'community_post',
    linkedEntityId: params.communityPostId,
    spaceId: params.communityId, // Communities map to space_id context
    mediaUrl: params.mediaUrl,
  });
}

/**
 * Create a reshare post
 */
export async function createResharePost(params: {
  originalPostId: string;
  authorId: string;
  commentary?: string;
}) {
  const content = params.commentary || '';
  
  await createFeedPost({
    authorId: params.authorId,
    postType: 'reshare',
    content,
    linkedEntityType: null, // Reshares reference posts, not external entities
    linkedEntityId: params.originalPostId,
  });
}

/**
 * Create a standard text/media post
 */
export async function createStandardPost(params: {
  authorId: string;
  content: string;
  mediaUrl?: string;
  privacyLevel?: 'public' | 'connections';
  spaceId?: string;
  eventId?: string;
}) {
  await createFeedPost({
    authorId: params.authorId,
    postType: 'post',
    content: params.content,
    mediaUrl: params.mediaUrl,
    privacyLevel: params.privacyLevel,
    spaceId: params.spaceId,
    eventId: params.eventId,
  });
}
