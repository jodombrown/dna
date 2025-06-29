
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Database } from '@/integrations/supabase/types';

type ContentFlag = Database['public']['Tables']['content_flags']['Row'];
type FlagType = Database['public']['Enums']['flag_type'];
type ModerationStatus = Database['public']['Enums']['moderation_status'];

export const useContentFlags = () => {
  const [flags, setFlags] = useState<ContentFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { hasAnyRole } = useAdminAuth();

  const canModerate = hasAnyRole(['super_admin', 'content_moderator']);

  const fetchFlags = async () => {
    if (!canModerate) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_flags')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFlags(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching content flags:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createFlag = async (
    contentType: string,
    contentId: string,
    flagType: FlagType,
    reason?: string
  ) => {
    try {
      const { error } = await supabase
        .from('content_flags')
        .insert({
          content_type: contentType,
          content_id: contentId,
          flag_type: flagType,
          reason: reason || null,
          flagged_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
      await fetchFlags();
      return { success: true };
    } catch (err: any) {
      console.error('Error creating flag:', err);
      return { success: false, error: err.message };
    }
  };

  const resolveFlag = async (
    flagId: string,
    status: ModerationStatus,
    moderatorNotes?: string
  ) => {
    if (!canModerate) return { success: false, error: 'Insufficient permissions' };

    try {
      const { error } = await supabase
        .from('content_flags')
        .update({
          status,
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id,
          moderator_notes: moderatorNotes || null
        })
        .eq('id', flagId);

      if (error) throw error;
      await fetchFlags();
      return { success: true };
    } catch (err: any) {
      console.error('Error resolving flag:', err);
      return { success: false, error: err.message };
    }
  };

  const moderatePost = async (
    postId: string,
    action: ModerationStatus,
    moderatorNotes?: string
  ) => {
    if (!canModerate) return { success: false, error: 'Insufficient permissions' };

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          moderation_status: action,
          moderated_at: new Date().toISOString(),
          moderated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', postId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error moderating post:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchFlags();
  }, [canModerate]);

  return {
    flags,
    loading,
    error,
    canModerate,
    createFlag,
    resolveFlag,
    moderatePost,
    refetch: fetchFlags
  };
};
