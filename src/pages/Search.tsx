
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import SearchResults from '@/components/search/SearchResults';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useConnections } from '@/hooks/useConnections';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchFilters } from '@/types/searchTypes';
import RecommendationCard from '@/components/connect/RecommendationCard';
import { Lightbulb } from 'lucide-react';

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { results, loading, error, searchProfiles, searchProfessionals, clearResults } = useAdvancedSearch();
  const { recommendations, searchWithRelevance, searchResults } = useRecommendations();
  const { sendConnectionRequest } = useConnections();
  const { sendMessage } = useMessages();
  const [activeTab, setActiveTab] = useState('profiles');
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Initialize search from URL parameters
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      const initialFilters: SearchFilters = {
        searchTerm: queryParam,
        location: '',
        profession: '',
        skills: [],
        experience: '',
        isMentor: false,
        isInvestor: false,
        lookingForOpportunities: false,
        countryOfOrigin: ''
      };
      handleSearch(initialFilters);
      setShowRecommendations(false);
    }
  }, [searchParams]);

  const handleSearch = async (filters: SearchFilters) => {
    setShowRecommendations(false);
    
    if (activeTab === 'profiles') {
      // Use enhanced search with relevance
      if (filters.searchTerm) {
        await searchWithRelevance(filters.searchTerm, filters);
      } else {
        await searchProfiles(filters);
      }
    } else {
      await searchProfessionals(filters);
    }
  };

  const handleConnect = async (userId: string) => {
    if (!user) {
      toast.error('Please sign in to connect with professionals');
      navigate('/auth');
      return;
    }

    try {
      await sendConnectionRequest(userId, 'I would like to connect with you!');
      toast.success('Connection request sent successfully!');
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to send connection request');
    }
  };

  const handleMessage = async (recipientId: string, recipientName: string) => {
    if (!user) {
      toast.error('Please sign in to message professionals');
      navigate('/auth');
      return;
    }

    try {
      await sendMessage(recipientId, `Hi ${recipientName}, I'd like to connect and learn more about your work!`);
      toast.success('Message sent successfully!');
      navigate('/messages');
    } catch (error) {
      console.error('Message error:', error);
      toast.error('Failed to send message');
    }
  };

  // Determine which results to show
  const displayResults = showRecommendations ? [] : (searchResults.length > 0 ? searchResults : results);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Diaspora Professionals
          </h1>
          <p className="text-gray-600">
            Find and connect with African diaspora professionals worldwide
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search Filters */}
          <div className="lg:col-span-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profiles">Profiles</TabsTrigger>
                <TabsTrigger value="professionals">Professionals</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <AdvancedSearch
              onSearch={handleSearch}
              onClear={() => {
                clearResults();
                setShowRecommendations(true);
              }}
              loading={loading}
            />
          </div>

          {/* Search Results */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">Error: {error}</p>
              </div>
            )}

            {/* Show recommendations when no search is active */}
            {showRecommendations && user && recommendations.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-dna-emerald" />
                    Recommended for You
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {recommendations.slice(0, 6).map((profile) => (
                      <RecommendationCard
                        key={profile.id}
                        profile={profile}
                        onConnect={handleConnect}
                        onMessage={handleMessage}
                        isLoggedIn={!!user}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Regular search results */}
            {!showRecommendations && (
              <SearchResults
                results={displayResults}
                loading={loading}
                onConnect={handleConnect}
                onMessage={handleMessage}
              />
            )}

            {/* Initial state for non-authenticated users */}
            {showRecommendations && !user && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium mb-2">Welcome to DiasporaLink Search</p>
                    <p>Sign in to get personalized recommendations and connect with professionals</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Search;
