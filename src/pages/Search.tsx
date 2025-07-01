
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import SearchPageHeader from '@/components/search/SearchPageHeader';
import SearchSidebar from '@/components/search/SearchSidebar';
import SearchContent from '@/components/search/SearchContent';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { useSearchHandlers } from '@/hooks/useSearchHandlers';
import { useAuth } from '@/contexts/CleanAuthContext';
import { SearchFilters } from '@/types/searchTypes';
import { demoRecommendations } from '@/data/searchRecommendations';

const Search = () => {
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
    performSearch
  } = useAdvancedSearch();
  
  const { handleConnect, handleMessage } = useSearchHandlers(user);
  const [activeTab, setActiveTab] = useState('profiles');
  const [showRecommendations, setShowRecommendations] = useState(true);

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

  const handleClear = () => {
    clearSearch();
    setShowRecommendations(true);
  };

  // Data structure for SearchResults component - convert to expected format
  const results = {
    professionals: professionals,
    communities: communities,
    events: events
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchPageHeader />

        <div className="grid lg:grid-cols-3 gap-8">
          <SearchSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onSearch={handleSearch}
            onClear={handleClear}
            loading={loading}
          />

          <SearchContent
            showRecommendations={showRecommendations}
            user={user}
            recommendations={demoRecommendations}
            results={results}
            loading={loading}
            onConnect={handleConnect}
            onMessage={handleMessage}
          />
        </div>
      </main>
    </div>
  );
};

export default Search;
