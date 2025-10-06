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
        .select('*', { count: 'exact', head: true })
        .or(`a.eq.${profile.id},b.eq.${profile.id}`)
        .eq('status', 'accepted');
      if (error) {
        console.error('Error fetching connections:', error);
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
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('status', 'approved');
      if (error) {
        console.error('Error fetching collaborations:', error);
        return 0;
      }
      return count || 0;
    },
    enabled: !!profile?.id,
  });

  // Placeholder for profile views (table may not exist)
  const profileViews = 0;

  return (
    <div className="space-y-6">
      {/* Profile Preview Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
              <AvatarFallback className="bg-dna-copper text-white text-lg">
                {profile.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <h2 className="text-xl font-semibold text-dna-forest mb-1">
              {profile.full_name || 'DNA Member'}
            </h2>
            
            {profile.headline && (
              <p className="text-sm text-muted-foreground mb-2">{profile.headline}</p>
            )}
            
            {profile.profession && (
              <div className="flex items-center justify-center text-sm text-muted-foreground mb-2">
                <Briefcase className="w-4 h-4 mr-1" />
                {profile.profession}
              </div>
            )}
            
            {profile.location && (
              <div className="flex items-center justify-center text-sm text-muted-foreground mb-4">
                <MapPin className="w-4 h-4 mr-1" />
                {profile.location}
              </div>
            )}
            
            {isOwnProfile && (
              <Link to="/app/profile/edit">
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Impact Areas */}
      {profile.impact_areas && profile.impact_areas.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-dna-forest">Impact Areas</CardTitle>
          </CardHeader>
          <CardContent>
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-dna-forest">Community Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
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

      {/* Quick Links */}
      {isOwnProfile && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-dna-forest">Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link to="/connect" className="block">
                <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-dna-forest hover:bg-dna-emerald/10">
                  Find Connections
                </Button>
              </Link>
              <Link to="/network" className="block">
                <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-dna-forest hover:bg-dna-emerald/10">
                  Network
                </Button>
              </Link>
              <Link to="/opportunities" className="block">
                <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-dna-forest hover:bg-dna-emerald/10">
                  Explore Opportunities
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardLeftColumn;
