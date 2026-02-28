/**
 * LiveActivityTicker — Real-time community pulse for right sidebar
 * Shows recent platform activity to make DNA feel alive
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Calendar, PenSquare, Layers } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'connection' | 'event' | 'post' | 'space';
  actor_name: string;
  actor_avatar: string | null;
  description: string;
  created_at: string;
}

export const LiveActivityTicker: React.FC = () => {
  const navigate = useNavigate();

  const { data: activities } = useQuery({
    queryKey: ['live-activity-ticker'],
    queryFn: async (): Promise<ActivityItem[]> => {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      // Get recent posts with author info
      const { data: recentPosts } = await supabase
        .from('posts')
        .select('id, created_at, author_id, profiles!posts_author_id_fkey(display_name, avatar_url)')
        .gte('created_at', dayAgo)
        .order('created_at', { ascending: false })
        .limit(6);

      if (!recentPosts) return [];

      return recentPosts.map((post) => {
        const profile = post.profiles as unknown as { display_name: string | null; avatar_url: string | null } | null;
        return {
          id: post.id,
          type: 'post' as const,
          actor_name: profile?.display_name || 'Someone',
          actor_avatar: profile?.avatar_url || null,
          description: 'shared a new post',
          created_at: post.created_at,
        };
      });
    },
    refetchInterval: 2 * 60 * 1000,
    staleTime: 60 * 1000,
  });

  if (!activities || activities.length === 0) return null;

  const iconMap = {
    connection: UserPlus,
    event: Calendar,
    post: PenSquare,
    space: Layers,
  };

  const colorMap = {
    connection: 'text-dna-emerald',
    event: 'text-dna-gold',
    post: 'text-dna-convey',
    space: 'text-dna-forest',
  };

  return (
    <div className="bg-card rounded-dna-xl shadow-dna-1 overflow-hidden">
      <div className="px-3.5 pt-3.5 pb-2">
        <h3 className="font-heritage text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dna-emerald opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-dna-emerald" />
          </span>
          Community Pulse
        </h3>
      </div>

      <div className="px-2 pb-2 space-y-0.5">
        {activities.slice(0, 5).map((activity) => {
          const Icon = iconMap[activity.type];
          return (
            <div
              key={activity.id}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage src={activity.actor_avatar || ''} />
                <AvatarFallback className="text-[10px] bg-muted">
                  {activity.actor_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-snug">
                  <span className="font-medium">{activity.actor_name.split(' ')[0]}</span>
                  {' '}
                  <span className="text-muted-foreground">{activity.description}</span>
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: false })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
