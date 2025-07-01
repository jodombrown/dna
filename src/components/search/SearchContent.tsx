
import React from 'react';
import SearchResults from '@/components/search/SearchResults';
import RecommendationsSection from '@/components/search/RecommendationsSection';
import WelcomeSection from '@/components/search/WelcomeSection';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Professional, Community, Event } from '@/hooks/useSearch';
import { Search, Users } from 'lucide-react';

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
  // Show loading state
  if (loading) {
    return (
      <div className="lg:col-span-2">
        <LoadingState 
          size="lg"
          message="Searching the diaspora network..."
        />
      </div>
    );
  }

  // Show recommendations when no search is active
  if (showRecommendations && user && recommendations.length > 0) {
    return (
      <div className="lg:col-span-2">
        <RecommendationsSection
          recommendations={recommendations}
          onConnect={onConnect}
          onMessage={onMessage}
          isLoggedIn={!!user}
        />
      </div>
    );
  }

  // Show search results
  if (!showRecommendations) {
    const totalResults = results.professionals.length + results.communities.length + results.events.length;
    
    if (totalResults === 0) {
      return (
        <div className="lg:col-span-2">
          <EmptyState
            icon={Search}
            title="No results found"
            description="Try adjusting your search criteria or filters to discover more professionals, communities, and events in the diaspora network."
            size="lg"
          />
        </div>
      );
    }

    return (
      <div className="lg:col-span-2">
        <SearchResults
          results={results}
          loading={loading}
          onConnect={onConnect}
          onMessage={onMessage}
        />
      </div>
    );
  }

  // Welcome state for non-authenticated users
  if (showRecommendations && !user) {
    return (
      <div className="lg:col-span-2">
        <WelcomeSection />
      </div>
    );
  }

  // Fallback empty state
  return (
    <div className="lg:col-span-2">
      <EmptyState
        icon={Users}
        title="Ready to discover your network"
        description="Use the search and filters to find professionals, communities, and events that match your interests."
        size="lg"
      />
    </div>
  );
};

export default SearchContent;
