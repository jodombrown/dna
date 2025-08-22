
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { RequireProfileScore } from '@/components/profile/RequireProfileScore';
import { MapPin, Briefcase, Hash, MessageCircle, UserPlus } from 'lucide-react';

interface ProfileData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  professional_role: string | null;
  current_country: string | null;
  interests: string[] | null;
  bio: string | null;
  is_public: boolean;
}

interface PublicProfileViewProps {
  profile: ProfileData;
  onMessage?: () => void;
  onConnect?: () => void;
}

const PublicProfileView: React.FC<PublicProfileViewProps> = ({ 
  profile, 
  onMessage, 
  onConnect 
}) => {
  // Don't show private profiles
  if (!profile.is_public) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Private</h2>
              <p className="text-gray-600">This user has chosen to keep their profile private.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
              <AvatarFallback className="bg-dna-mint text-dna-forest text-2xl">
                {profile.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.full_name || 'DNA Member'}
              </h1>
              {profile.professional_role && (
                <div className="flex items-center text-gray-600 mt-1">
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span>{profile.professional_role}</span>
                </div>
              )}
              {profile.current_country && (
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{profile.current_country}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            {onConnect && (
              <RequireProfileScore min={50} featureName="sending connection requests">
                <Button 
                  onClick={onConnect}
                  className="bg-dna-copper hover:bg-dna-gold text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              </RequireProfileScore>
            )}
            {onMessage && (
              <RequireProfileScore min={80} featureName="messaging other members">
                <Button 
                  onClick={onMessage}
                  variant="outline"
                  className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </RequireProfileScore>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {profile.bio && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Hash className="w-5 h-5 text-dna-copper" />
              Diaspora Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-dna-mint text-dna-forest hover:bg-dna-emerald hover:text-white"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {!profile.bio && (!profile.interests || profile.interests.length === 0) && (
          <div className="text-center py-8">
            <p className="text-gray-500">This member hasn't shared much about themselves yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PublicProfileView;
