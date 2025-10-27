
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProfileContent = (profileId: string | undefined) => {
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [userCommunities, setUserCommunities] = useState<any[]>([]);

  useEffect(() => {
    if (profileId) {
      fetchUserContent();
    }
  }, [profileId]);

  const fetchUserContent = async () => {
    try {
      // Fetch user's posts - use fallback approach since posts table exists but isn't in types
      try {
        const { data: posts } = await supabase
          .from('posts' as any)
          .select('*')
          .eq('user_id', profileId)
          .order('created_at', { ascending: false })
          .limit(5);
        setUserPosts(posts || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setUserPosts([]);
      }

      // Fetch user's events
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', profileId)
        .limit(5);

      // Fetch user's communities
      const { data: communities } = await supabase
        .from('communities')
        .select('*')
        .eq('created_by', profileId)
        .limit(5);

      setUserEvents(events || []);
      setUserCommunities(communities || []);
    } catch (error) {
      console.error('Error fetching user content:', error);
    }
  };

  return {
    userPosts,
    userEvents,
    userCommunities
  };
};
