
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, MapPin, Briefcase, Globe, Linkedin } from 'lucide-react';
import RoleBadge from '@/components/RoleBadge';
import { UserRole } from '@/hooks/useUserRoles';

interface ProfileData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  professional_role: string | null;
  current_country: string | null;
  interests: string[] | null;
  bio: string | null;
  user_role?: UserRole;
  company?: string | null;
  linkedin_url?: string | null;
  website_url?: string | null;
}

interface UserProfileViewProps {
  profile: ProfileData;
  onEdit: () => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ profile, onEdit }) => {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="pt-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : '?'}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-grow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profile.full_name || 'Unknown User'}
                    </h1>
                    {profile.user_role && (
                      <RoleBadge role={profile.user_role} />
                    )}
                  </div>
                  {profile.professional_role && (
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{profile.professional_role}</span>
                      {profile.company && <span>at {profile.company}</span>}
                    </div>
                  )}
                  {profile.current_country && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.current_country}</span>
                    </div>
                  )}
                </div>
                <Button onClick={onEdit} variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              {/* Links */}
              {(profile.website_url || profile.linkedin_url) && (
                <div className="flex gap-4 mb-4">
                  {profile.website_url && (
                    <a 
                      href={profile.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-dna-emerald hover:text-dna-forest"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a 
                      href={profile.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-dna-emerald hover:text-dna-forest"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-700 leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="bg-dna-mint/20 text-dna-forest">
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserProfileView;
