
import React from 'react';
import SearchResults from '@/components/search/SearchResults';
import RecommendationsSection from '@/components/search/RecommendationsSection';
import WelcomeSection from '@/components/search/WelcomeSection';
import { Professional, Community, Event } from '@/hooks/useSearch';

interface SearchContentProps {
  showRecommendations: boolean;
  user: any;
  recommendations: Array<{
    id: string;
    full_name: string;
    profession: string;
    company: string;
    location: string;
    country_of_origin: string;
    bio: string;
    skills: string[];
    connection_reason: string;
    avatar_url: string;
  }>;
  results: {
    professionals: Professional[];
    communities: Community[];
    events: Event[];
  };
  loading: boolean;
  onConnect: (userId: string) => void;
  onMessage: (recipientId: string, recipientName: string) => void;
}

const SearchContent: React.FC<SearchContentProps> = ({
  showRecommendations,
  user,
  recommendations,
  results,
  loading,
  onConnect,
  onMessage
}) => {
  return (
    <div className="lg:col-span-2">
      {/* Show recommendations when no search is active */}
      {showRecommendations && user && recommendations.length > 0 && (
        <RecommendationsSection
          recommendations={recommendations}
          onConnect={onConnect}
          onMessage={onMessage}
          isLoggedIn={!!user}
        />
      )}

      {/* Regular search results */}
      {!showRecommendations && (
        <SearchResults
          results={results}
          loading={loading}
          onConnect={onConnect}
          onMessage={onMessage}
        />
      )}

      {/* Initial state for non-authenticated users */}
      {showRecommendations && !user && (
        <WelcomeSection />
      )}
    </div>
  );
};

export default SearchContent;
