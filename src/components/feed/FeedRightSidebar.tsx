/**
 * FeedRightSidebar - Right column for feed page
 * Contains trending topics, suggested connections, and promotional content
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, UserPlus, Sparkles, ExternalLink } from 'lucide-react';

export const FeedRightSidebar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch suggested people
  const { data: suggestedPeople } = useQuery({
    queryKey: ['feed-suggested-people', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url, headline')
        .neq('id', user.id)
        .limit(4);
      
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch trending topics (mock for now, can be enhanced)
  const trendingTopics = [
    { tag: 'AfricaTech2025', posts: 234 },
    { tag: 'DiasporaInvesting', posts: 189 },
    { tag: 'RemittanceReform', posts: 156 },
    { tag: 'PanAfricanTrade', posts: 142 },
    { tag: 'AfricanStartups', posts: 128 },
  ];

  return (
    <div className="space-y-4">
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

      {/* Trending Topics */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Trending in DNA
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="space-y-2.5">
            {trendingTopics.map((topic, index) => (
              <button
                key={topic.tag}
                className="w-full text-left hover:bg-muted rounded-md p-1.5 -mx-1.5 transition-colors"
                onClick={() => navigate(`/dna/feed?search=${topic.tag}`)}
              >
                <p className="text-sm font-medium text-primary">#{topic.tag}</p>
                <p className="text-xs text-muted-foreground">{topic.posts} posts</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

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
