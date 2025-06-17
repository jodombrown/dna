
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Calendar, 
  Globe, 
  Heart, 
  Users, 
  Briefcase, 
  Edit, 
  MessageCircle, 
  UserPlus,
  Sparkles,
  Target,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfileConnectionHandlers } from './ProfileConnectionHandlers';
import { useProfileDataFetcher } from './ProfileDataFetcher';

interface EnhancedProfileDisplayProps {
  profile: any;
  isOwnProfile: boolean;
  onEdit?: () => void;
  onConnect?: () => void;
}

const EnhancedProfileDisplay: React.FC<EnhancedProfileDisplayProps> = ({ 
  profile, 
  isOwnProfile, 
  onEdit, 
  onConnect 
}) => {
  const [projects, setProjects] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { checkFollowingStatus, handleFollow } = useProfileConnectionHandlers(profile, isOwnProfile);
  const { fetchProjectsAndInitiatives } = useProfileDataFetcher(profile);

  useEffect(() => {
    if (profile?.id) {
      loadProfileData();
    }
  }, [profile?.id, isOwnProfile]);

  const loadProfileData = async () => {
    const { projects: projectsData, initiatives: initiativesData } = await fetchProjectsAndInitiatives();
    setProjects(projectsData);
    setInitiatives(initiativesData);

    if (!isOwnProfile) {
      const followingStatus = await checkFollowingStatus();
      setIsFollowing(followingStatus);
    }
  };

  const handleFollowClick = () => {
    handleFollow(isFollowing, setIsFollowing, setLoading);
  };

  const handleMessage = () => {
    if (onConnect) {
      onConnect();
    }
  };

  const defaultBanner = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80";

  return (
    <div className="space-y-8">
      {/* Unique Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dna-forest via-dna-emerald to-dna-copper">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Banner Image Overlay */}
        {profile?.banner_url && (
          <div className="absolute inset-0">
            <img 
              src={profile.banner_url}
              alt="Profile banner"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-dna-forest/70 via-dna-emerald/50 to-dna-copper/70" />
          </div>
        )}

        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Profile Picture & Basic Info */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl backdrop-blur-sm">
                  <Avatar className="w-full h-full rounded-none">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} className="object-cover" />
                    <AvatarFallback className="bg-white/20 text-white text-3xl font-bold rounded-none backdrop-blur-sm">
                      {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {profile?.is_verified && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-dna-gold rounded-full flex items-center justify-center shadow-lg">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {profile?.full_name || 'Professional Name'}
              </h1>
              
              <p className="text-xl text-white/90 mb-4 max-w-md">
                {profile?.profession || 'Professional Title'}
              </p>
              
              {profile?.company && (
                <div className="flex items-center gap-2 text-white/80 mb-4">
                  <Briefcase className="w-4 h-4" />
                  <span>{profile.company}</span>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {profile?.location && (
                  <div className="flex items-center gap-1 text-white/80">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                )}
                {profile?.country_of_origin && (
                  <div className="flex items-center gap-1 text-white/80">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">{profile.country_of_origin}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons & Stats */}
            <div className="flex-1 flex flex-col items-end space-y-6">
              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                {isOwnProfile ? (
                  <Button 
                    onClick={onEdit}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleFollowClick}
                      disabled={loading}
                      className={`${isFollowing 
                        ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30' 
                        : 'bg-white hover:bg-white/90 text-dna-forest'
                      } backdrop-blur-sm`}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {loading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Button 
                      onClick={handleMessage}
                      className="bg-dna-copper hover:bg-dna-gold text-white"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">12</div>
                  <div className="text-sm text-white/80">Projects</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">350</div>
                  <div className="text-sm text-white/80">Connections</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">5</div>
                  <div className="text-sm text-white/80">Years Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section with Modern Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main About Card */}
        <Card className="lg:col-span-2 border-2 border-dna-mint/20 hover:border-dna-mint/40 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-dna-coral" />
              <h3 className="text-xl font-semibold text-dna-forest">About</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {profile?.bio || 'Professional biography and story will appear here. Share your journey, passions, and what drives you to make an impact in your community and beyond.'}
            </p>
          </CardContent>
        </Card>

        {/* Skills & Impact Card */}
        <Card className="border-2 border-dna-emerald/20 hover:border-dna-emerald/40 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-dna-emerald" />
              <h3 className="text-lg font-semibold text-dna-forest">Skills & Impact</h3>
            </div>
            <div className="space-y-3">
              {profile?.skills?.slice(0, 6).map((skill: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-dna-emerald/10 text-dna-forest">
                  {skill}
                </Badge>
              )) || (
                <p className="text-sm text-gray-500">Skills will be displayed here</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cultural Heritage Section */}
      {profile?.country_of_origin && (
        <Card className="border-2 border-dna-gold/20 bg-gradient-to-r from-dna-gold/5 to-dna-copper/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-dna-gold" />
              <h3 className="text-xl font-semibold text-dna-forest">Cultural Heritage & Impact</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-dna-forest mb-2">Heritage</h4>
                <p className="text-gray-700">
                  Proudly representing {profile.country_of_origin} in the global diaspora community
                </p>
              </div>
              <div>
                <h4 className="font-medium text-dna-forest mb-2">Impact Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {profile?.impact_areas?.map((area: string, index: number) => (
                    <Badge key={index} variant="outline" className="border-dna-gold text-dna-gold">
                      {area}
                    </Badge>
                  )) || (
                    <p className="text-sm text-gray-500">Impact areas will be displayed here</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedProfileDisplay;
