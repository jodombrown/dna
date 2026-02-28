/**
 * FeedRightSidebar - Right column for feed page
 * Contains real trending hashtags, suggested connections, happening now, and DIA promo
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Sparkles, ExternalLink, TrendingUp } from 'lucide-react';
import { TrendingHashtags } from '@/components/feed/TrendingHashtags';
import { FeedHappeningNow } from '@/components/feed/FeedHappeningNow';

export const FeedRightSidebar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch suggested people, excluding existing connections
  const { data: suggestedPeople } = useQuery({
    queryKey: ['feed-suggested-people', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get existing connection user IDs to exclude
      const { data: connections } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .in('status', ['accepted', 'pending']);

      const connectedIds = new Set<string>();
      connectedIds.add(user.id);
      if (connections) {
        for (const c of connections) {
          connectedIds.add(c.requester_id);
          connectedIds.add(c.recipient_id);
        }
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url, headline')
        .not('id', 'in', `(${[...connectedIds].join(',')})`)
        .limit(4);

      return data || [];
    },
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-4">
      {/* Happening Now - live/imminent events */}
      <FeedHappeningNow />

      {/* Suggested People */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            People to Connect
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {suggestedPeople && suggestedPeople.length > 0 ? (
            <div className="space-y-3">
              {suggestedPeople.map((person) => (
                <div key={person.id} className="flex items-start gap-2.5">
                  <Avatar
                    className="h-9 w-9 cursor-pointer shrink-0"
                    onClick={() => navigate(`/dna/${person.username || person.id}`)}
                  >
                    <AvatarImage src={person.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {(person.display_name || person.username || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate cursor-pointer hover:text-primary hover:underline"
                      onClick={() => navigate(`/dna/${person.username || person.id}`)}
                    >
                      {person.display_name || person.username}
                    </p>
                    {person.headline && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {person.headline}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => navigate('/dna/connect')}
              >
                View More
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              No suggestions yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Trending - Real data from get_trending_hashtags RPC */}
      <TrendingHashtags
        limit={5}
        showHeader={false}
        onHashtagClick={(tag) => navigate(`/dna/feed?search=${tag}`)}
      />

      {/* Trending fallback when RPC returns empty */}
      <TrendingFallback />

      {/* DIA Promo Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Ask DIA</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Get AI-powered insights about Africa and the diaspora
              </p>
              <Button
                size="sm"
                variant="link"
                className="h-auto p-0 mt-1.5 text-xs"
                onClick={() => navigate('/dna/dia')}
              >
                Try it now
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Links */}
      <div className="text-xs text-muted-foreground px-1">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <a href="/about" className="hover:underline">About</a>
          <span>·</span>
          <a href="/privacy" className="hover:underline">Privacy</a>
          <span>·</span>
          <a href="/terms" className="hover:underline">Terms</a>
          <span>·</span>
          <a href="/help" className="hover:underline">Help</a>
        </div>
        <p className="mt-2">DNA © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

/**
 * Fallback when TrendingHashtags returns nothing (alpha stage)
 */
const TrendingFallback: React.FC = () => {
  const { data: trending } = useQuery({
    queryKey: ['trending-hashtags-check'],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_trending_hashtags', {
        p_limit: 1,
        p_days: 7,
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // If real trending data exists, TrendingHashtags component renders it
  if (trending && (trending as unknown[]).length > 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Trending in DNA
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <p className="text-sm text-muted-foreground text-center py-3">
          Trending topics coming soon — start posting to kick things off! 🚀
        </p>
      </CardContent>
    </Card>
  );
};
