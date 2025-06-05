
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Building, 
  ExternalLink, 
  Edit, 
  Phone, 
  Globe, 
  GraduationCap,
  Award,
  Users,
  Heart,
  Briefcase,
  Calendar
} from 'lucide-react';

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
  const skillsList = profile.skills ? profile.skills.split(',').map((s: string) => s.trim()) : [];
  const interestsList = profile.interests ? profile.interests.split(',').map((s: string) => s.trim()) : [];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex flex-col items-center lg:items-start">
              <Avatar className="w-40 h-40 mb-6">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                <AvatarFallback className="bg-dna-copper text-white text-3xl">
                  {profile.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex gap-3 mb-4">
                {isOwnProfile ? (
                  <Button 
                    onClick={onEdit}
                    className="bg-dna-copper hover:bg-dna-gold text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button 
                    onClick={onConnect}
                    className="bg-dna-emerald hover:bg-dna-forest text-white"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                )}
              </div>

              {/* Status Badges */}
              <div className="flex flex-col gap-2">
                {profile.availability_for_mentoring && (
                  <Badge className="bg-dna-mint text-dna-forest">
                    Available for Mentoring
                  </Badge>
                )}
                {profile.looking_for_opportunities && (
                  <Badge className="bg-dna-gold text-white">
                    Looking for Opportunities
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-dna-forest mb-2">
                {profile.full_name || 'Complete Your Profile'}
              </h1>
              
              {profile.profession && (
                <p className="text-2xl text-dna-copper font-medium mb-4">
                  {profile.profession}
                </p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {profile.company && (
                  <div className="flex items-center text-gray-600">
                    <Building className="w-5 h-5 mr-2" />
                    <span>{profile.company}</span>
                  </div>
                )}
                
                {profile.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {profile.years_experience && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{profile.years_experience} experience</span>
                  </div>
                )}

                {profile.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-5 h-5 mr-2" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>

              {/* Cultural Background */}
              {(profile.country_of_origin || profile.current_country) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-dna-forest mb-3">Cultural Background</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {profile.country_of_origin && (
                      <div className="flex items-center text-gray-600">
                        <Heart className="w-5 h-5 mr-2 text-dna-crimson" />
                        <span>From {profile.country_of_origin}</span>
                      </div>
                    )}
                    {profile.current_country && (
                      <div className="flex items-center text-gray-600">
                        <Globe className="w-5 h-5 mr-2" />
                        <span>Based in {profile.current_country}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div className="flex gap-3">
                {profile.linkedin_url && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(profile.linkedin_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                )}
                {profile.website_url && (
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
        </CardContent>
      </Card>

      {/* About Section */}
      {profile.bio && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-dna-forest mb-4">About</h3>
            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Skills & Expertise */}
      {skillsList.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-dna-forest mb-4">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill) => (
                <Badge key={skill} variant="outline" className="text-dna-forest border-dna-forest">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interests */}
      {interestsList.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-dna-forest mb-4">Interests & Passion Areas</h3>
            <div className="flex flex-wrap gap-2">
              {interestsList.map((interest) => (
                <Badge key={interest} variant="outline" className="text-dna-copper border-dna-copper">
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional Background */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {profile.education && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-dna-forest mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Education
              </h3>
              <p className="text-gray-700 whitespace-pre-line">{profile.education}</p>
            </CardContent>
          </Card>
        )}

        {profile.certifications && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-dna-forest mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Certifications
              </h3>
              <p className="text-gray-700 whitespace-pre-line">{profile.certifications}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Innovation & Impact */}
      {profile.innovation_pathways && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-dna-forest mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Innovation Pathways & Impact
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.innovation_pathways}</p>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {profile.achievements && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-dna-forest mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Key Achievements
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.achievements}</p>
          </CardContent>
        </Card>
      )}

      {/* Languages */}
      {profile.languages && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-dna-forest mb-4">Languages</h3>
            <p className="text-gray-700">{profile.languages}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedProfileDisplay;
