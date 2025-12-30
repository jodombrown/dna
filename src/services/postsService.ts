import { supabase } from '@/integrations/supabase/client';
import type { CreatePostInput, PostWithAuthor, PostComment, PostLiker } from '@/types/posts';
import { mentionService } from './mentionService';

/**
 * Fetch posts using the optimized RPC function
 * This handles all the complexity of joining with profiles, counting likes/comments,
 * and filtering by connections/privacy
 */
export async function fetchPosts(): Promise<PostWithAuthor[]> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || '00000000-0000-0000-0000-000000000000';

  const { data, error } = await (supabase.rpc as any)('get_universal_feed', {
    p_viewer_id: userId,
    p_tab: 'all',
    p_author_id: null,
    p_space_id: null,
    p_event_id: null,
    p_limit: 50,
    p_offset: 0,
    p_ranking_mode: 'latest',
  });

  if (error) {
    throw error;
  }

  // Map UniversalFeedItem to PostWithAuthor
  return (data || []).map((item: any) => ({
    post_id: item.post_id,
    author_id: item.author_id,
    content: item.content,
    post_type: 'text',
    created_at: item.created_at,
    author_username: item.author_username,
    author_full_name: item.author_display_name,
    author_avatar_url: item.author_avatar_url,
    likes_count: item.like_count,
    comments_count: item.comment_count,
    image_url: item.media_url,
  })) as PostWithAuthor[];
}

/**
 * Get a single post with full details
 */
export async function getPostDetails(postId: string): Promise<PostWithAuthor | null> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || '00000000-0000-0000-0000-000000000000';

  const { data, error } = await supabase.rpc('get_post_details', {
    p_post_id: postId,
    p_user_id: userId
  });

  if (error) {
    throw error;
  }

  return data as unknown as PostWithAuthor | null;
}

/**
 * Get comments for a post
 */
export async function getPostComments(postId: string): Promise<PostComment[]> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || '00000000-0000-0000-0000-000000000000';

  const { data, error } = await supabase.rpc('get_post_comments', {
    p_post_id: postId,
    p_user_id: userId
  });

  if (error) {
    throw error;
  }

  return (data || []) as PostComment[];
}

/**
 * Get users who liked a post
 */
export async function getPostLikers(postId: string): Promise<PostLiker[]> {
  const { data, error } = await supabase.rpc('get_post_likers', {
    p_post_id: postId
  });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Create a new post
 */
export async function createPost(input: CreatePostInput): Promise<{ id: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get user profile for author name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username')
    .eq('id', user.id)
    .single();

  const { data, error } = await supabase.from('posts').insert({
    author_id: user.id,
    content: input.content,
    post_type: input.post_type,
    privacy_level: input.privacy_level,
    image_url: input.image_url,
    link_url: input.link_url,
    link_title: input.link_title,
    link_description: input.link_description,
  }).select('id').single();

  if (error) {
    throw error;
  }

  // Process mentions and send notifications (async, don't block)
  if (data && input.content) {
    const authorName = profile?.full_name || profile?.username || 'Someone';
    mentionService.processMentionsForPost(
      input.content,
      data.id,
      user.id,
      authorName
    ).catch(() => {});

    // Process hashtags - extract and create/link them
    (supabase.rpc as any)('process_post_hashtags', {
      p_content: input.content,
      p_post_id: data.id,
      p_user_id: user.id
    }).catch(() => {});
  }

  return data;
}

/**
 * Like a post
 */
export async function likePost(postId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('post_likes').insert({
    post_id: postId,
    user_id: user.id,
  });

  if (error && error.code !== '23505') { // Ignore duplicate key errors
    throw error;
  }
}

/**
 * Unlike a post
 */
export async function unlikePost(postId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }
}

/**
 * Delete a post (soft delete)
 */
export async function deletePost(postId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('posts')
    .update({ is_deleted: true })
    .eq('id', postId)
    .eq('author_id', user.id);

  if (error) {
    throw error;
  }
}

/**
 * Create a comment on a post
 */
export async function createComment(postId: string, content: string): Promise<any> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get user profile for author name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username')
    .eq('id', user.id)
    .single();

  const { data, error } = await supabase
    .from('post_comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Process mentions and send notifications (async, don't block)
  if (data && content) {
    const authorName = profile?.full_name || profile?.username || 'Someone';
    mentionService.processMentionsForComment(
      content,
      data.id,
      postId,
      user.id,
      authorName
    ).catch(() => {});
  }

  return data;
}

/**
 * Update a comment
 */
export async function updateComment(commentId: string, content: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('post_comments')
    .update({ content })
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('post_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }
}
