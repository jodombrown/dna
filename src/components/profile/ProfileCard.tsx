
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Building, ExternalLink } from 'lucide-react';

interface ProfileCardProps {
  profile: {
    id: string;
    full_name?: string;
    profession?: string;
    company?: string;
    location?: string;
    bio?: string;
    linkedin_url?: string;
    avatar_url?: string;
  };
  onClick?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onClick }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            <AvatarFallback className="bg-africa-orange text-white">
              {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {profile.full_name || 'Anonymous User'}
            </h3>
            
            {profile.profession && (
              <p className="text-africa-green font-medium">{profile.profession}</p>
            )}
            
            {profile.company && (
              <div className="flex items-center text-gray-600 text-sm mt-1">
                <Building className="w-4 h-4 mr-1" />
                <span className="truncate">{profile.company}</span>
              </div>
            )}
            
            {profile.location && (
              <div className="flex items-center text-gray-600 text-sm mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="truncate">{profile.location}</span>
              </div>
            )}
            
            {profile.bio && (
              <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                {profile.bio}
              </p>
            )}
            
            <div className="flex items-center space-x-2 mt-3">
              <Button size="sm" className="bg-africa-orange hover:bg-africa-sunset">
                Connect
              </Button>
              
              {profile.linkedin_url && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(profile.linkedin_url, '_blank');
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
