/**
 * ContentConnectionSuggestions - Shows users who write about similar topics
 *
 * Displays connection recommendations based on content engagement patterns,
 * shared focus areas, and story topics.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, UserPlus, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { connectionService } from '@/services/connectionService';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface ContentConnectionSuggestionsProps {
  storyId: string;
  userId: string;
  focusAreas?: string[];
  limit?: number;
  className?: string;
}

interface SuggestedWriter {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  headline: string | null;
  story_count: number;
  shared_topics: string[];
}

/**
 * Get content-based connection suggestions
 * Finds users who write about similar topics based on story tags/focus areas
 */
async function getContentBasedConnectionSuggestions(
  storyId: string,
  userId: string,
  focusAreas: string[],
  limit: number
): Promise<SuggestedWriter[]> {
  // First, get the story to find its author (to exclude)
  const { data: story } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', storyId)
    .single();

  const authorIdToExclude = story?.author_id;

  // Get existing connections to exclude
  const { data: connections } = await supabase.rpc('get_user_connections', {
    user_id: userId,
    search_query: null,
    limit_count: 100,
    offset_count: 0,
  });

  const connectedUserIds = (connections || []).map((c: any) => c.id);
  const excludeIds = [userId, authorIdToExclude, ...connectedUserIds].filter(Boolean);

  // If we have focus areas, find writers who share these interests
  if (focusAreas && focusAreas.length > 0) {
    // Get users who have written stories with similar focus areas
    const { data: relatedAuthors, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        avatar_url,
        headline,
        focus_areas
      `)
      .overlaps('focus_areas', focusAreas)
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .limit(limit * 2);

    if (error) {
      return [];
    }

    // Get story counts for these authors
    const authorIds = (relatedAuthors || []).map(a => a.id);
    if (authorIds.length === 0) return [];

    const { data: storyCounts } = await supabase
      .from('posts')
      .select('author_id')
      .in('author_id', authorIds)
      .eq('post_type', 'story');

    const storyCountMap = new Map<string, number>();
    (storyCounts || []).forEach((post: any) => {
      storyCountMap.set(post.author_id, (storyCountMap.get(post.author_id) || 0) + 1);
    });

    // Map to SuggestedWriter format
    const suggestions: SuggestedWriter[] = (relatedAuthors || [])
      .filter(author => author.username) // Only include users with usernames
      .map(author => ({
        id: author.id,
        username: author.username,
        full_name: author.full_name || 'DNA Member',
        avatar_url: author.avatar_url,
        headline: author.headline,
        story_count: storyCountMap.get(author.id) || 0,
        shared_topics: (author.focus_areas || []).filter((area: string) =>
          focusAreas.includes(area)
        ).slice(0, 2),
      }))
      .sort((a, b) => b.story_count - a.story_count)
      .slice(0, limit);

    return suggestions;
  }

  // Fallback: Get active story writers from the platform
  const { data: activeWriters, error } = await supabase
    .from('posts')
    .select(`
      author_id,
      profiles:author_id (
        id,
        username,
        full_name,
        avatar_url,
        headline
      )
    `)
    .eq('post_type', 'story')
    .not('author_id', 'in', `(${excludeIds.join(',')})`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return [];
  }

  // Count stories per author and dedupe
  const authorMap = new Map<string, { profile: any; count: number }>();
  (activeWriters || []).forEach((post: any) => {
    if (post.profiles && post.profiles.username) {
      const existing = authorMap.get(post.author_id);
      if (existing) {
        existing.count++;
      } else {
        authorMap.set(post.author_id, { profile: post.profiles, count: 1 });
      }
    }
  });

  // Convert to suggestions
  const suggestions: SuggestedWriter[] = Array.from(authorMap.entries())
    .map(([id, { profile, count }]) => ({
      id,
      username: profile.username,
      full_name: profile.full_name || 'DNA Member',
      avatar_url: profile.avatar_url,
      headline: profile.headline,
      story_count: count,
      shared_topics: [],
    }))
    .sort((a, b) => b.story_count - a.story_count)
    .slice(0, limit);

  return suggestions;
}

export function ContentConnectionSuggestions({
  storyId,
  userId,
  focusAreas = [],
  limit = 5,
  className,
}: ContentConnectionSuggestionsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sendingTo, setSendingTo] = React.useState<string | null>(null);

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['content-connection-suggestions', storyId, userId, focusAreas],
    queryFn: () => getContentBasedConnectionSuggestions(storyId, userId, focusAreas, limit),
    enabled: !!storyId && !!userId,
    staleTime: 60000, // Cache for 1 minute
  });

  const handleConnect = async (writer: SuggestedWriter) => {
    setSendingTo(writer.id);
    try {
      await connectionService.sendConnectionRequest(
        writer.id,
        `Hi ${writer.full_name}, I enjoyed reading content on similar topics and would love to connect!`
      );
      queryClient.invalidateQueries({ queryKey: ['connection-status', writer.id] });
      queryClient.invalidateQueries({ queryKey: ['content-connection-suggestions'] });
      toast({
        title: 'Connection request sent',
        description: `Request sent to ${writer.full_name}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send connection request',
        variant: 'destructive',
      });
    } finally {
      setSendingTo(null);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DN';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary" />
            Writers You Might Like
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-24 mb-1" />
                  <div className="h-3 bg-muted rounded w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Writers You Might Like
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dna/connect/discover')}
            className="text-xs h-7 text-muted-foreground hover:text-primary"
          >
            View All
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((writer) => (
          <div
            key={writer.id}
            className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Avatar
              className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
              onClick={() => navigate(`/dna/${writer.username}`)}
            >
              <AvatarImage src={writer.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(writer.full_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h4
                className="font-medium text-sm cursor-pointer hover:text-primary hover:underline transition-colors truncate"
                onClick={() => navigate(`/dna/${writer.username}`)}
              >
                {writer.full_name}
              </h4>
              {writer.headline && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {writer.headline}
                </p>
              )}
              <div className="flex flex-wrap gap-1 mt-1">
                {writer.shared_topics.length > 0 ? (
                  writer.shared_topics.map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {topic}
                    </Badge>
                  ))
                ) : writer.story_count > 0 ? (
                  <span className="text-xs text-muted-foreground">
                    {writer.story_count} {writer.story_count === 1 ? 'story' : 'stories'}
                  </span>
                ) : null}
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs shrink-0"
              onClick={() => handleConnect(writer)}
              disabled={sendingTo === writer.id}
            >
              {sendingTo === writer.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-3 w-3 mr-1" />
                  Connect
                </>
              )}
            </Button>
          </div>
        ))}

        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Based on shared interests and content
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
