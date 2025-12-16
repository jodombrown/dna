import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, MapPin, Globe, Briefcase, MessageCircle, UserPlus } from 'lucide-react';
import { ProfileV2Data, ProfileV2Permissions, VerificationStatus } from '@/types/profileV2';
import { useToast } from '@/hooks/use-toast';
import { ProfileShareDropdown } from '@/components/profile/ProfileShareDropdown';

interface ProfileV2HeroProps {
  profile: ProfileV2Data;
  permissions: ProfileV2Permissions;
  onEdit?: () => void;
  onConnect?: () => void;
  onMessage?: () => void;
}

// Returns ring styling for verified avatars - amber for full, primary for soft
const getVerificationRingClass = (status: VerificationStatus): string => {
  if (status === 'fully_verified') {
    return 'ring-4 ring-amber-500/80 ring-offset-2 ring-offset-background';
  }
  if (status === 'soft_verified') {
    return 'ring-4 ring-primary/60 ring-offset-2 ring-offset-background';
  }
  return '';
};

const ProfileV2Hero: React.FC<ProfileV2HeroProps> = ({
  profile,
  permissions,
  onEdit,
  onConnect,
  onMessage,
}) => {
  const { toast } = useToast();

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/dna/${profile.username}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: 'Link copied!',
        description: 'Profile link copied to clipboard',
      });
    } catch {
      toast({
        title: 'Share profile',
        description: profileUrl,
      });
    }
  };

  return (
    <div className="relative w-full">
      {/* Banner */}
      <div
        className="h-32 sm:h-44 md:h-56 w-full bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30"
        style={profile.banner_url ? {
          backgroundImage: `url(${profile.banner_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      />

      {/* Content Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Avatar & Actions Row */}
        <div className="relative -mt-14 sm:-mt-18 md:-mt-20">
          <div className="flex items-end justify-between gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className={`w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 border-4 border-background shadow-xl ${getVerificationRingClass(profile.verification_status)}`}>
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                <AvatarFallback className="text-xl sm:text-2xl md:text-3xl font-bold bg-primary text-primary-foreground">
                  {profile.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex gap-2 pb-2">
              {permissions.is_owner ? (
                <>
                  {onEdit && (
                    <Button onClick={onEdit} size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                  <ProfileShareDropdown
                    username={profile.username || ''}
                    fullName={profile.full_name}
                    profile={profile}
                    showDownload={true}
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 h-10"
                  />
                </>
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

        {/* User Info Section */}
        <div className="pt-3 sm:pt-4 pb-4 sm:pb-6">
          <div className="flex flex-col gap-2 sm:gap-3">
            {/* Name & Username */}
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
                {profile.full_name}
              </h1>
              <p className="text-muted-foreground text-sm">@{profile.username}</p>
            </div>

            {/* Headline */}
            {profile.headline && (
              <p className="text-sm sm:text-base md:text-lg text-foreground leading-snug">
                {profile.headline}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs sm:text-sm text-muted-foreground">
              {profile.professional_role && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate max-w-[150px] sm:max-w-none">{profile.professional_role}</span>
                </div>
              )}
              {profile.company && (
                <span className="text-muted-foreground/70">at {profile.company}</span>
              )}
              {(profile.location || profile.current_country) && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate max-w-[150px] sm:max-w-none">
                    <span className="text-muted-foreground/70">Based in </span>
                    {profile.location || profile.current_country}
                  </span>
                </div>
              )}
              {profile.country_of_origin && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate max-w-[150px] sm:max-w-none">
                    <span className="text-muted-foreground/70">From </span>
                    {profile.country_of_origin}
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex gap-2 md:hidden pt-2">
              {permissions.is_owner ? (
                <>
                  {onEdit && (
                    <Button onClick={onEdit} className="flex-1" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                  <ProfileShareDropdown
                    username={profile.username || ''}
                    fullName={profile.full_name}
                    profile={profile}
                    showDownload={true}
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 h-10"
                  />
                </>
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
                  <ProfileShareDropdown
                    username={profile.username || ''}
                    fullName={profile.full_name}
                    profile={profile}
                    showDownload={true}
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 h-9"
                  />
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
