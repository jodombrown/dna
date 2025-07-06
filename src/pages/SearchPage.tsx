import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppHeader from '@/components/app/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users, FolderOpen, Building, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SearchPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState<{
    posts: any[];
    profiles: any[];
    projects: any[];
    communities: any[];
  }>({ posts: [], profiles: [], projects: [], communities: [] });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery && searchQuery !== query) {
      setQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, [searchParams]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      // Search posts
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .textSearch('content', searchTerm)
        .limit(10);

      // Search profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%, bio.ilike.%${searchTerm}%`)
        .eq('is_public', true)
        .limit(10);

      // Search projects
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .or(`title.ilike.%${searchTerm}%, description.ilike.%${searchTerm}%`)
        .limit(10);

      // Search communities
      const { data: communities } = await supabase
        .from('communities')
        .select('*')
        .or(`name.ilike.%${searchTerm}%, description.ilike.%${searchTerm}%`)
        .eq('is_active', true)
        .limit(10);

      setSearchResults({
        posts: posts || [],
        profiles: profiles || [],
        projects: projects || [],
        communities: communities || []
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    const newUrl = `/search?q=${encodeURIComponent(query)}`;
    navigate(newUrl);
    performSearch(query);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-dna-emerald" />
      </div>
    );
  }

  if (!user) return null;

  const totalResults = searchResults.posts.length + searchResults.profiles.length + 
                     searchResults.projects.length + searchResults.communities.length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      
      <div className="flex-1 max-w-4xl mx-auto p-4 space-y-6">
        {/* Search Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-dna-emerald" />
              Search DNA Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search for people, posts, projects, communities..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {query && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              {isSearching ? 'Searching...' : `Results for "${query}" (${totalResults})`}
            </h2>

            {/* Profiles Results */}
            {searchResults.profiles.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    People ({searchResults.profiles.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {searchResults.profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                         onClick={() => navigate(`/profile/${profile.id}`)}>
                      <Avatar>
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback className="bg-dna-emerald text-white">
                          {profile.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{profile.full_name}</h3>
                        <p className="text-sm text-gray-600">{profile.location}</p>
                        {profile.bio && (
                          <p className="text-sm text-gray-500 line-clamp-2">{profile.bio}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Posts Results */}
            {searchResults.posts.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Posts ({searchResults.posts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {searchResults.posts.map((post) => (
                    <div key={post.id} className="p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {post.pillar}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-3">{post.content}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Projects Results */}
            {searchResults.projects.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Projects ({searchResults.projects.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {searchResults.projects.map((project) => (
                    <div key={project.id} className="p-3 rounded-lg border border-gray-200">
                      <h3 className="font-medium mb-1">{project.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {project.status}
                        </Badge>
                        {project.impact_area && (
                          <Badge variant="secondary" className="text-xs">
                            {project.impact_area}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Communities Results */}
            {searchResults.communities.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Communities ({searchResults.communities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {searchResults.communities.map((community) => (
                    <div key={community.id} className="p-3 rounded-lg border border-gray-200">
                      <h3 className="font-medium mb-1">{community.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{community.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {community.member_count || 0} members
                        </Badge>
                        {community.category && (
                          <Badge variant="secondary" className="text-xs">
                            {community.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* No Results */}
            {!isSearching && totalResults === 0 && query && (
              <Card>
                <CardContent className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No results found</h3>
                  <p className="text-gray-600">
                    Try searching with different keywords or check your spelling.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;