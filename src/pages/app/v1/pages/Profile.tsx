import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Edit, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Users, 
  Trophy, 
  Archive, 
  AlertCircle,
  Mail,
  Globe,
  Linkedin
} from 'lucide-react';

const Profile = () => {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Legacy Profile Header */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Archive className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-amber-800">Legacy Profile (v1)</CardTitle>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              Read-Only Archive
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-700 text-sm mb-2">
                This is your archived v1 profile. All data is preserved but editing is disabled.
              </p>
              <p className="text-amber-600 text-xs">
                Profile editing and updates are available in the v2 platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-2xl">
                {profile.display_name?.charAt(0) || profile.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.display_name || profile.full_name || 'DNA Member'}
                  </h1>
                  <p className="text-lg text-gray-600">
                    {profile.current_role || profile.headline || 'Community Member'}
                  </p>
                </div>
                <Button variant="outline" disabled className="mt-2 md:mt-0 text-gray-500">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile (v1 Archived)
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {profile.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profile.location}
                  </div>
                )}
                {profile.company && (
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-1" />
                    {profile.company}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                {profile.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-1" />
                    {profile.email}
                  </div>
                )}
                {profile.website_url && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="w-4 h-4 mr-1" />
                    <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                      Website
                    </a>
                  </div>
                )}
                {profile.linkedin_url && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Linkedin className="w-4 h-4 mr-1" />
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">About</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Connections</CardTitle>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">247</div>
            <p className="text-xs text-gray-500 mt-1">v1 network</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Profile Views</CardTitle>
              <Trophy className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">1,234</div>
            <p className="text-xs text-gray-500 mt-1">lifetime views</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Completeness</CardTitle>
              <Trophy className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{profile.profile_completeness_score || 0}%</div>
            <p className="text-xs text-gray-500 mt-1">profile score</p>
          </CardContent>
        </Card>
      </div>

      {/* Skills & Interests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profile.skills && profile.skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Legacy Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>v1 Platform Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Activity History</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• 47 events attended</p>
                <p>• 156 posts created</p>
                <p>• 2,341 messages sent</p>
                <p>• 89 collaborations initiated</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Achievements</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Community Builder Badge</p>
                <p>• Early Adopter Status</p>
                <p>• Verified Professional</p>
                <p>• Top Connector (Q2 2024)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;