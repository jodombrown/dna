import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Sparkles, Users, Calendar, FolderKanban, Hash, ExternalLink, Loader2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface DiaResponse {
  success: boolean;
  data: {
    answer: string;
    citations: string[];
    network_matches: {
      profiles: Array<{
        id: string;
        full_name: string;
        headline: string;
        avatar_url: string;
        relevance: string;
      }>;
      events: Array<{
        id: string;
        title: string;
        start_date: string;
        relevance: string;
      }>;
      projects: Array<{
        id: string;
        name: string;
        status: string;
        relevance: string;
      }>;
      hashtags: Array<{
        id: string;
        name: string;
        post_count: number;
      }>;
    };
    cached: boolean;
  };
  usage: {
    queries_used: number;
    queries_limit: number;
    queries_remaining: number;
  };
  response_time_ms: number;
  error?: string;
  message?: string;
  limit?: number;
  used?: number;
  resets_at?: string;
}

interface DiaSearchProps {
  source?: string;
  placeholder?: string;
  compact?: boolean;
  suggestions?: string[];
  initialQuery?: string;
  autoSearch?: boolean;
}

export function DiaSearch({
  source = 'dashboard',
  placeholder = 'Ask DIA about African opportunities, markets, or trends...',
  compact = false,
  suggestions,
  initialQuery = '',
  autoSearch = false
}: DiaSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const hasAutoSearched = React.useRef(false);

  // Update query when initialQuery changes
  React.useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);
  const [response, setResponse] = useState<DiaResponse | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ limit: number; used: number; resets_at: string } | null>(null);

  // Auto-search when triggered from history or insights
  React.useEffect(() => {
    if (autoSearch && initialQuery && !hasAutoSearched.current && !rateLimited) {
      hasAutoSearched.current = true;
      searchMutation.mutate(initialQuery);
    }
  }, [autoSearch, initialQuery, rateLimited]);

  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await supabase.functions.invoke('dia-search', {
        body: { query: searchQuery, source },
      });

      if (res.error) {
        // Handle structured errors from edge function
        if (res.error.message) {
          try {
            const errorData = JSON.parse(res.error.message);
            throw errorData;
          } catch {
            throw res.error;
          }
        }
        throw res.error;
      }

      // Check for rate limit in response
      if (res.data?.error === 'Monthly query limit reached') {
        setRateLimited(true);
        setRateLimitInfo({
          limit: res.data.limit,
          used: res.data.used,
          resets_at: res.data.resets_at
        });
        throw new Error('Monthly query limit reached');
      }

      return res.data as DiaResponse;
    },
    onSuccess: (data) => {
      setResponse(data);
      setRateLimited(false);
      if (data.data.cached) {
        toast.info('Retrieved from cache', { duration: 2000 });
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.error || 'Search failed';

      if (errorMessage.includes('Monthly query limit') || errorMessage.includes('limit reached')) {
        setRateLimited(true);
        toast.error("Monthly Query Limit Reached", {
          description: "You've used all your DIA queries this month."
        });
      } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('Not authenticated')) {
        toast.error('Please sign in to use DIA');
      } else if (errorMessage.includes('Query too long')) {
        toast.error('Query too long', {
          description: 'Maximum 500 characters allowed'
        });
      } else {
        toast.error('Search failed', {
          description: 'Please try again.'
        });
      }
      console.error('DIA search error:', error);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery && !rateLimited) {
      searchMutation.mutate(trimmedQuery);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (rateLimited) return;
    setQuery(suggestion);
    searchMutation.mutate(suggestion);
  };

  const handleProfileClick = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/spaces/${projectId}`);
  };

  const handleHashtagClick = (hashtagName: string) => {
    navigate(`/explore?hashtag=${encodeURIComponent(hashtagName)}`);
  };

  const hasNetworkMatches = response?.data?.network_matches && (
    response.data.network_matches.profiles.length > 0 ||
    response.data.network_matches.events.length > 0 ||
    response.data.network_matches.projects.length > 0 ||
    response.data.network_matches.hashtags.length > 0
  );

  const isInputDisabled = searchMutation.isPending || rateLimited;

  return (
    <div className={`w-full ${compact ? 'max-w-xl' : 'max-w-4xl'} mx-auto px-1 sm:px-0`}>
      {/* Rate Limit Banner */}
      {rateLimited && (
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-amber-800">Monthly Query Limit Reached</p>
              <p className="text-sm text-amber-700">
                You've used all {rateLimitInfo?.limit || 10} DIA queries this month.
                {rateLimitInfo?.resets_at && (
                  <> Resets on {new Date(rateLimitInfo.resets_at).toLocaleDateString()}.</>
                )}
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100 w-full sm:w-auto">
              Upgrade
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <div className="relative flex-1">
            <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
            </div>
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={compact ? "Ask DIA..." : placeholder}
              className="pl-10 sm:pl-12 pr-4 sm:pr-28 py-4 sm:py-6 text-base sm:text-lg rounded-xl border-2 border-border focus:border-emerald-500 transition-colors bg-background w-full"
              disabled={isInputDisabled}
              maxLength={500}
            />
            {/* Desktop button inside input */}
            <Button
              type="submit"
              disabled={!query.trim() || isInputDisabled}
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700"
            >
              {searchMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2">Ask DIA</span>
            </Button>
          </div>
          {/* Mobile button below input */}
          <Button
            type="submit"
            disabled={!query.trim() || isInputDisabled}
            className="sm:hidden w-full bg-emerald-600 hover:bg-emerald-700 py-3"
          >
            {searchMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2">Ask DIA</span>
          </Button>
        </div>

        {/* Usage indicator */}
        {response?.usage && !rateLimited && (
          <div className="text-center sm:text-right sm:absolute sm:right-2 sm:-bottom-6 text-xs text-muted-foreground mt-2 sm:mt-0">
            {response.usage.queries_remaining} queries remaining this month
          </div>
        )}
      </form>

      {/* Response */}
      {response?.data && !rateLimited && (
        <div className="mt-8 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
          {/* Main Answer */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  DIA
                </CardTitle>
                <div className="flex items-center gap-2">
                  {response.data.cached && (
                    <Badge variant="secondary" className="text-xs">Cached</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {response.response_time_ms}ms
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap text-foreground/80 leading-relaxed">
                  {response.data.answer}
                </p>
              </div>

              {/* Citations */}
              {response.data.citations && response.data.citations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {response.data.citations.map((citation, idx) => (
                      <a
                        key={idx}
                        href={citation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Source {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Network Matches */}
          {hasNetworkMatches && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-emerald-600" />
                  In Your DNA Network
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profiles */}
                {response.data.network_matches.profiles.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Connected Professionals
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {response.data.network_matches.profiles.map((profile) => (
                        <button
                          key={profile.id}
                          onClick={() => handleProfileClick(profile.id)}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer text-left group"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={profile.avatar_url} />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700">
                              {profile.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate flex items-center gap-1">
                              {profile.full_name}
                              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {profile.headline}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Events */}
                {response.data.network_matches.events.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Related Events
                    </p>
                    <div className="space-y-2">
                      {response.data.network_matches.events.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handleEventClick(event.id)}
                          className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer text-left group"
                        >
                          <div>
                            <p className="font-medium text-sm flex items-center gap-1">
                              {event.title}
                              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.start_date).toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {event.relevance}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {response.data.network_matches.projects.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <FolderKanban className="h-4 w-4" />
                      Active Spaces
                    </p>
                    <div className="space-y-2">
                      {response.data.network_matches.projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleProjectClick(project.id)}
                          className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer text-left group"
                        >
                          <p className="font-medium text-sm flex items-center gap-1">
                            {project.name}
                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </p>
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                            {project.status}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hashtags */}
                {response.data.network_matches.hashtags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Related Topics
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {response.data.network_matches.hashtags.map((hashtag) => (
                        <Badge
                          key={hashtag.id}
                          variant="secondary"
                          className="cursor-pointer hover:bg-emerald-600 hover:text-white transition-colors"
                          onClick={() => handleHashtagClick(hashtag.name)}
                        >
                          #{hashtag.name}
                          <span className="ml-1 text-xs opacity-70">
                            ({hashtag.post_count})
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Loading State */}
      {searchMutation.isPending && (
        <div className="mt-8 flex flex-col items-center justify-center py-12 animate-in fade-in-0">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <Sparkles className="h-4 w-4 text-emerald-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <p className="text-muted-foreground mt-4">DIA is researching...</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Searching global sources and your network</p>
        </div>
      )}

      {/* Empty State */}
      {!response && !searchMutation.isPending && !rateLimited && (
        <div className="mt-8 text-center py-12">
          <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Ask DIA Anything About Africa
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Get AI-powered intelligence about African markets, opportunities,
            and connect with your network members who share your interests.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 px-2">
            {(suggestions || [
              'Fintech opportunities in Nigeria',
              'Renewable energy investments in Kenya',
              'Tech hubs in Ghana',
              'Agricultural innovations in Ethiopia',
            ]).map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-2 text-sm bg-muted hover:bg-emerald-600 hover:text-white rounded-full transition-colors min-h-[44px]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DiaSearch;
