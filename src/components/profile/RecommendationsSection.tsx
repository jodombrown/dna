
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users } from 'lucide-react';
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

  // Demo recommendations data
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
    },
    {
      id: '2', 
      full_name: 'Prof. Kwame Asante',
      profession: 'AgriTech Researcher',
      company: 'Ghana Institute of Technology',
      location: 'Toronto, Canada',
      country_of_origin: 'Ghana',
      bio: 'Pioneering sustainable agriculture solutions for smallholder farmers.',
      skills: ['Agricultural Technology', 'Climate Science', 'Sustainable Farming'],
      connection_reason: 'Shared background in technology and development',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
    }
  ];

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
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
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
          <Button
            variant="outline"
            className="bg-dna-emerald hover:bg-dna-forest text-white"
          >
            View All Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationsSection;
