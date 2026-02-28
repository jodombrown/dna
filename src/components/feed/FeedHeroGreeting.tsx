/**
 * FeedHeroGreeting — Compact inline greeting bar
 * Single row: greeting + pulse text on left, quick-action chips on right
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { PenSquare, Calendar, BookOpen, Sparkles } from 'lucide-react';

interface FeedHeroGreetingProps {
  onComposerOpen: (mode: string) => void;
}

export const FeedHeroGreeting: React.FC<FeedHeroGreetingProps> = ({ onComposerOpen }) => {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const { data: pulse } = useQuery({
    queryKey: ['feed-platform-pulse'],
    queryFn: async () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [eventsRes, connectionsRes, postsRes] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact', head: true }).gte('start_time', new Date().toISOString()).eq('is_published', true),
        supabase.from('connections').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo).eq('status', 'accepted'),
        supabase.from('posts').select('id', { count: 'exact', head: true }).gte('created_at', dayAgo),
      ]);

      return {
        upcomingEvents: eventsRes.count || 0,
        newConnections: connectionsRes.count || 0,
        newPosts: postsRes.count || 0,
      };
    },
    staleTime: 10 * 60 * 1000,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = profile?.display_name?.split(' ')[0] || profile?.username || '';

  const quickActions = [
    { label: 'Post', icon: PenSquare, mode: 'post' },
    { label: 'Event', icon: Calendar, mode: 'event' },
    { label: 'Story', icon: BookOpen, mode: 'story' },
  ];

  const pulseItems: string[] = [];
  if (pulse?.upcomingEvents) pulseItems.push(`${pulse.upcomingEvents} events`);
  if (pulse?.newConnections) pulseItems.push(`${pulse.newConnections} connections this week`);
  if (pulse?.newPosts) pulseItems.push(`${pulse.newPosts} posts today`);

  return (
    <div className="flex items-center justify-between gap-4 rounded-dna-lg bg-[hsl(var(--dna-cream))] px-5 py-3">
      {/* Left: greeting + pulse */}
      <div className="flex items-center gap-3 min-w-0">
        <h2 className="font-heritage text-lg font-semibold text-foreground whitespace-nowrap">
          {getGreeting()}, {firstName} 👋
        </h2>
        {pulseItems.length > 0 && (
          <span className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-dna-gold shrink-0" />
            <span className="truncate">{pulseItems.join(' · ')}</span>
          </span>
        )}
      </div>

      {/* Right: quick actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {quickActions.map((action) => (
          <button
            key={action.mode}
            onClick={() => onComposerOpen(action.mode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-card border border-border/60 text-foreground hover:border-primary/40 hover:shadow-dna-1 transition-all duration-200"
          >
            <action.icon className="h-3.5 w-3.5 text-muted-foreground" />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};
