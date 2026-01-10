/**
 * FeedProfileCard - Compact profile card for feed left sidebar
 * LinkedIn-style mini profile with quick stats and navigation
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, BookOpen, Calendar, Bookmark } from 'lucide-react';

export const FeedProfileCard: React.FC = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  // Fetch user stats
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

  return (
    <Card className="overflow-hidden">
      {/* Profile Header with gradient */}
      <div className="h-14 bg-gradient-to-r from-primary/20 to-primary/5" />
      
      <CardContent className="pt-0 -mt-7 pb-4">
        {/* Avatar */}
        <div className="flex justify-center">
          <Avatar 
            className="h-14 w-14 border-4 border-background cursor-pointer"
            onClick={() => navigate(`/dna/${profile.username}`)}
          >
            <AvatarImage src={profile.avatar_url || ''} alt={displayName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name and headline */}
        <div className="text-center mt-2">
          <h3 
            className="font-semibold text-sm cursor-pointer hover:text-primary hover:underline transition-colors"
            onClick={() => navigate(`/dna/${profile.username}`)}
          >
            {displayName}
          </h3>
          {profile.headline && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {profile.headline}
            </p>
          )}
        </div>

        <Separator className="my-3" />

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-1 text-center">
          <button 
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            onClick={() => navigate(`/dna/${profile.username}?tab=connections`)}
          >
            <Users className="h-3.5 w-3.5 mx-auto text-muted-foreground" />
            <p className="text-sm font-semibold mt-0.5">{stats?.connections || 0}</p>
            <p className="text-[10px] text-muted-foreground">Connections</p>
          </button>
          <button 
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            onClick={() => navigate(`/dna/${profile.username}?tab=activity`)}
          >
            <BookOpen className="h-3.5 w-3.5 mx-auto text-muted-foreground" />
            <p className="text-sm font-semibold mt-0.5">{stats?.posts || 0}</p>
            <p className="text-[10px] text-muted-foreground">Posts</p>
          </button>
          <button 
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            onClick={() => navigate('/dna/convene')}
          >
            <Calendar className="h-3.5 w-3.5 mx-auto text-muted-foreground" />
            <p className="text-sm font-semibold mt-0.5">{stats?.events || 0}</p>
            <p className="text-[10px] text-muted-foreground">Events</p>
          </button>
        </div>

        <Separator className="my-3" />

        {/* Quick Links */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-8 text-xs"
            onClick={() => navigate('/dna/feed?tab=bookmarks')}
          >
            <Bookmark className="h-3.5 w-3.5 mr-2" />
            Saved Items
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
