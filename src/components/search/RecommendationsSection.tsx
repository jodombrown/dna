
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RecommendationCard from '@/components/connect/RecommendationCard';
import { Lightbulb } from 'lucide-react';

interface RecommendationsSectionProps {
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
  onConnect: (userId: string) => void;
  onMessage: (recipientId: string, recipientName: string) => void;
  isLoggedIn: boolean;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  recommendations,
  onConnect,
  onMessage,
  isLoggedIn
}) => {
  return (
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
              onConnect={onConnect}
              onMessage={onMessage}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationsSection;
