import React from 'react';
import { Profile } from '@/services/profilesService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, Users, Eye, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProfileDiscoveryTags } from '@/components/profile/ProfileDiscoveryTags';
import { ProfileStrengthCard } from '@/components/profile/ProfileStrengthCard';
import { calculateProfileCompletion } from '@/components/profile/ProfileCompletionBar';
interface DashboardLeftColumnProps {
  profile: Profile;
  isOwnProfile: boolean;
}

const DashboardLeftColumn: React.FC<DashboardLeftColumnProps> = ({
  profile,
  isOwnProfile
}) => {
  const navigate = useNavigate();

  // Fetch real connection count
  const { data: connectionCount = 0 } = useQuery({
    queryKey: ['connection-count', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return 0;
      const { count, error } = await supabase
        .from('connections')
        .select('id', { count: 'exact' })
        .or(`a.eq.${profile.id},b.eq.${profile.id}`)
        .eq('status', 'accepted');
      if (error) {
        return 0;
      }
      return count || 0;
    },
    enabled: !!profile?.id,
  });

  // Fetch real collaboration space count (as contributions proxy)
  const { data: contributionCount = 0 } = useQuery({
    queryKey: ['collaboration-count', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return 0;
      const { count, error } = await supabase
        .from('collaboration_memberships')
        .select('id', { count: 'exact' })
        .eq('user_id', profile.id)
        .eq('status', 'approved');
      if (error) {
        return 0;
      }
      return count || 0;
    },
    enabled: !!profile?.id,
  });

  // Placeholder for profile views (table may not exist)
  const profileViews = 0;

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Profile Strength (own profile only) */}
      {isOwnProfile && (
        <ProfileStrengthCard completionScore={calculateProfileCompletion(profile)} />
      )}

      {/* About */}
      {profile.bio && (
        <Card className="transition-all duration-150 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-dna-forest">About</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Areas of Focus & Expertise */}
      <Card className="transition-all duration-150 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-dna-forest">Areas of Focus & Expertise</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ProfileDiscoveryTags
            focusAreas={profile.focus_areas}
            regionalExpertise={profile.regional_expertise}
            industries={profile.industries}
            skills={profile.skills}
            interests={profile.interests}
          />
        </CardContent>
      </Card>

      {/* Impact Areas */}
      {profile.impact_areas && profile.impact_areas.length > 0 && (
        <Card className="transition-all duration-150 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-dna-forest">Impact Areas</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {profile.impact_areas.map((area, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs bg-dna-emerald/10 text-dna-forest border-dna-emerald"
                >
                  {area}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card className="transition-all duration-150 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-dna-forest">Community Stats</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            <div 
              className="flex justify-between hover:bg-dna-emerald/5 p-2 rounded cursor-pointer transition-colors"
              onClick={() => navigate(`/dna/${profile.username}?tab=connections`)}
            >
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-2 text-dna-copper" />
                Connections
              </div>
              <span className="font-semibold text-dna-forest">{connectionCount}</span>
            </div>
            
            <div 
              className="flex justify-between hover:bg-dna-emerald/5 p-2 rounded cursor-pointer transition-colors"
              onClick={() => navigate(`/dna/${profile.username}?tab=contributions`)}
            >
              <div className="flex items-center text-sm text-muted-foreground">
                <Briefcase className="w-4 h-4 mr-2 text-dna-copper" />
                Projects
              </div>
              <span className="font-semibold text-dna-forest">{contributionCount}</span>
            </div>
            
            <div className="flex justify-between hover:bg-dna-emerald/5 p-2 rounded cursor-pointer transition-colors">
              <div className="flex items-center text-sm text-muted-foreground">
                <Eye className="w-4 h-4 mr-2 text-dna-copper" />
                Profile Views
              </div>
              <span className="font-semibold text-dna-gold">{profileViews}</span>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default DashboardLeftColumn;
