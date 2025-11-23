/**
 * DNA | FEED - Feed Writer Utilities
 * 
 * Central helpers for creating feed-compatible posts from all 5C actions.
 * Every surface-worthy action (event, space, need, story, community post) 
 * creates a corresponding post that appears in the universal feed.
 */

import { supabase } from '@/integrations/supabase/client';
import type { FeedItemType, LinkedEntityType } from '@/types/feed';
import type { PostWithAuthor } from '@/types/posts';
import { logHighError } from '@/lib/errorLogger';

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
 * Create a standard text/media post and return it
 */
export async function createStandardPost(params: {
  authorId: string;
  content: string;
  mediaUrl?: string;
  privacyLevel?: 'public' | 'connections';
  spaceId?: string;
  eventId?: string;
}): Promise<PostWithAuthor> {
  const { authorId, content, mediaUrl, spaceId, eventId, privacyLevel } = params;

  try {
    // Insert the post with correct post_type value
    const insertPayload = {
      author_id: authorId,
      content: content.trim(),
      post_type: 'status', // Use 'status' to match schema default
      image_url: mediaUrl || null,
      space_id: spaceId || null,
      event_id: eventId || null,
      privacy_level: privacyLevel || 'public',
    };

    console.log('createStandardPost inserting:', insertPayload);

    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert(insertPayload)
      .select('id, author_id, content, post_type, image_url, created_at')
      .single();

    if (postError) {
      console.error('createStandardPost DB error:', postError);
      logHighError(postError, 'composer', 'createStandardPost failed', { params, insertPayload });
      throw postError;
    }

    if (!postData) {
      throw new Error('No data returned from insert');
    }

    // Fetch author profile separately
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', authorId)
      .single();

    if (profileError) {
      console.error('Failed to fetch author profile:', profileError);
    }

    // Map to PostWithAuthor shape
    const mapped: PostWithAuthor = {
      post_id: postData.id,
      author_id: postData.author_id,
      content: postData.content,
      post_type: 'text' as any,
      privacy_level: 'public',
      image_url: postData.image_url || undefined,
      created_at: postData.created_at,
      likes_count: 0,
      comments_count: 0,
      author_username: profileData?.username || '',
      author_full_name: profileData?.display_name || '',
      author_avatar_url: profileData?.avatar_url || undefined,
      user_has_liked: false,
      is_connection: false,
    };

    return mapped;
  } catch (err) {
    logHighError(err, 'composer', 'createStandardPost threw', params);
    throw err;
  }
}
