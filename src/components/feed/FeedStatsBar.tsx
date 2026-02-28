/**
 * FeedStatsBar — Horizontal profile strip with Five C's stats
 * Full-width bar: avatar + name + headline + stats inline + saved items
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bookmark, ChevronRight, Users, Calendar, Layers, BookOpen, MapPin } from 'lucide-react';

export const FeedStatsBar: React.FC = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

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

  if (!profile) return null;

  const displayName = profile.display_name || profile.username || 'Member';
  const initials = displayName.charAt(0).toUpperCase();
  const username = profile.username || '';
  const currentCity = (profile as Record<string, unknown>).current_city as string | undefined;

  const fiveCStats = [
    { icon: Users, count: stats?.connections || 0, label: 'Connections', color: 'text-dna-emerald' },
    { icon: Calendar, count: stats?.events || 0, label: 'Events', color: 'text-dna-gold' },
    { icon: Layers, count: stats?.spaces || 0, label: 'Spaces', color: 'text-dna-forest' },
    { icon: BookOpen, count: stats?.stories || 0, label: 'Posts', color: 'text-dna-convey' },
  ];

  return (
    <div className="flex items-center gap-4 bg-card/60 backdrop-blur-sm rounded-dna-xl px-4 py-2.5 border-b border-border/30">
      {/* Profile strip */}
      <div
        className="flex items-center gap-3 cursor-pointer group shrink-0"
        onClick={() => navigate(`/dna/${username}`)}
      >
        <Avatar className="h-9 w-9 ring-2 ring-[hsl(var(--dna-emerald)/0.15)] group-hover:ring-[hsl(var(--dna-emerald)/0.3)] transition-all">
          <AvatarImage src={profile.avatar_url || ''} alt={displayName} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
            {displayName}
          </p>
          {profile.headline ? (
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{profile.headline}</p>
          ) : currentCity ? (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-2.5 w-2.5" />
              {currentCity}
            </p>
          ) : null}
        </div>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-border/50 shrink-0" />

      {/* Five C's stats inline */}
      {stats && (
        <div className="flex items-center gap-5">
          {fiveCStats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-1.5">
              <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              <span className="text-sm font-semibold text-foreground">{stat.count}</span>
              <span className="text-xs text-muted-foreground hidden lg:inline">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Spacer + Saved Items */}
      <button
        className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group/saved shrink-0"
        onClick={() => navigate('/dna/feed?tab=bookmarks')}
      >
        <Bookmark className="h-3.5 w-3.5 text-dna-gold" />
        <span className="hidden sm:inline">Saved</span>
        <ChevronRight className="h-3 w-3 opacity-0 group-hover/saved:opacity-100 transition-opacity" />
      </button>
    </div>
  );
};
