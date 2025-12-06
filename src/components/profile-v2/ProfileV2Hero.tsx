import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, Award, MapPin, Globe, Briefcase, MessageCircle, UserPlus } from 'lucide-react';
import { ProfileV2Data, ProfileV2Permissions, VerificationStatus } from '@/types/profileV2';

interface ProfileV2HeroProps {
  profile: ProfileV2Data;
  permissions: ProfileV2Permissions;
  onEdit?: () => void;
  onConnect?: () => void;
  onMessage?: () => void;
}

const getVerificationBadge = (status: VerificationStatus) => {
  if (status === 'fully_verified') {
    return (
      <div className="absolute bottom-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-background shadow-lg">
        <Award className="w-5 h-5 text-primary-foreground" />
      </div>
    );
  }
  if (status === 'soft_verified') {
    return (
      <div className="absolute bottom-2 right-2 w-8 h-8 bg-background rounded-full flex items-center justify-center border-2 border-primary shadow-lg">
        <Award className="w-5 h-5 text-primary" />
      </div>
    );
  }
  return null;
};

const ProfileV2Hero: React.FC<ProfileV2HeroProps> = ({
  profile,
  permissions,
  onEdit,
  onConnect,
  onMessage,
}) => {
  return (
    <div className="relative w-full">
      {/* Banner */}
      <div
        className="h-32 sm:h-48 md:h-64 w-full bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30"
        style={profile.banner_url ? {
          backgroundImage: `url(${profile.banner_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      />

      {/* Profile Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-12 sm:-mt-16 pb-4 sm:pb-6">
          {/* Avatar + Info Row */}
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shadow-xl">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                <AvatarFallback className="text-xl sm:text-2xl font-bold bg-primary text-primary-foreground">
                  {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {getVerificationBadge(profile.verification_status)}
            </div>

            {/* Name & Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">
                    {profile.full_name}
                  </h1>
                  <p className="text-muted-foreground text-xs sm:text-sm">@{profile.username}</p>

                  {profile.headline && (
                    <p className="text-sm sm:text-base md:text-lg text-foreground mt-2 line-clamp-2">
                      {profile.headline}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs sm:text-sm text-muted-foreground">
                    {profile.professional_role && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{profile.professional_role}</span>
                      </div>
                    )}
                    {profile.company && <span>• {profile.company}</span>}
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.country_of_origin && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        <span>{profile.country_of_origin}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 w-full md:w-auto shrink-0">
                  {permissions.is_owner && onEdit ? (
                    <Button onClick={onEdit} className="w-full md:w-auto" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Edit Profile</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                  ) : (
                    <>
                      {permissions.can_connect && onConnect && (
                        <Button onClick={onConnect} className="flex-1 md:flex-initial" size="sm">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                      )}
                      {onMessage && (
                        <Button onClick={onMessage} variant="outline" className="flex-1 md:flex-initial" size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileV2Hero;
