import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Sparkles, Users, Calendar, FolderKanban, Hash, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface AdinResponse {
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
}

interface AdinSearchProps {
  source?: string;
  placeholder?: string;
  compact?: boolean;
}

export function AdinSearch({
  source = 'dashboard',
  placeholder = 'Ask ADIN about African opportunities, markets, or trends...',
  compact = false
}: AdinSearchProps) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<AdinResponse | null>(null);

  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await supabase.functions.invoke('adin-search', {
        body: { query: searchQuery, source },
      });

      if (res.error) throw res.error;
      return res.data as AdinResponse;
    },
    onSuccess: (data) => {
      setResponse(data);
      if (data.data.cached) {
        toast.info('Retrieved from cache', { duration: 2000 });
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.error || 'Search failed';
      if (errorMessage.includes('Monthly query limit') || errorMessage.includes('limit reached')) {
        toast.error("You've reached your monthly ADIN query limit. Upgrade for more!");
      } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('Not authenticated')) {
        toast.error('Please sign in to use ADIN');
      } else {
        toast.error('Failed to search. Please try again.');
      }
      console.error('ADIN search error:', error);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      searchMutation.mutate(query.trim());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    searchMutation.mutate(suggestion);
  };

  const hasNetworkMatches = response?.data?.network_matches && (
    response.data.network_matches.profiles.length > 0 ||
    response.data.network_matches.events.length > 0 ||
    response.data.network_matches.projects.length > 0 ||
    response.data.network_matches.hashtags.length > 0
  );

  return (
    <div className={`w-full ${compact ? 'max-w-xl' : 'max-w-4xl'} mx-auto`}>
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </div>
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-12 pr-24 py-6 text-lg rounded-xl border-2 border-gray-200 focus:border-emerald-500 transition-colors"
            disabled={searchMutation.isPending}
          />
          <Button
            type="submit"
            disabled={!query.trim() || searchMutation.isPending}
            className="absolute right-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {searchMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2">Ask ADIN</span>
          </Button>
        </div>

        {/* Usage indicator */}
        {response?.usage && (
          <div className="absolute right-2 -bottom-6 text-xs text-gray-500">
            {response.usage.queries_remaining} queries remaining this month
          </div>
        )}
      </form>

      {/* Response */}
      {response?.data && (
        <div className="mt-8 space-y-6">
          {/* Main Answer */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  ADIN Intelligence
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
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {response.data.answer}
                </p>
              </div>

              {/* Citations */}
              {response.data.citations && response.data.citations.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-medium text-gray-500 mb-2">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {response.data.citations.map((citation, idx) => (
                      <a
                        key={idx}
                        href={citation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline"
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
                    <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Connected Professionals
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {response.data.network_matches.profiles.map((profile) => (
                        <div
                          key={profile.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={profile.avatar_url} />
                            <AvatarFallback>
                              {profile.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {profile.full_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {profile.headline}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Events */}
                {response.data.network_matches.events.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Related Events
                    </p>
                    <div className="space-y-2">
                      {response.data.network_matches.events.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <div>
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(event.start_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {event.relevance}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {response.data.network_matches.projects.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <FolderKanban className="h-4 w-4" />
                      Active Projects
                    </p>
                    <div className="space-y-2">
                      {response.data.network_matches.projects.map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <p className="font-medium text-sm">{project.name}</p>
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            {project.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hashtags */}
                {response.data.network_matches.hashtags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Related Topics
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {response.data.network_matches.hashtags.map((hashtag) => (
                        <Badge
                          key={hashtag.id}
                          variant="secondary"
                          className="cursor-pointer hover:bg-emerald-600 hover:text-white transition-colors"
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
        <div className="mt-8 flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
          <p className="text-gray-500">ADIN is researching...</p>
        </div>
      )}

      {/* Empty State */}
      {!response && !searchMutation.isPending && (
        <div className="mt-8 text-center py-12">
          <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Ask ADIN Anything About Africa
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Get AI-powered intelligence about African markets, opportunities,
            and connect with your network members who share your interests.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              'Fintech opportunities in Nigeria',
              'Renewable energy investments in Kenya',
              'Tech hubs in Ghana',
              'Agricultural innovations in Ethiopia',
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-emerald-600 hover:text-white rounded-full transition-colors"
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

export default AdinSearch;
