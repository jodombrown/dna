/**
 * FeedStatsBar — Compact 2x2 grid of Five C's stats for the left rail
 */

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, Calendar, Layers, BookOpen } from 'lucide-react';

export const FeedStatsBar: React.FC = () => {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['feed-five-c-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [connections, events, spaces, posts] = await Promise.all([
        supabase.from('connections').select('id', { count: 'exact', head: true }).or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`).eq('status', 'accepted'),
        supabase.from('event_attendees').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('collaboration_memberships').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', user.id),
      ]);

      return {
        connections: connections.count || 0,
        events: events.count || 0,
        spaces: spaces.count || 0,
        stories: posts.count || 0,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  if (!stats) return null;

  const items = [
    { icon: Users, count: stats.connections, label: 'Connections', color: 'text-dna-emerald' },
    { icon: Calendar, count: stats.events, label: 'Events', color: 'text-dna-gold' },
    { icon: Layers, count: stats.spaces, label: 'Spaces', color: 'text-dna-forest' },
    { icon: BookOpen, count: stats.stories, label: 'Posts', color: 'text-dna-convey' },
  ];

  return (
    <div className="bg-card rounded-dna-xl border border-border/40 p-3">
      <div className="grid grid-cols-2 gap-2">
        {items.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2 rounded-dna-lg bg-muted/30 px-3 py-2">
            <stat.icon className={`h-4 w-4 ${stat.color} shrink-0`} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-none">{stat.count}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
