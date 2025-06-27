
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
  Heart,
  Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileViewProps {
  profile: any;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onConnect?: () => void;
  onMessage?: () => void;
}

const CONTRIBUTION_LABELS: Record<string, string> = {
  'financial': 'Financial Capital',
  'mentorship': 'Mentorship',
  'volunteering': 'Volunteering',
  'networks': 'Networks',
  'advocacy': 'Advocacy',
  'in-kind': 'In-Kind Support',
  'feedback': 'Feedback',
  'cultural-guidance': 'Cultural Guidance',
  'accountability': 'Accountability'
};

const EnhancedProfileView: React.FC<ProfileViewProps> = ({
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

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">Profile not found or incomplete.</p>
            {isOwnProfile && (
              <Button onClick={onEdit} className="bg-dna-copper hover:bg-dna-gold text-white">
                Complete Your Profile
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header Card */}
      <Card className="relative overflow-hidden">
        {/* Banner Background */}
        <div className="h-32 bg-gradient-to-r from-dna-emerald to-dna-copper relative">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        <CardContent className="relative -mt-16 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                <AvatarFallback className="bg-dna-mint text-dna-forest text-3xl font-bold">
                  {profile.full_name?.charAt(0) || profile.display_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {profile.is_verified && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-dna-gold rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-2">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.full_name || profile.display_name}
                </h1>
                {profile.headline && (
                  <p className="text-xl text-gray-600 mt-1">{profile.headline}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {profile.professional_role && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{profile.professional_role}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.diaspora_origin && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <span>{profile.diaspora_origin}</span>
                  </div>
                )}
                {profile.years_experience && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{profile.years_experience} years experience</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isOwnProfile ? (
                <Button onClick={onEdit} className="bg-dna-copper hover:bg-dna-gold text-white">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleConnect}
                    variant={isFollowing ? "outline" : "default"}
                    className={isFollowing ? "" : "bg-dna-copper hover:bg-dna-gold text-white"}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {isFollowing ? "Following" : "Connect"}
                  </Button>
                  <Button onClick={onMessage} variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - About & Goals */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-dna-forest flex items-center gap-2">
                <Heart className="w-5 h-5" />
                About
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {profile.bio || "No bio provided yet."}
              </p>
            </CardContent>
          </Card>

          {/* Goals Section */}
          {profile.my_dna_statement && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-dna-forest">DNA Goals</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {profile.my_dna_statement}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Skills Section */}
          {profile.skills && profile.skills.length > 0 && (
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
        </div>

        {/* Right Column - Quick Info */}
        <div className="space-y-6">
          {/* Professional Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-dna-forest">Professional</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.industry && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Industry</p>
                  <p className="text-gray-600">{profile.industry}</p>
                </div>
              )}
              {profile.company && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Company</p>
                  <p className="text-gray-600">{profile.company}</p>
                </div>
              )}
              {profile.linkedin_url && (
                <div>
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dna-copper hover:text-dna-gold underline"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contribution Types */}
          {profile.available_for && profile.available_for.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-dna-forest">How I Contribute</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.available_for.map((type: string, index: number) => (
                    <Badge key={index} variant="outline" className="block w-fit border-dna-copper text-dna-copper">
                      {CONTRIBUTION_LABELS[type] || type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-dna-forest">Quick Stats</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-dna-copper">
                    {profile.followers_count || 0}
                  </div>
                  <div className="text-sm text-gray-600">Connections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-dna-emerald">
                    {profile.years_experience || 0}
                  </div>
                  <div className="text-sm text-gray-600">Years Exp</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProfileView;
