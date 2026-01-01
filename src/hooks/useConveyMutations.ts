import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { ConveyItemType } from '@/types/conveyTypes';
import { useToast } from '@/hooks/use-toast';

interface CreateConveyItemData {
  type: ConveyItemType;
  title: string;
  subtitle?: string;
  body: string;
  visibility?: 'public' | 'members_only';
  status?: 'draft' | 'published';
  space_id?: string;
  event_id?: string;
  image_url?: string;
  gallery_urls?: string[];
  story_type?: string;
}

interface UpdateConveyItemData extends Partial<CreateConveyItemData> {
  id: string;
}

/**
 * Creates a new story/update/impact post in the posts table.
 * This is the primary way to create CONVEY content.
 */
export function useCreateConveyItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateConveyItemData) => {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Generate slug from title
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);

      // Add timestamp for uniqueness
      const uniqueSlug = `${slug}-${Date.now().toString(36)}`;

      const postData = {
        author_id: user.user.id,
        title: data.title,
        subtitle: data.subtitle || null,
        content: data.body,
        post_type: data.type, // 'story', 'update', or 'impact'
        story_type: data.story_type || 'update',
        privacy_level: data.visibility === 'members_only' ? 'connections' : 'public',
        space_id: data.space_id || null,
        event_id: data.event_id || null,
        image_url: data.image_url || null,
        gallery_urls: data.gallery_urls || null,
        slug: uniqueSlug,
        is_deleted: false,
      };

      const { data: post, error } = await supabaseClient
        .from('posts')
        .insert(postData)
        .select(`
          id,
          slug,
          title,
          subtitle,
          content,
          post_type,
          story_type,
          privacy_level,
          space_id,
          event_id,
          created_at,
          author_id
        `)
        .single();

      if (error) throw error;

      // Return in a format compatible with existing consumers
      return {
        ...post,
        type: post.post_type,
        body: post.content,
        status: 'published',
        published_at: post.created_at,
        primary_space_id: post.space_id,
        primary_event_id: post.event_id,
      };
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['convey-feed'] });
      queryClient.invalidateQueries({ queryKey: ['space-convey-items'] });
      queryClient.invalidateQueries({ queryKey: ['event-convey-items'] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });

      toast({
        title: 'Story published',
        description: 'Your story is now live.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create story.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Updates an existing story/update/impact post in the posts table.
 */
export function useUpdateConveyItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateConveyItemData) => {
      const updateData: Record<string, any> = {};

      // Map fields to posts table column names
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.subtitle !== undefined) updateData.subtitle = updates.subtitle;
      if (updates.body !== undefined) updateData.content = updates.body;
      if (updates.type !== undefined) updateData.post_type = updates.type;
      if (updates.visibility !== undefined) {
        updateData.privacy_level = updates.visibility === 'members_only' ? 'connections' : 'public';
      }
      if (updates.space_id !== undefined) updateData.space_id = updates.space_id;
      if (updates.event_id !== undefined) updateData.event_id = updates.event_id;
      if (updates.image_url !== undefined) updateData.image_url = updates.image_url;
      if (updates.gallery_urls !== undefined) updateData.gallery_urls = updates.gallery_urls;
      if (updates.story_type !== undefined) updateData.story_type = updates.story_type;

      const { data, error } = await supabaseClient
        .from('posts')
        .update(updateData)
        .eq('id', id)
        .select(`
          id,
          slug,
          title,
          subtitle,
          content,
          post_type,
          story_type,
          privacy_level,
          space_id,
          event_id,
          created_at,
          author_id
        `)
        .single();

      if (error) throw error;

      // Return in a format compatible with existing consumers
      return {
        ...data,
        type: data.post_type,
        body: data.content,
        status: 'published',
        published_at: data.created_at,
        primary_space_id: data.space_id,
        primary_event_id: data.event_id,
      };
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['convey-feed'] });
      queryClient.invalidateQueries({ queryKey: ['space-convey-items'] });
      queryClient.invalidateQueries({ queryKey: ['event-convey-items'] });
      queryClient.invalidateQueries({ queryKey: ['convey-item', item.slug] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });

      toast({
        title: 'Story updated',
        description: 'Your changes have been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update story.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Checks for an existing draft impact story for a specific space/need combination.
 * Note: Drafts are not currently supported in the posts-based architecture,
 * so this now checks for any existing impact stories.
 */
export function useCheckExistingImpactDraft() {
  return useMutation({
    mutationFn: async ({ spaceId, needId }: { spaceId: string; needId: string }) => {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Check for existing impact stories linked to this space
      // Note: Posts table doesn't have need_id, so we check by space_id only
      const { data, error } = await supabaseClient
        .from('posts')
        .select('id, slug')
        .eq('post_type', 'impact')
        .eq('space_id', spaceId)
        .eq('author_id', user.user.id)
        .eq('is_deleted', false)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}
