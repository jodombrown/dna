
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, Users, Mail, Lightbulb } from 'lucide-react';

interface RecommendationCardProps {
  profile: any;
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
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            <AvatarFallback className="bg-dna-copper text-white">
              {profile.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {profile.full_name}
            </h3>
            
            {profile.profession && (
              <p className="text-dna-emerald font-medium text-sm">
                {profile.profession}
              </p>
            )}
            
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              {profile.company && (
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  <span className="truncate">{profile.company}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{profile.location}</span>
                </div>
              )}
            </div>
            
            {profile.connection_reason && (
              <div className="flex items-center gap-2 mt-3">
                <Lightbulb className="w-4 h-4 text-dna-emerald" />
                <span className="text-sm text-gray-600">{profile.connection_reason}</span>
              </div>
            )}
            
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => onConnect(profile.id)}
                disabled={!isLoggedIn}
                size="sm"
                className="bg-dna-copper hover:bg-dna-gold text-white"
              >
                <Users className="w-4 h-4 mr-1" />
                Connect
              </Button>
              <Button
                onClick={() => onMessage(profile.id, profile.full_name)}
                disabled={!isLoggedIn}
                variant="outline"
                size="sm"
              >
                <Mail className="w-4 h-4 mr-1" />
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
