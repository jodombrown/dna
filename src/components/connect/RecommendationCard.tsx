
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Briefcase, UserPlus, MessageSquare, Lightbulb } from 'lucide-react';

interface RecommendationProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  profession?: string;
  company?: string;
  location?: string;
  country_of_origin?: string;
  bio?: string;
  skills?: string[];
  connection_reason: string;
}

interface RecommendationCardProps {
  profile: RecommendationProfile;
  onConnect: (userId: string) => void;
  onMessage: (userId: string, userName: string) => void;
  isLoggedIn: boolean;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  profile,
  onConnect,
  onMessage,
  isLoggedIn
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            <AvatarFallback className="bg-gradient-to-br from-dna-copper to-dna-emerald text-white">
              {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {profile.full_name}
                </h3>
                
                {profile.profession && (
                  <div className="flex items-center text-gray-600 mt-1">
                    <Briefcase className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {profile.profession}
                      {profile.company && ` at ${profile.company}`}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center text-gray-500 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {profile.location}
                    {profile.country_of_origin && profile.location !== profile.country_of_origin && 
                      ` • Originally from ${profile.country_of_origin}`
                    }
                  </span>
                </div>
              </div>
            </div>
            
            {/* Connection reason */}
            <div className="flex items-center mt-3 mb-3">
              <Lightbulb className="w-4 h-4 mr-2 text-dna-emerald" />
              <span className="text-sm text-dna-emerald font-medium">
                {profile.connection_reason}
              </span>
            </div>
            
            {profile.bio && (
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                {profile.bio}
              </p>
            )}
            
            {profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {profile.skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {profile.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{profile.skills.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            
            <div className="flex space-x-2 mt-4">
              <Button
                size="sm"
                onClick={() => onConnect(profile.id)}
                disabled={!isLoggedIn}
                className="bg-dna-emerald hover:bg-dna-forest text-white flex items-center gap-1"
              >
                <UserPlus className="w-4 h-4" />
                Connect
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMessage(profile.id, profile.full_name)}
                disabled={!isLoggedIn}
                className="flex items-center gap-1"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
