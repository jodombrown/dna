
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users } from 'lucide-react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useAuth } from '@/contexts/AuthContext';
import RecommendationCard from '@/components/connect/RecommendationCard';

interface RecommendationsSectionProps {
  onConnect: (userId: string) => void;
  onMessage: (userId: string, userName: string) => void;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  onConnect,
  onMessage
}) => {
  const { user } = useAuth();
  const { recommendations, loading, refreshRecommendations } = useRecommendations();

  if (!user) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-dna-emerald" />
            People You May Know
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshRecommendations}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="flex space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No recommendations available</p>
            <p className="text-gray-400 mt-2">
              Complete your profile to get better connection suggestions
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.slice(0, 4).map((profile) => (
              <RecommendationCard
                key={profile.id}
                profile={profile}
                onConnect={onConnect}
                onMessage={onMessage}
                isLoggedIn={!!user}
              />
            ))}
          </div>
        )}
        
        {recommendations.length > 4 && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/search'}
              className="bg-dna-emerald hover:bg-dna-forest text-white"
            >
              View All Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationsSection;
