import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UniversalFeedItem } from '@/types/feed';

export function usePinnedPosts(userId: string) {
  return useQuery({
    queryKey: ['pinned-posts', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          author_id,
          content,
          post_type,
          privacy_level,
          image_url,
          link_url,
          link_title,
          link_description,
          link_metadata,
          title,
          subtitle,
          created_at,
          updated_at,
          pinned_at,
          comments_disabled,
          profiles!posts_author_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('author_id', userId)
        .eq('is_deleted', false)
        .not('pinned_at', 'is', null)
        .order('pinned_at', { ascending: false });

      if (error) throw error;

      // Map to UniversalFeedItem format
      return (data || []).map((post: any): UniversalFeedItem => ({
        post_id: post.id,
        author_id: post.author_id,
        author_username: post.profiles?.username || '',
        author_display_name: post.profiles?.full_name || '',
        author_avatar_url: post.profiles?.avatar_url || null,
        content: post.content,
        title: post.title || null,
        subtitle: post.subtitle || null,
        media_url: post.image_url || null,
        post_type: post.post_type || 'post',
        privacy_level: post.privacy_level || 'public',
        linked_entity_type: null,
        linked_entity_id: null,
        space_id: null,
        space_title: null,
        event_id: null,
        event_title: null,
        created_at: post.created_at,
        updated_at: post.updated_at,
        like_count: 0,
        comment_count: 0,
        share_count: 0,
        view_count: 0,
        bookmark_count: 0,
        has_liked: false,
        has_bookmarked: false,
        pinned_at: post.pinned_at,
        comments_disabled: post.comments_disabled || false,
        link_url: post.link_url || null,
        link_title: post.link_title || null,
        link_description: post.link_description || null,
        link_metadata: post.link_metadata || null,
        original_post_id: null,
        original_author_id: null,
        original_author_username: null,
        original_author_full_name: null,
        original_author_avatar_url: null,
        original_author_headline: null,
        original_content: null,
        original_image_url: null,
        original_created_at: null,
      }));
    },
    enabled: !!userId,
  });
}
