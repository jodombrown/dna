/**
 * FeedGreeting - Contextual "Good morning" + network activity summary
 * Personalizes the feed experience
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useMobile } from '@/hooks/useMobile';

export const FeedGreeting: React.FC = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { isMobile } = useMobile();

  const { data: networkActivity } = useQuery({
    queryKey: ['feed-network-activity', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      // Get count of new posts from connections since yesterday
      const { count } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .gt('created_at', yesterday);

      return { newPosts: count || 0 };
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  // Don't show on mobile
  if (isMobile) return null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = profile?.display_name?.split(' ')[0] || profile?.username || '';

  const insightText = networkActivity?.newPosts
    ? `${networkActivity.newPosts} new post${networkActivity.newPosts === 1 ? '' : 's'} since yesterday`
    : 'See what your network is sharing';

  return (
    <div className="mb-1">
      <p className="text-base font-semibold">
        {getGreeting()}, {firstName} 👋
      </p>
      <p className="text-xs text-muted-foreground">{insightText}</p>
    </div>
  );
};
