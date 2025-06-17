
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import SearchResults from '@/components/search/SearchResults';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchFilters } from '@/types/searchTypes';
import { Lightbulb } from 'lucide-react';

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { results, loading, error, searchProfiles, searchProfessionals, clearResults } = useAdvancedSearch();
  const { recommendations } = useRecommendations();
  const [activeTab, setActiveTab] = useState('profiles');
  const [showRecommendations, setShowRecommendations] = useState(true);

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
      await searchProfiles(filters);
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

    toast.success('Connection request functionality placeholder');
  };

  const handleMessage = async (recipientId: string, recipientName: string) => {
    if (!user) {
      toast.error('Please sign in to message professionals');
      navigate('/auth');
      return;
    }

    toast.success('Message functionality placeholder');
  };

  const displayResults = showRecommendations ? [] : results;

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

          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">Error: {error}</p>
              </div>
            )}

            {showRecommendations && user && recommendations.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-dna-emerald" />
                    Recommended for You
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    Recommendations will be displayed here
                  </div>
                </CardContent>
              </Card>
            )}

            {!showRecommendations && (
              <SearchResults
                results={displayResults}
                loading={loading}
                onConnect={handleConnect}
                onMessage={handleMessage}
              />
            )}

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
