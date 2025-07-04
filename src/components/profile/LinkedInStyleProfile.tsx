import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Edit, 
  MessageCircle, 
  UserPlus, 
  MapPin, 
  Briefcase, 
  Calendar,
  Globe,
  Award,
  Users,
  Eye,
  TrendingUp,
  Plus,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/CleanAuthContext';

interface LinkedInStyleProfileProps {
  profile: any;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onConnect?: () => void;
  onMessage?: () => void;
}

const LinkedInStyleProfile: React.FC<LinkedInStyleProfileProps> = ({
  profile,
  isOwnProfile = false,
  onEdit,
  onConnect,
  onMessage
}) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);

  const handleConnect = () => {
    setIsFollowing(!isFollowing);
    if (onConnect) onConnect();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column - Profile Card & Quick Info */}
          <div className="col-span-3 space-y-6">
            {/* Main Profile Card */}
            <Card className="overflow-hidden">
              {/* Banner */}
              <div className="h-24 bg-gradient-to-r from-dna-emerald to-dna-copper relative">
                {profile?.banner_url && (
                  <img 
                    src={profile.banner_url} 
                    alt="Profile banner"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <CardContent className="p-6 relative">
                {/* Profile Picture */}
                <div className="flex flex-col items-center -mt-12 mb-4">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                    <AvatarFallback className="bg-dna-mint text-dna-forest text-2xl font-bold">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {profile?.is_verified && (
                    <Award className="w-5 h-5 text-dna-gold mt-2" />
                  )}
                </div>

                {/* Name & Headline */}
                <div className="text-center mb-4">
                  <h1 className="text-xl font-bold text-gray-900 mb-1">
                    {profile?.full_name || 'Professional Name'}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {profile?.headline || profile?.profession || 'Professional Title'}
                  </p>
                  {profile?.company && (
                    <p className="text-gray-500 text-sm">{profile.company}</p>
                  )}
                </div>

                {/* Location */}
                {profile?.location && (
                  <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  {isOwnProfile ? (
                    <Button onClick={onEdit} className="w-full bg-dna-copper hover:bg-dna-gold text-white">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleConnect}
                        className={`w-full ${isFollowing 
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                          : 'bg-dna-copper hover:bg-dna-gold text-white'
                        }`}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                      <Button onClick={onMessage} variant="outline" className="w-full">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </>
                  )}
                </div>

                {/* Profile Stats */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Profile viewers</span>
                    <span className="text-dna-emerald font-medium">32</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Connections</span>
                    <span className="text-dna-emerald font-medium">156</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Card - Only for own profile */}
            {isOwnProfile && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-dna-emerald" />
                    <h3 className="font-semibold text-sm">Analytics</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">32 profile views</p>
                      <p className="text-xs text-gray-500">Discover who's viewed your profile</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">89 post impressions</p>
                      <p className="text-xs text-gray-500">Check out who's engaging with your posts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Suggested Connections - Only for other profiles */}
            {!isOwnProfile && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-dna-emerald" />
                    <h3 className="font-semibold text-sm">People also viewed</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>U{i}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Professional {i}</p>
                        <p className="text-xs text-gray-500 truncate">Title at Company</p>
                        <Button size="sm" variant="outline" className="mt-1 h-6 text-xs">
                          <Plus className="w-3 h-3 mr-1" />
                          Follow
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Center Column - Main Content */}
          <div className="col-span-6 space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-dna-forest">About</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {profile?.bio || "Welcome to my professional profile. I'm passionate about driving innovation and creating meaningful impact in the African diaspora community. My expertise spans across technology, entrepreneurship, and community building."}
                </p>
              </CardContent>
            </Card>

            {/* Experience Section */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-dna-forest">Experience</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-dna-mint rounded flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-dna-forest" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{profile?.profession || 'Current Position'}</h4>
                    <p className="text-gray-600">{profile?.company || 'Company Name'}</p>
                    <p className="text-sm text-gray-500">
                      {profile?.years_experience ? `${profile.years_experience} years` : 'Present'}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      Leading initiatives that drive community engagement and professional development.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Section */}
            {profile?.skills && profile.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-dna-forest">Skills</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-dna-emerald/10 text-dna-forest">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Section */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-dna-forest">Activity</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm">Recent posts and activities will appear here</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Additional Info & Recommendations */}
          <div className="col-span-3 space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-sm">Contact Info</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile?.linkedin_url && (
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                    <a 
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-dna-copper hover:text-dna-gold"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {profile?.website_url && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a 
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-dna-copper hover:text-dna-gold"
                    >
                      Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Diaspora Heritage */}
            {profile?.country_of_origin && (
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="font-semibold text-sm">Heritage</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-dna-gold" />
                    <span className="text-sm">{profile.country_of_origin}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contribution Types */}
            {profile?.available_for && profile.available_for.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="font-semibold text-sm">How I Contribute</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profile.available_for.map((type: string, index: number) => (
                      <Badge key={index} variant="outline" className="block w-fit border-dna-copper text-dna-copper">
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interests */}
            {profile?.interests && profile.interests.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="font-semibold text-sm">Interests</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInStyleProfile;