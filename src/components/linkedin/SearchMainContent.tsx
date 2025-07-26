import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search as SearchIcon, 
  Users, 
  Calendar, 
  MessageSquare, 
  Building2,
  TrendingUp,
  Brain,
  Sparkles,
  Globe,
  Database,
  Save
} from 'lucide-react';
import { searchContent, getPopularSearches, SearchResult, aiSearch, AISearchResult, globalSearch, GlobalSearchResult } from '@/services/searchService';
import { personalizedSearchService } from '@/services/personalizedSearchService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import SearchAutocomplete from '@/components/search/SearchAutocomplete';
import AdvancedFilters, { AdvancedSearchFilters } from '@/components/search/AdvancedFilters';

const SearchMainContent = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [aiResults, setAiResults] = useState<AISearchResult | null>(null);
  const [globalResults, setGlobalResults] = useState<GlobalSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [isAiMode, setIsAiMode] = useState(false);
  const [searchScope, setSearchScope] = useState<'dna' | 'global'>('dna');
  const [filters, setFilters] = useState<AdvancedSearchFilters>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState<string[]>([]);

  // Initialize personalized search service
  useEffect(() => {
    if (user?.id) {
      personalizedSearchService.initializeUserContext(user.id);
      loadPersonalizedData();
    }
  }, [user]);

  useEffect(() => {
    loadPopularSearches();
  }, []);

  const loadPersonalizedData = async () => {
    if (!user?.id) return;
    
    try {
      const suggestions = await personalizedSearchService.generatePersonalizedSuggestions(user.id);
      setPersonalizedSuggestions(suggestions);
      
      const analytics = await personalizedSearchService.getSearchAnalytics(user.id);
      setRecentSearches(analytics.popularTerms);
    } catch (error) {
      console.error('Error loading personalized data:', error);
    }
  };

  const loadPopularSearches = async () => {
    try {
      const searches = await getPopularSearches();
      setPopularSearches(searches);
    } catch (error) {
      console.error('Error loading popular searches:', error);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setAiResults(null);
      setGlobalResults(null);
      return;
    }

    setLoading(true);
    
    if (user?.id) {
      await personalizedSearchService.saveSearch(user.id, searchQuery);
      loadPersonalizedData();
    }

    try {
      if (searchScope === 'global') {
        const globalSearchResults = await globalSearch(searchQuery, activeTab === 'all' ? 'web' : activeTab);
        setGlobalResults(globalSearchResults);
        setResults([]);
        setAiResults(null);
        
        const hasWebResults = globalSearchResults.sources?.web || 0;
        const hasDatabaseResults = globalSearchResults.sources?.database || 0;
        
        toast({
          title: hasWebResults > 0 ? "AI-Enhanced Global Search completed" : "Database Search completed",
          description: `Found ${globalSearchResults.totalResults} results (${hasDatabaseResults} DNA${hasWebResults > 0 ? ` + ${hasWebResults} web` : ', web search unavailable'})`,
        });
      } else if (isAiMode) {
        const aiSearchResults = await aiSearch(searchQuery, user?.id);
        setAiResults(aiSearchResults);
        setGlobalResults(null);
        
        let flatResults = [
          ...aiSearchResults.results.profiles,
          ...aiSearchResults.results.communities,
          ...aiSearchResults.results.events,
          ...aiSearchResults.results.posts
        ];
        
        if (user?.id) {
          flatResults = await personalizedSearchService.personalizeResults(flatResults, searchQuery, user.id);
        }
        
        setResults(flatResults);
        
        toast({
          title: user?.id ? "Personalized AI Search completed" : "AI Search completed",
          description: `Found ${flatResults.length} results with AI understanding${user?.id ? ' and personalization' : ''}`,
        });
      } else {
        const searchFilters: any = {
          types: activeTab === 'all' ? [] : [activeTab]
        };
        
        if (filters.location?.country) {
          searchFilters.location = filters.location.country;
        }
        
        if (filters.dateRange?.start) {
          searchFilters.dateRange = {
            start: filters.dateRange.start.toISOString(),
            end: filters.dateRange.end?.toISOString()
          };
        }
        
        let searchResults = await searchContent(searchQuery, searchFilters);
        
        if (user?.id) {
          searchResults = await personalizedSearchService.personalizeResults(searchResults, searchQuery, user.id);
        }
        
        setResults(searchResults);
        setAiResults(null);
        setGlobalResults(null);
        
        toast({
          title: user?.id ? "Personalized Search completed" : "Search completed",
          description: `Found ${searchResults.length} results${user?.id ? ' with personalization' : ''}`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    handleSearch(term);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'profile': return <Users className="w-4 h-4" />;
      case 'community': return <Building2 className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'post': return <MessageSquare className="w-4 h-4" />;
      default: return <SearchIcon className="w-4 h-4" />;
    }
  };

  const filteredResults = activeTab === 'all' ? results : results.filter(r => r.type === activeTab);
  const filteredGlobalResults = globalResults ? (
    activeTab === 'all' ? globalResults.results : 
    globalResults.results.filter(r => r.type === activeTab)
  ) : [];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div>
        <h1 className="text-2xl font-bold text-dna-forest mb-2">
          {searchScope === 'global' ? 'Global Search' : 'DNA Search'}
        </h1>
        <p className="text-gray-600">
          {searchScope === 'global' 
            ? 'Search the entire web for people, events, organizations, and opportunities worldwide'
            : 'Discover people, communities, events, and content across the DNA network'
          }
        </p>
      </div>

      {/* Unified Search Interface */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Header with Toggle Pills */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SearchIcon className="w-5 h-5 text-dna-forest" />
              <h2 className="text-lg font-semibold text-dna-forest">Search DNA Network</h2>
            </div>
            
            {/* Search Mode Toggles */}
            <div className="flex items-center gap-2">
              {/* Search Scope Toggle */}
              <div className="flex bg-gray-100 rounded-full p-1">
                <Button
                  variant={searchScope === 'dna' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSearchScope('dna')}
                  className="rounded-full px-3 py-1 text-sm"
                >
                  <Database className="w-4 h-4 mr-1" />
                  DNA
                </Button>
                <Button
                  variant={searchScope === 'global' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSearchScope('global')}
                  className="rounded-full px-3 py-1 text-sm"
                >
                  <Globe className="w-4 h-4 mr-1" />
                  Global
                </Button>
              </div>
              
              {/* AI Mode Toggle */}
              {searchScope === 'dna' && (
                <Button
                  variant={isAiMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsAiMode(!isAiMode)}
                  className={`rounded-full px-3 py-1 text-sm ${
                    isAiMode 
                      ? 'bg-dna-emerald hover:bg-dna-emerald/90 text-white' 
                      : 'border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white'
                  }`}
                >
                  {isAiMode ? <Sparkles className="w-4 h-4 mr-1" /> : <Brain className="w-4 h-4 mr-1" />}
                  AI
                </Button>
              )}
            </div>
          </div>

          {/* Search Input */}
          <SearchAutocomplete
            value={query}
            onChange={setQuery}
            onSearch={handleSearch}
            placeholder={
              searchScope === 'global' 
                ? "Search globally: 'African tech conferences 2024'" 
                : isAiMode 
                  ? "Ask naturally: 'Find renewable energy investors in Nigeria'" 
                  : "Search for people, communities, events..."
            }
            recentSearches={recentSearches}
            onClearRecent={() => setRecentSearches([])}
            disabled={loading}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {searchScope === 'dna' && (
        <AdvancedFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={() => setFilters({})}
          resultCount={results.length}
        />
      )}

      {/* Personalized Suggestions */}
      {user && personalizedSuggestions.length > 0 && !query && (
        <Card className="border-dna-gold/20 bg-dna-gold/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-dna-gold">
              <Save className="w-5 h-5" />
              Personalized for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {personalizedSuggestions.map((suggestion, index) => (
                <Badge 
                  key={index}
                  variant="secondary" 
                  className="cursor-pointer bg-dna-gold/20 hover:bg-dna-gold hover:text-white transition-colors"
                  onClick={() => handleQuickSearch(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Understanding Display */}
      {aiResults && aiResults.intent.semanticIntent && (
        <Card className="border-dna-emerald/20 bg-gradient-to-r from-dna-emerald/5 to-dna-forest/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-dna-emerald/20 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-dna-emerald" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-dna-emerald">AI Understanding:</span>
                  {aiResults.intent.confidence && (
                    <Badge variant="outline" className="text-xs border-dna-emerald/30">
                      {Math.round(aiResults.intent.confidence * 100)}% confidence
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-700">{aiResults.intent.semanticIntent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {(results.length > 0 || globalResults?.results.length) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-dna-forest">Search Results</CardTitle>
              <div className="text-sm text-gray-600">
                {filteredResults.length || filteredGlobalResults.length} results found
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="profile">People</TabsTrigger>
                <TabsTrigger value="community">Communities</TabsTrigger>
                <TabsTrigger value="event">Events</TabsTrigger>
                <TabsTrigger value="post">Posts</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                <div className="space-y-4">
                  {(filteredResults.length > 0 ? filteredResults : filteredGlobalResults).map((result, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {result.type === 'profile' ? (
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={result.avatar_url} />
                                <AvatarFallback className="bg-dna-emerald text-white">
                                  {result.title?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="w-10 h-10 bg-dna-mint rounded-lg flex items-center justify-center">
                                {getResultIcon(result.type)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-dna-forest">{result.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {result.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                            {result.location && (
                              <p className="text-xs text-gray-500">{result.location}</p>
                            )}
                            {result.relevance_score && (
                              <div className="flex items-center gap-2 mt-2">
                                <TrendingUp className="w-3 h-3 text-dna-copper" />
                                <span className="text-xs text-dna-copper">
                                  {Math.round(result.relevance_score * 100)}% match
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Popular Searches when no query */}
      {!query && popularSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-dna-forest">
              <TrendingUp className="w-5 h-5" />
              Trending Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <Badge 
                  key={index}
                  variant="secondary" 
                  className="cursor-pointer hover:bg-dna-copper hover:text-white transition-colors"
                  onClick={() => handleQuickSearch(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchMainContent;