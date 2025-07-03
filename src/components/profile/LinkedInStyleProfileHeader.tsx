
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Edit, 
  MapPin, 
  Building, 
  Users, 
  UserPlus,
  MessageCircle,
  ExternalLink,
  Camera,
  Globe,
  Heart
} from 'lucide-react';

interface ProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  onEdit?: () => void;
  onFollow?: () => void;
  onMessage?: () => void;
  isFollowing?: boolean;
}

const LinkedInStyleProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  profile, 
  isOwnProfile, 
  onEdit, 
  onFollow, 
  onMessage,
  isFollowing = false
}) => {
  const [bannerImageError, setBannerImageError] = useState(false);

  const defaultBanner = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80";
  
  // Check if this is Jaûne Odombrown and set the profile image
  const isJauneProfile = profile?.full_name === "Jaûne Odombrown";
  const profileImageUrl = isJauneProfile ? "/lovable-uploads/aaee598a-95b1-4777-a456-a833d148a286.png" : profile?.avatar_url;
  
  // Update professional role for Jaûne
  const professionalRole = isJauneProfile && profile?.professional_role?.includes("Executive") 
    ? profile.professional_role.replace("Executive Officer", "Visionary Officer")
    : profile?.professional_role;

  return (
    <Card className="overflow-hidden">
      {/* Banner Section */}
      <div className="relative h-48 md:h-64">
        <img
          src={bannerImageError ? defaultBanner : (profile?.banner_image_url || defaultBanner)}
          alt="Profile banner"
          className="w-full h-full object-cover"
          onError={() => setBannerImageError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        {isOwnProfile && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30"
          >
            <Camera className="w-4 h-4 mr-2" />
            Edit Banner
          </Button>
        )}
      </div>

      <CardContent className="relative p-8">
        {/* Profile Photo & Basic Info */}
        <div className="flex flex-col lg:flex-row gap-6 -mt-16 relative z-10">
          <div className="flex flex-col items-center lg:items-start">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={profileImageUrl} alt={profile?.full_name} />
                <AvatarFallback className="bg-dna-copper text-white text-3xl">
                  {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Connection Stats */}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{profile?.followers_count || 0} followers</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{profile?.following_count || 0} following</span>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-col lg:flex-row justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-dna-forest mb-2">
                  {profile?.full_name || 'Complete Your Profile'}
                </h1>
                
                {profile?.headline && (
                  <p className="text-xl text-gray-700 mb-3 font-medium">
                    {profile.headline}
                  </p>
                )}

                {professionalRole && (
                  <p className="text-lg text-dna-copper mb-2">
                    {professionalRole}
                    {profile?.organization && ` at ${profile.organization}`}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  {profile?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.city ? `${profile.city}, ` : ''}{profile.location}</span>
                    </div>
                  )}
                  
                  {profile?.diaspora_origin && (
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-dna-crimson" />
                      <span>From {profile.diaspora_origin}</span>
                    </div>
                  )}

                  {profile?.industry && (
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      <span>{profile.industry}</span>
                    </div>
                  )}
                </div>

                {/* Engagement Intentions */}
                {profile?.engagement_intentions && profile.engagement_intentions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.engagement_intentions.map((intention: string) => (
                      <Badge 
                        key={intention} 
                        variant="outline" 
                        className="text-dna-forest border-dna-forest"
                      >
                        {intention}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  {profile?.availability_for_mentoring && (
                    <Badge className="bg-dna-mint text-dna-forest">
                      Available for Mentoring
                    </Badge>
                  )}
                  {profile?.looking_for_opportunities && (
                    <Badge className="bg-dna-gold text-white">
                      Open to Opportunities
                    </Badge>
                  )}
                  {profile?.available_for && profile.available_for.length > 0 && (
                    <Badge variant="outline" className="text-dna-copper border-dna-copper">
                      Available for {profile.available_for[0]}
                      {profile.available_for.length > 1 && ` +${profile.available_for.length - 1}`}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 lg:mt-0">
                {isOwnProfile ? (
                  <Button 
                    onClick={onEdit}
                    className="bg-dna-copper hover:bg-dna-gold text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={onFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className={isFollowing ? 
                        "border-dna-forest text-dna-forest hover:bg-dna-forest hover:text-white" : 
                        "bg-dna-emerald hover:bg-dna-forest text-white"
                      }
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Button 
                      onClick={onMessage}
                      variant="outline"
                      className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </>
                )}
                
                {/* External Links */}
                {profile?.linkedin_url && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(profile.linkedin_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                )}
                {profile?.website_url && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(profile.website_url, '_blank')}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DNA Statement */}
        {profile?.my_dna_statement && (
          <div className="mt-6 p-4 bg-dna-mint/10 rounded-lg border-l-4 border-dna-mint">
            <h3 className="font-semibold text-dna-forest mb-2">My DNA Statement</h3>
            <p className="text-gray-700 italic leading-relaxed">"{profile.my_dna_statement}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LinkedInStyleProfileHeader;
