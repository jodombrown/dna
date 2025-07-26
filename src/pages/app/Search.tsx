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
  Filter,
  TrendingUp,
  Clock,
  Brain,
  Sparkles
} from 'lucide-react';
import { searchContent, getPopularSearches, SearchResult, aiSearch, AISearchResult } from '@/services/searchService';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const Search = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [aiResults, setAiResults] = useState<AISearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [isAiMode, setIsAiMode] = useState(false);

  useEffect(() => {
    loadPopularSearches();
  }, []);

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
      return;
    }

    setLoading(true);
    try {
      if (isAiMode) {
        // Use AI search for natural language queries
        const aiSearchResults = await aiSearch(searchQuery);
        setAiResults(aiSearchResults);
        
        // Flatten AI results for tab display
        const flatResults = [
          ...aiSearchResults.results.profiles,
          ...aiSearchResults.results.communities,
          ...aiSearchResults.results.events,
          ...aiSearchResults.results.posts
        ];
        setResults(flatResults);
        
        toast({
          title: "AI Search completed",
          description: `Found ${flatResults.length} results with AI understanding`,
        });
      } else {
        // Use regular search
        const searchResults = await searchContent(searchQuery, {
          types: activeTab === 'all' ? [] : [activeTab]
        });
        setResults(searchResults);
        setAiResults(null);
        
        toast({
          title: "Search completed",
          description: `Found ${searchResults.length} results`,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dna-forest mb-2">Search</h1>
        <p className="text-gray-600">Discover people, communities, events, and content across the DNA network</p>
      </div>

      {/* AI Mode Toggle */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-dna-emerald" />
              <div>
                <div className="font-semibold">AI-Powered Search</div>
                <div className="text-sm text-muted-foreground">
                  {isAiMode ? 'Ask naturally: "Find tech investors in Lagos"' : 'Enable natural language understanding'}
                </div>
              </div>
            </div>
            <Button
              variant={isAiMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsAiMode(!isAiMode)}
              className="gap-2"
            >
              {isAiMode ? <Sparkles className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
              {isAiMode ? 'AI Mode' : 'Enable AI'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isAiMode 
                  ? "Ask naturally: 'Find renewable energy investors in Nigeria'" 
                  : "Search for people, communities, events..."
                }
                className="pl-10"
              />
            </div>
            <Button 
              onClick={() => handleSearch(query)}
              disabled={loading}
              className="bg-dna-emerald hover:bg-dna-forest text-white gap-2"
            >
              {loading ? 'Searching...' : (
                <>
                  {isAiMode ? <Brain className="w-4 h-4" /> : <SearchIcon className="w-4 h-4" />}
                  Search
                </>
              )}
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {aiResults && aiResults.suggestions.length > 0 && (
        <Card className="mb-4 border-dna-emerald/20 bg-dna-emerald/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-dna-emerald">
              <Sparkles className="w-5 h-5" />
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {aiResults.suggestions.map((suggestion, index) => (
                <Badge 
                  key={index}
                  variant="secondary" 
                  className="cursor-pointer bg-dna-emerald/20 hover:bg-dna-emerald hover:text-white transition-colors border-dna-emerald/30"
                  onClick={() => handleQuickSearch(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Searches */}
      {!query && popularSearches.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Popular Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <Badge 
                  key={term}
                  variant="secondary" 
                  className="cursor-pointer hover:bg-dna-emerald hover:text-white transition-colors"
                  onClick={() => handleQuickSearch(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {(query || results.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All ({results.length})</TabsTrigger>
                <TabsTrigger value="profile">People ({results.filter(r => r.type === 'profile').length})</TabsTrigger>
                <TabsTrigger value="community">Communities ({results.filter(r => r.type === 'community').length})</TabsTrigger>
                <TabsTrigger value="event">Events ({results.filter(r => r.type === 'event').length})</TabsTrigger>
                <TabsTrigger value="post">Posts ({results.filter(r => r.type === 'post').length})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="space-y-4">
                {filteredResults.map((result) => (
                  <div key={`${result.type}-${result.id}`} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex-shrink-0">
                      {result.avatar_url || result.image_url ? (
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={result.avatar_url || result.image_url} />
                          <AvatarFallback>
                            {result.title.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          {getResultIcon(result.type)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{result.title}</h3>
                        <Badge variant="outline" className="text-xs capitalize">
                          {result.type}
                        </Badge>
                      </div>
                      
                      {result.description && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{result.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {result.created_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                          </span>
                        )}
                        
                        {result.metadata?.location && (
                          <span>{result.metadata.location}</span>
                        )}
                        
                        {result.metadata?.member_count && (
                          <span>{result.metadata.member_count} members</span>
                        )}
                        
                        {result.metadata?.author && (
                          <span>by {result.metadata.author}</span>
                        )}
                        
                        {result.metadata?.community && (
                          <span>in {result.metadata.community}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-8">
                <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start searching</h3>
                <p className="text-gray-600">Enter keywords to find people, communities, and content</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Search;