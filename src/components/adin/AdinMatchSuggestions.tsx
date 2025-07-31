import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  MapPin, 
  Briefcase, 
  TrendingUp,
  MessageCircle,
  User
} from 'lucide-react';

interface MatchSuggestionsProps {
  userId?: string;
  limit?: number;
}

const AdinMatchSuggestions: React.FC<MatchSuggestionsProps> = ({ 
  userId, 
  limit = 5 
}) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const { data: matches, isLoading } = useQuery({
    queryKey: ['adin-matches', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      // Call the database function to find matches
      const { data, error } = await supabase
        .rpc('find_adin_matches', { target_user_id: targetUserId });

      if (error) throw error;

      // Fetch additional profile data for the matched users
      const matchedUserIds = data?.map((match: any) => match.matched_user_id) || [];
      
      if (matchedUserIds.length === 0) return [];

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, profession, location, bio')
        .in('id', matchedUserIds);

      if (profileError) throw profileError;

      const { data: adinProfiles, error: adinError } = await supabase
        .from('adin_profiles')
        .select('id, influence_score, verified, region_focus, sector_focus')
        .in('id', matchedUserIds);

      if (adinError) throw adinError;

      // Merge the data
      return data?.map((match: any) => ({
        ...match,
        profile: profiles?.find(p => p.id === match.matched_user_id),
        adin_profile: adinProfiles?.find(ap => ap.id === match.matched_user_id)
      })).slice(0, limit);
    },
    enabled: !!targetUserId
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Smart Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Finding your matches...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Smart Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No matches found based on your current focus areas.</p>
            <p className="text-sm mt-1">Update your region and sector preferences to find matches.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Smart Matches
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Based on shared focus areas and interests
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.map((match: any) => (
            <div
              key={match.matched_user_id}
              className="p-4 border border-gray-200 rounded-lg hover:border-dna-emerald transition-colors"
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={match.profile?.avatar_url} />
                  <AvatarFallback>
                    {match.profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-dna-forest">
                      {match.profile?.full_name || 'Anonymous User'}
                    </h3>
                    {match.adin_profile?.verified && (
                      <Badge variant="default" className="text-xs">
                        Verified
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <TrendingUp className="w-3 h-3" />
                      {Math.round(match.match_score * 10) / 10} match
                    </div>
                  </div>

                  {match.profile?.profession && (
                    <p className="text-sm text-gray-600 mb-2">
                      {match.profile.profession}
                    </p>
                  )}

                  {match.profile?.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <MapPin className="w-3 h-3" />
                      {match.profile.location}
                    </div>
                  )}

                  <div className="text-sm text-dna-emerald mb-3">
                    {match.match_reason}
                  </div>

                  {/* Shared focus areas */}
                  <div className="space-y-2">
                    {match.shared_regions && match.shared_regions.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-500 mr-2">Shared Regions:</span>
                        <div className="inline-flex flex-wrap gap-1">
                          {match.shared_regions.map((region: string) => (
                            <Badge key={region} variant="outline" className="text-xs">
                              {region}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {match.shared_sectors && match.shared_sectors.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-500 mr-2">Shared Sectors:</span>
                        <div className="inline-flex flex-wrap gap-1">
                          {match.shared_sectors.map((sector: string) => (
                            <Badge key={sector} variant="outline" className="text-xs">
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      <User className="w-4 h-4 mr-1" />
                      View Profile
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Connect
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {matches.length >= limit && (
          <div className="text-center mt-4">
            <Button variant="outline" size="sm">
              View All Matches
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdinMatchSuggestions;