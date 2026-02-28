/**
 * FeedProfileCard - Warm, heritage-infused profile card for feed left sidebar
 * DNA-branded with Kente-inspired accents, not a LinkedIn clone
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bookmark, ChevronRight } from 'lucide-react';

export const FeedProfileCard: React.FC = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['profile-quick-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { connections: 0, posts: 0, events: 0 };

      const [connectionsRes, postsRes, eventsRes] = await Promise.all([
        supabase
          .from('connections')
          .select('id', { count: 'exact', head: true })
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .eq('status', 'accepted'),
        supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', user.id),
        supabase
          .from('event_attendees')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ]);

      return {
        connections: connectionsRes.count || 0,
        posts: postsRes.count || 0,
        events: eventsRes.count || 0,
      };
    },
    enabled: !!user?.id,
  });

  if (!profile) return null;

  const displayName = profile.display_name || profile.username || 'Member';
  const initials = displayName.charAt(0).toUpperCase();
  const username = profile.username || '';

  return (
    <Card className="overflow-hidden border-0 shadow-sm bg-card">
      {/* Heritage-inspired header band */}
      <div className="h-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--dna-emerald))] via-[hsl(var(--dna-emerald)/0.7)] to-[hsl(var(--dna-gold)/0.6)]" />
        {/* Subtle Kente-inspired pattern overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 120 48" preserveAspectRatio="none">
          <pattern id="kente-feed" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="12" height="12" fill="white" />
            <rect x="12" y="12" width="12" height="12" fill="white" />
          </pattern>
          <rect width="120" height="48" fill="url(#kente-feed)" />
        </svg>
      </div>

      <div className="px-3 pb-3 -mt-8">
        {/* Avatar */}
        <div className="flex justify-center">
          <Avatar
            className="h-16 w-16 border-[3px] border-card cursor-pointer ring-2 ring-[hsl(var(--dna-emerald)/0.3)] hover:ring-[hsl(var(--dna-emerald)/0.6)] transition-all"
            onClick={() => navigate(`/dna/${username}`)}
          >
            <AvatarImage src={profile.avatar_url || ''} alt={displayName} />
            <AvatarFallback className="bg-[hsl(var(--dna-emerald))] text-white text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name and headline */}
        <div className="text-center mt-2.5">
          <h3
            className="font-semibold text-sm cursor-pointer hover:text-[hsl(var(--dna-emerald))] transition-colors"
            onClick={() => navigate(`/dna/${username}`)}
          >
            {displayName}
          </h3>
          {profile.headline && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
              {profile.headline}
            </p>
          )}
        </div>

        {/* Stats as warm pill badges */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted transition-colors text-xs"
            onClick={() => navigate(`/dna/${username}?tab=connections`)}
          >
            <span className="font-bold text-foreground">{stats?.connections || 0}</span>
            <span className="text-muted-foreground">connections</span>
          </button>
          <button
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted transition-colors text-xs"
            onClick={() => navigate(`/dna/${username}?tab=activity`)}
          >
            <span className="font-bold text-foreground">{stats?.posts || 0}</span>
            <span className="text-muted-foreground">posts</span>
          </button>
        </div>

        {/* Saved Items link */}
        <button
          className="w-full flex items-center justify-between mt-3 px-2 py-1.5 rounded-md hover:bg-muted/60 transition-colors text-xs text-muted-foreground group"
          onClick={() => navigate('/dna/feed?tab=bookmarks')}
        >
          <span className="flex items-center gap-1.5">
            <Bookmark className="h-3.5 w-3.5" />
            Saved Items
          </span>
          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </Card>
  );
};
