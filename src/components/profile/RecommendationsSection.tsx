import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { RefreshCw, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import RecommendationCard from '@/components/connect/RecommendationCard';
import { enhancedDemoProfessionals } from '@/data/enhancedDemoData';

interface RecommendationsSectionProps {
  onConnect: (userId: string) => void;
  onMessage: (userId: string, userName: string) => void;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  onConnect,
  onMessage
}) => {
  const { user } = useAuth();

  // Use enhanced demo data with more diversity
  const recommendations = enhancedDemoProfessionals.slice(0, 2).map(professional => ({
    id: professional.id,
    full_name: professional.full_name,
    profession: professional.profession || '',
    company: professional.company || '',
    location: professional.location || '',
    country_of_origin: professional.country_of_origin || '',
    bio: professional.bio || '',
    skills: Array.isArray(professional.skills) ? professional.skills : [],
    connection_reason: 'Similar professional interests and background',
    avatar_url: professional.avatar_url
  }));

  if (!user) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-dna-emerald" />
            People You May Know
          </CardTitle>
          <EnhancedButton
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </EnhancedButton>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {recommendations.map((profile) => (
            <RecommendationCard
              key={profile.id}
              profile={profile}
              onConnect={onConnect}
              onMessage={onMessage}
              isLoggedIn={!!user}
            />
          ))}
        </div>
        
        <div className="text-center mt-6">
          <EnhancedButton
            variant="dna"
          >
            View All Recommendations
          </EnhancedButton>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationsSection;
