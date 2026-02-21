import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BookmarkedPost {
  id: string;
  post_id: string;
  created_at: string;
  pinned_at?: string | null;
  folder?: string;
  // Post data
  post?: {
    content: string;
    post_type: string;
    created_at: string;
    image_url?: string;
    // Author data
    author?: {
      id: string;
      full_name: string;
      username: string;
      avatar_url?: string;
      headline?: string;
    };
  };
}

export function useUserBookmarks(userId?: string) {
  return useQuery({
    queryKey: ['user-bookmarks', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('post_bookmarks')
        .select(`
          id,
          post_id,
          created_at,
          pinned_at,
          folder,
          posts:post_id (
            id,
            content,
            post_type,
            created_at,
            image_url,
            author_id,
            profiles:author_id (
              id,
              full_name,
              username,
              avatar_url,
              headline
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data structure
      return (data || []).map((bookmark) => ({
        id: bookmark.id,
        post_id: bookmark.post_id,
        created_at: bookmark.created_at,
        pinned_at: bookmark.pinned_at,
        folder: bookmark.folder,
        post: bookmark.posts ? {
          ...(bookmark.posts as any),
          author: (bookmark.posts as any).profiles,
        } : undefined,
      })) as BookmarkedPost[];
    },
    enabled: !!userId,
  });
}
