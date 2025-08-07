import React from 'react';
import { Profile } from '@/services/profilesService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, Users, Calendar, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardLeftColumnProps {
  profile: Profile;
  isOwnProfile: boolean;
}

const DashboardLeftColumn: React.FC<DashboardLeftColumnProps> = ({
  profile,
  isOwnProfile
}) => {
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
            
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {profile.full_name || 'DNA Member'}
            </h2>
            
            {profile.headline && (
              <p className="text-sm text-gray-600 mb-2">{profile.headline}</p>
            )}
            
            {profile.profession && (
              <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
                <Briefcase className="w-4 h-4 mr-1" />
                {profile.profession}
              </div>
            )}
            
            {profile.location && (
              <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
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
            <CardTitle className="text-sm font-medium text-gray-700">Impact Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.impact_areas.map((area, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
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
          <CardTitle className="text-sm font-medium text-gray-700">Community Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                Connections
              </div>
              <span className="text-sm font-medium">0</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                Projects
              </div>
              <span className="text-sm font-medium">0</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      {isOwnProfile && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link to="/app/search" className="block">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Find Connections
                </Button>
              </Link>
              <Link to="/app/connect" className="block">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Network
                </Button>
              </Link>
              <Link to="/app/admin" className="block">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Community
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