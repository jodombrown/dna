
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import SearchResults from '@/components/search/SearchResults';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/CleanAuthContext';
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
  const { 
    searchTerm, 
    setSearchTerm, 
    filters, 
    setFilters,
    professionals, 
    communities, 
    events, 
    loading, 
    clearSearch,
    performSearch,
    resultCounts 
  } = useAdvancedSearch();
  const { sendMessage } = useMessages();
  const [activeTab, setActiveTab] = useState('profiles');
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Demo recommendations
  const recommendations = [
    {
      id: '1',
      full_name: 'Dr. Amara Okafor',
      profession: 'FinTech CEO',
      company: 'AfriPay Solutions',
      location: 'London, UK',
      country_of_origin: 'Nigeria',
      bio: 'Leading fintech innovation across Africa and Europe.',
      skills: ['Financial Technology', 'Digital Payments', 'Blockchain'],
      connection_reason: 'Similar interests in financial technology',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b829?w=400'
    }
  ];

  // Initialize search from URL parameters
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setSearchTerm(queryParam);
      setShowRecommendations(false);
    }
  }, [searchParams, setSearchTerm]);

  const handleSearch = async (searchFilters: SearchFilters) => {
    setShowRecommendations(false);
    
    // Update the search term and filters
    setSearchTerm(searchFilters.searchTerm);
    setFilters({
      location: searchFilters.location,
      skills: searchFilters.skills,
      isMentor: searchFilters.isMentor,
      isInvestor: searchFilters.isInvestor,
      lookingForOpportunities: searchFilters.lookingForOpportunities
    });
    
    // Perform the search
    performSearch();
  };

  const handleConnect = async (userId: string) => {
    if (!user) {
      toast.error('Please sign in to connect with professionals');
      navigate('/auth');
      return;
    }

    try {
      toast.success('Feature coming soon - Connection system will be implemented in a future update');
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

  // Convert data to SearchResults format
  const results = {
    professionals: professionals.map(prof => ({
      id: prof.id,
      full_name: prof.full_name,
      profession: prof.profession,
      company: prof.company,
      location: prof.location,
      bio: prof.bio,
      avatar_url: prof.avatar_url,
      skills: prof.skills,
      is_mentor: prof.is_mentor,
      is_investor: prof.is_investor,
      looking_for_opportunities: prof.looking_for_opportunities,
      country_of_origin: prof.country_of_origin
    })),
    communities: communities,
    events: events
  };

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
                clearSearch();
                setShowRecommendations(true);
              }}
              loading={loading}
            />
          </div>

          {/* Search Results */}
          <div className="lg:col-span-2">
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
                    {recommendations.map((profile) => (
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
                results={results}
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
