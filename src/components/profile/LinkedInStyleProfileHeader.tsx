import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, Globe, Linkedin, Edit2 } from 'lucide-react';
import { useAuth } from '@/contexts/CleanAuthContext';
import ProfileActionButtons from './ProfileActionButtons';

interface LinkedInStyleProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  onEdit?: () => void;
  onFollow?: () => void;
  onMessage?: () => void;
}

const LinkedInStyleProfileHeader: React.FC<LinkedInStyleProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  onEdit,
  onFollow,
  onMessage
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleViewProfile = () => {
    if (profile?.id && !isOwnProfile) {
      navigate(`/profile/${profile.id}`);
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-r from-dna-emerald to-dna-forest relative">
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <CardContent className="relative px-6 pb-6">
        {/* Profile Picture */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 relative z-10">
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
            <AvatarImage 
              src={profile?.avatar_url || profile?.profile_picture_url} 
              alt={profile?.full_name}
              className="object-cover"
            />
            <AvatarFallback className="bg-dna-mint text-dna-forest text-2xl font-semibold">
              {profile?.full_name?.charAt(0) || profile?.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 sm:ml-4 sm:pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.full_name || profile?.display_name || 'DNA Member'}
                </h1>
                {profile?.professional_role && (
                  <p className="text-lg text-gray-700 font-medium">
                    {profile.professional_role}
                  </p>
                )}
                {profile?.company && (
                  <p className="text-gray-600">
                    {profile.company}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {profile?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile?.current_country && profile.location !== profile.current_country && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <span>{profile.current_country}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                {isOwnProfile ? (
                  <Button 
                    onClick={onEdit}
                    variant="outline"
                    className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  user && profile?.id && (
                    <ProfileActionButtons
                      targetUserId={profile.id}
                      targetUserName={profile.full_name || profile.display_name || 'Professional'}
                      isOwnProfile={false}
                    />
                  )
                )}
              </div>
            </div>

            {/* Contact Links */}
            {(profile?.linkedin_url || profile?.website_url) && (
              <div className="flex gap-4 mt-4">
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile?.bio && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-700 leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LinkedInStyleProfileHeader;
