import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BadgeWidget from '@/components/profile/BadgeWidget';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Users, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { canView } from '@/utils/privacy';

const Profile = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  // Visibility and normalized links
  const visibility = (profile as any)?.visibility || {};
  const linksObj = (profile as any)?.links || {};
  const normalizedLinks = {
    linkedin: profile?.linkedin_url || linksObj.linkedin || '',
    website: profile?.website_url || linksObj.website || '',
    twitter: linksObj.twitter || ''
  };

  // Use database-calculated completion score
  const completionScore = profile?.profile_completeness_score || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-dna-forest">My Profile</h1>
            <Button onClick={() => navigate('/app/profile/edit')}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-lg">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-dna-forest">
                    {profile?.full_name || 'Complete your profile'}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {profile?.headline || profile?.profession || 'DNA Member'}
                  </p>
                  {profile?.location && canView(visibility, 'location', { isSelf: true }) && (
                    <p className="text-sm text-muted-foreground">📍 {profile.location}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>Profile views: 12</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Connections: {profile?.connections_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>Profile: {completionScore}% complete</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {profile?.bio || 'Share your story, background, and what drives your connection to Africa and the diaspora.'}
            </p>
            {profile?.intro_text && (
              <div className="mt-4 p-4 bg-dna-mint/10 rounded-lg border-l-4 border-dna-emerald">
                <h4 className="font-medium text-dna-forest mb-2">My DNA Statement</h4>
                <p className="text-gray-700">{profile.intro_text}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills & Expertise */}
        {profile?.skills && profile.skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Impact Areas */}
        {profile?.impact_areas && profile.impact_areas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Impact Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.impact_areas.map((area) => (
                  <Badge key={area} variant="outline" className="border-dna-emerald text-dna-forest">
                    {area}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact & Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {canView(visibility, 'email', { isSelf: true }) && (
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
            )}
            {canView(visibility, 'links', { isSelf: true }) && (
              <>
                {normalizedLinks.linkedin && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">LinkedIn</label>
                    <a
                      href={normalizedLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dna-emerald hover:underline block"
                    >
                      {normalizedLinks.linkedin}
                    </a>
                  </div>
                )}
                {normalizedLinks.website && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Website</label>
                    <a
                      href={normalizedLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dna-emerald hover:underline block"
                    >
                      {normalizedLinks.website}
                    </a>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Badges Section */}
        {user?.id && <BadgeWidget userId={user.id} />}
      </div>
    </div>
  );
};

export default Profile;