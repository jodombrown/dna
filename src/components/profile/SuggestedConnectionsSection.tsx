
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RecommendationProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  profession?: string;
  connection_reason: string;
}

const SuggestedConnectionsSection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<RecommendationProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get a few random profiles excluding the current user
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, profession')
        .neq('id', user.id)
        .limit(6);

      if (error) throw error;

      // Transform to match the expected interface
      const transformedProfiles: RecommendationProfile[] = (profiles || []).map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'DNA Member',
        avatar_url: profile.avatar_url || undefined,
        profession: profile.profession || 'Professional',
        connection_reason: 'Similar interests and background'
      }));

      setRecommendations(transformedProfiles);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-dna-forest">
            <Users className="w-5 h-5" />
            Suggested Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Loading suggestions...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-dna-forest">
            <Users className="w-5 h-5" />
            Suggested Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No suggestions available at the moment.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-dna-forest">
          <Users className="w-5 h-5" />
          Suggested Connections
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.slice(0, 3).map((recommendation) => (
          <div key={recommendation.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <Avatar className="w-12 h-12">
              <AvatarImage src={recommendation.avatar_url} alt={recommendation.full_name} />
              <AvatarFallback className="bg-dna-copper text-white">
                {recommendation.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">
                {recommendation.full_name}
              </h4>
              <p className="text-sm text-gray-600 truncate">
                {recommendation.profession}
              </p>
              <p className="text-xs text-dna-copper">
                {recommendation.connection_reason}
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
              onClick={() => handleViewProfile(recommendation.id)}
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        ))}
        
        <div className="pt-2">
          <Button 
            variant="ghost" 
            className="w-full text-dna-emerald hover:bg-dna-emerald/10"
            onClick={() => navigate('/members')}
          >
            View All Suggestions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestedConnectionsSection;
