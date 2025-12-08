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
        className="h-40 sm:h-52 md:h-64 w-full bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30"
        style={profile.banner_url ? {
          backgroundImage: `url(${profile.banner_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      />

      {/* Avatar positioned at bottom of banner */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 sm:-mt-20">
          <div className="flex items-end justify-between">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-28 h-28 sm:w-36 sm:h-36 border-4 border-background shadow-xl">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-primary text-primary-foreground">
                  {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {getVerificationBadge(profile.verification_status)}
            </div>

            {/* Action Buttons - positioned at banner level on desktop */}
            <div className="hidden md:flex gap-2 mb-4">
              {permissions.is_owner && onEdit ? (
                <Button onClick={onEdit} size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  {permissions.can_connect && onConnect && (
                    <Button onClick={onConnect} size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                  {onMessage && (
                    <Button onClick={onMessage} variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* User Info Section - Below avatar, clean separation */}
        <div className="pt-4 pb-6">
          <div className="flex flex-col gap-3">
            {/* Name & Username */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {profile.full_name}
              </h1>
              <p className="text-muted-foreground text-sm">@{profile.username}</p>
            </div>

            {/* Headline */}
            {profile.headline && (
              <p className="text-base sm:text-lg text-foreground">
                {profile.headline}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {profile.professional_role && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span>{profile.professional_role}</span>
                </div>
              )}
              {profile.company && (
                <span className="text-muted-foreground/70">at {profile.company}</span>
              )}
              {profile.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.country_of_origin && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>{profile.country_of_origin}</span>
                </div>
              )}
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex gap-2 md:hidden pt-2">
              {permissions.is_owner && onEdit ? (
                <Button onClick={onEdit} className="flex-1" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  {permissions.can_connect && onConnect && (
                    <Button onClick={onConnect} className="flex-1" size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                  {onMessage && (
                    <Button onClick={onMessage} variant="outline" className="flex-1" size="sm">
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
  );
};

export default ProfileV2Hero;
